import { OBJECT_ITEM_ID, type SyncedStoreConfig } from "@/lib/sync/stores";

/**
 * Converting between a store's local value and its sync items, plus the
 * deterministic three-way merge used when two devices changed the same item.
 */

/** JSON with object keys sorted, so equal values always serialise equally (Postgres jsonb reorders keys). */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item === undefined ? null : item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

/** 53-bit non-cryptographic hash (cyrb53). Change detection only. */
export function contentHash(value: unknown): string {
  const input = canonicalJson(value);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function sameContent(a: unknown, b: unknown): boolean {
  return canonicalJson(a) === canonicalJson(b);
}

/** Ordered item map. Order is kept so a reconstructed list matches the local one. */
export type ItemMap = Map<string, unknown>;

export function toItems(config: SyncedStoreConfig, value: unknown): ItemMap {
  const items: ItemMap = new Map();
  if (value == null) return items;
  switch (config.kind) {
    case "list-of-strings":
      if (Array.isArray(value)) for (const entry of value) if (typeof entry === "string" && entry) items.set(entry, true);
      break;
    case "list-by-id":
      if (Array.isArray(value) && config.idField) {
        for (const entry of value) {
          if (!entry || typeof entry !== "object") continue;
          const id = (entry as Record<string, unknown>)[config.idField];
          if ((typeof id === "string" && id) || typeof id === "number") items.set(String(id), entry);
        }
      }
      break;
    case "record":
      if (typeof value === "object" && !Array.isArray(value)) {
        for (const [id, entry] of Object.entries(value as Record<string, unknown>)) if (entry !== undefined) items.set(id, entry);
      }
      break;
    case "object":
      if (typeof value === "object" && !Array.isArray(value)) items.set(OBJECT_ITEM_ID, value);
      break;
  }
  return items;
}

/**
 * Rebuilds a store value. `previousOrder` is the item order before the merge;
 * items that are new to this device go at the start or end per config.
 */
export function fromItems(config: SyncedStoreConfig, items: ItemMap, previousOrder: string[]): unknown {
  const known = previousOrder.filter((id) => items.has(id));
  const knownSet = new Set(known);
  const fresh = [...items.keys()].filter((id) => !knownSet.has(id));
  const order = config.insertNew === "start" ? [...fresh, ...known] : [...known, ...fresh];
  switch (config.kind) {
    case "list-of-strings":
      return order;
    case "list-by-id":
      return order.map((id) => items.get(id));
    case "record":
      return Object.fromEntries(order.map((id) => [id, items.get(id)]));
    case "object":
      return items.has(OBJECT_ITEM_ID) ? items.get(OBJECT_ITEM_ID) : null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Domain recency of an item, used ONLY when there is no common base to
 * compare against (a device's first sync, or adopting guest data). Normal
 * sync never relies on it — revisions decide.
 */
export function domainTimestamp(item: unknown): number {
  if (!isPlainObject(item)) return 0;
  const candidates = [item.updatedAt, item.lastReviewedAt, item.completedAt, item.openedAt, item.savedAt, item.createdAt];
  let best = 0;
  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const time = Date.parse(value);
    if (Number.isFinite(time) && time > best) best = time;
  }
  return best;
}

/**
 * Three-way merge of one item that both this device and the server changed.
 *
 * With a base: field by field, a field this device changed keeps the local
 * value; every other field takes the server's. So two devices editing
 * different fields of the same item both keep their edit.
 *
 * Without a base (first sync / adoption): fields present on only one side are
 * kept, and conflicting fields take the side with the later domain timestamp,
 * falling back to the server. Deterministic for a given pair of inputs.
 */
export function mergeItem(base: unknown, local: unknown, remote: unknown): unknown {
  if (sameContent(local, remote)) return remote;
  if (!isPlainObject(local) || !isPlainObject(remote)) {
    if (base !== undefined) return sameContent(local, base) ? remote : local;
    return domainTimestamp(local) > domainTimestamp(remote) ? local : remote;
  }

  const merged: Record<string, unknown> = { ...remote };
  if (isPlainObject(base)) {
    for (const key of new Set([...Object.keys(local), ...Object.keys(base)])) {
      const localChanged = !sameContent(local[key], base[key]);
      if (!localChanged) continue;
      if (local[key] === undefined) delete merged[key];
      else if (isPlainObject(local[key]) && isPlainObject(remote[key]) && isPlainObject(base[key])) {
        merged[key] = mergeItem(base[key], local[key], remote[key]);
      } else merged[key] = local[key];
    }
    return merged;
  }

  const preferLocal = domainTimestamp(local) > domainTimestamp(remote);
  for (const [key, value] of Object.entries(local)) {
    if (!(key in merged)) merged[key] = value;
    else if (preferLocal) merged[key] = value;
  }
  return merged;
}
