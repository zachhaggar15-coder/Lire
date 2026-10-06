/**
 * Minimal, faithful stand-ins for browser storage in Node tests.
 *
 * `createStorage` implements the full Web Storage interface (length, key(),
 * getItem, setItem, removeItem, clear) — partition code iterates keys, so a
 * Map with only get/set would hide bugs. It can simulate a quota limit and
 * injected failures, which is how persistence-failure paths are tested.
 */

export function createStorage({ quotaBytes = Infinity } = {}) {
  const data = new Map();
  let failNextWrites = 0;
  let failAllWrites = false;
  let failReads = false;

  const used = () => {
    let total = 0;
    for (const [k, v] of data) total += (k.length + v.length) * 2;
    return total;
  };

  const quotaError = () => {
    const error = new Error("The quota has been exceeded.");
    error.name = "QuotaExceededError";
    error.code = 22;
    return error;
  };

  const storage = {
    get length() {
      return data.size;
    },
    key(index) {
      return [...data.keys()][index] ?? null;
    },
    getItem(key) {
      if (failReads) throw new Error("SecurityError: storage denied");
      return data.has(String(key)) ? data.get(String(key)) : null;
    },
    setItem(key, value) {
      if (failAllWrites) throw quotaError();
      if (failNextWrites > 0) {
        failNextWrites -= 1;
        throw quotaError();
      }
      const k = String(key);
      const v = String(value);
      const previous = data.get(k);
      data.set(k, v);
      if (used() > quotaBytes) {
        if (previous === undefined) data.delete(k);
        else data.set(k, previous);
        throw quotaError();
      }
    },
    removeItem(key) {
      data.delete(String(key));
    },
    clear() {
      data.clear();
    },
  };

  const control = {
    storage,
    data,
    failNextWrites(n = 1) {
      failNextWrites = n;
    },
    failAllWrites(on = true) {
      failAllWrites = on;
    },
    failReads(on = true) {
      failReads = on;
    },
    snapshot() {
      return new Map(data);
    },
  };
  return control;
}

/** Installs a fresh `window` with the given storage on globalThis. */
export function installWindow(storageControl, extra = {}) {
  const listeners = new Map();
  globalThis.window = {
    localStorage: storageControl.storage,
    sessionStorage: createStorage().storage,
    location: { origin: "https://sorlio.test", href: "https://sorlio.test/", pathname: "/", reload() {} },
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      listeners.get(type)?.delete(fn);
    },
    dispatchEvent(event) {
      for (const fn of listeners.get(event.type) ?? []) fn(event);
      return true;
    },
    ...extra,
  };
  if (typeof globalThis.CustomEvent === "undefined") {
    globalThis.CustomEvent = class CustomEvent extends Event {
      constructor(type, init) {
        super(type);
        this.detail = init?.detail;
      }
    };
  }
  return globalThis.window;
}

/** A tiny test runner: named checks, a summary, and a non-zero exit on failure. */
export function createRunner(title) {
  let passed = 0;
  const failures = [];
  return {
    check(label, condition, detail = "") {
      if (condition) passed += 1;
      else failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    },
    async section(name, fn) {
      try {
        await fn();
      } catch (error) {
        failures.push(`${name} threw: ${error?.stack ?? error}`);
      }
    },
    finish() {
      if (failures.length) {
        console.error(`\n${title}: ${failures.length} failed, ${passed} passed`);
        for (const failure of failures) console.error(`  ✗ ${failure}`);
        process.exit(1);
      }
      console.log(`${title}: ${passed} checks passed`);
    },
  };
}
