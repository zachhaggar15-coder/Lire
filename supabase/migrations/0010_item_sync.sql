-- 0010 · Item-level sync with server-assigned revisions
--
-- Replaces the whole-store upsert model of 0002 for all new clients.
--
-- What was wrong with 0002
--   Each device uploaded an entire store (every saved word, say) as one JSONB
--   value, with `updated_at` taken from the device clock. Two devices editing
--   different words overwrote each other's row; a stale device could
--   resurrect deleted items; correctness depended on clocks agreeing; and a
--   failed write was reported to the reader as a successful sync.
--
-- The model here
--   * One row per (user, store, item). Unrelated edits never touch the same
--     row, so they cannot overwrite each other.
--   * Every write is stamped with a per-user revision number taken from a
--     counter under a row lock. Revisions, not clocks, order changes.
--   * Writes are compare-and-swap: a client says which revision it last saw
--     (`base_rev`). If the row has moved on, the write is refused and the
--     current row is returned for the client to reconcile.
--   * Deletion is a durable tombstone row (`deleted = true`, data removed).
--     A stale client cannot overwrite it; deletion wins over a concurrent
--     edit of the same item. Tombstones are purged after 180 days, and the
--     purge watermark tells any client that has been away longer than that
--     to do a full resync instead of trusting its stale copy.
--   * Every RPC takes the account id the client believes it is acting for
--     and refuses if the session token belongs to someone else. Work started
--     as account A can therefore never land in account B, even if the session
--     on the device changed while the request was in flight.
--   * Clients only reach these tables through the RPCs below (RLS on, no
--     policies, table privileges revoked).
--
-- Free-tier save limit
--   New saved words beyond 5 per day are refused for accounts without
--   Premium (`rejected: save_quota`). This is the server-side enforcement of
--   the free tier; the client shows the same limit but cannot bypass this.
--
-- Legacy data
--   The first time an account syncs through these RPCs, its 0002 rows are
--   converted into items (see sorlio_sync_import_legacy). 0002's table is left
--   untouched — nothing is deleted — so rollback is possible: old clients
--   still read and write their old rows.
--
-- Imported texts (lire.customTexts.v1) are NOT converted automatically: syncing
-- imported text is now an explicit opt-in. Turning it on imports the legacy
-- copies at that point.

-- ---------------------------------------------------------------------------
-- Store registry
-- ---------------------------------------------------------------------------

create table if not exists public.sorlio_sync_stores (
  store_key text primary key,
  kind text not null check (kind in ('list-by-id', 'list-of-strings', 'record', 'object')),
  id_field text,
  max_item_bytes integer not null default 32768 check (max_item_bytes between 64 and 1048576),
  max_items integer not null default 20000 check (max_items between 1 and 200000),
  legacy_auto_import boolean not null default true,
  check ((kind = 'list-by-id') = (id_field is not null))
);

alter table public.sorlio_sync_stores enable row level security;
revoke all on table public.sorlio_sync_stores from anon, authenticated;

insert into public.sorlio_sync_stores (store_key, kind, id_field, max_item_bytes, max_items, legacy_auto_import) values
  ('lire.savedWords.v1', 'list-by-id', 'word', 32768, 20000, true),
  ('lire.knownWords.v1', 'list-of-strings', null, 256, 50000, true),
  ('lire.archive.v1', 'list-by-id', 'textId', 32768, 20000, true),
  ('lire.progress.v1', 'record', null, 32768, 20000, true),
  ('lire.journey.v1', 'object', null, 262144, 1, true),
  ('lire.levelScore.v1', 'record', null, 1024, 100, true),
  ('lire.progress.lastOpened', 'object', null, 4096, 1, true),
  ('lire.progression.cefrToLireLevel.v1', 'object', null, 16384, 1, true),
  ('lire.customTexts.v1', 'list-by-id', 'id', 262144, 200, false),
  ('lire.customDictionary.v1', 'list-by-id', 'lemma', 8192, 20000, true),
  ('lire.interestProfile.v1', 'object', null, 65536, 1, true),
  ('lire.recommendation.hiddenSources.v1', 'list-of-strings', null, 1024, 2000, true),
  ('lire.recommendation.preferredSources.v1', 'list-of-strings', null, 1024, 2000, true),
  ('lire.recommendation.savedLater.v1', 'list-of-strings', null, 1024, 5000, true),
  ('lire.onboarding.v1', 'object', null, 16384, 1, true),
  ('lire.activityDates.v1', 'list-of-strings', null, 64, 20000, true),
  ('lire.streakGrace.v1', 'object', null, 8192, 1, true),
  ('lire.settings.v1', 'object', null, 16384, 1, true),
  ('lire.syncPreferences.v1', 'object', null, 4096, 1, true),
  ('lire.goals.v1', 'object', null, 16384, 1, true),
  ('lire.reviewPrefs.v1', 'object', null, 8192, 1, true),
  ('lire.savedPhrases.v1', 'list-by-id', 'phrase', 16384, 20000, true),
  ('lire.dictionaryFeedback.v1', 'list-by-id', 'id', 8192, 5000, true),
  ('lire.articleFeedback.v1', 'list-by-id', 'textId', 8192, 20000, true),
  ('lire.comprehensionQuestions.v1', 'list-by-id', 'textId', 65536, 5000, true),
  ('lire.wordTapStats.v1', 'list-by-id', 'id', 8192, 50000, true),
  ('lire.inferredWords.v1', 'list-by-id', 'id', 8192, 50000, true),
  ('lire.translationBudget.v1', 'list-by-id', 'id', 8192, 20000, true),
  ('lire.secondPass.v1', 'list-by-id', 'id', 8192, 20000, true),
  ('lire.gamification.xpEvents.v1', 'list-by-id', 'id', 8192, 50000, true),
  ('lire.gamification.articleCompletions.v1', 'list-by-id', 'id', 16384, 20000, true),
  ('lire.gamification.achievements.v1', 'list-by-id', 'id', 8192, 5000, true),
  ('lire.gamification.passport.v1', 'list-by-id', 'id', 8192, 5000, true),
  ('lire.gamification.mastery.v1', 'list-by-id', 'word', 8192, 50000, true),
  ('lire.grammar.progress.v1', 'list-by-id', 'id', 8192, 5000, true),
  ('lire.grammar.practiceEvents.v1', 'list-by-id', 'id', 8192, 50000, true),
  ('lire.practiceCompleted.v1', 'list-of-strings', null, 512, 50000, true),
  ('lire.listeningPracticeCompleted.v1', 'list-of-strings', null, 512, 50000, true),
  ('lire.lookupStats.v1', 'list-by-id', 'textId', 16384, 20000, true),
  ('lire.sessionRecords.v1', 'list-by-id', 'textId', 32768, 20000, true),
  ('lire.translationReports.v1', 'list-by-id', 'id', 8192, 5000, true)
on conflict (store_key) do update set
  kind = excluded.kind,
  id_field = excluded.id_field,
  max_item_bytes = excluded.max_item_bytes,
  max_items = excluded.max_items,
  legacy_auto_import = excluded.legacy_auto_import;

-- ---------------------------------------------------------------------------
-- Per-account sync state and items
-- ---------------------------------------------------------------------------

create table if not exists public.sorlio_sync_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_rev bigint not null default 0 check (last_rev >= 0),
  purged_through_rev bigint not null default 0 check (purged_through_rev >= 0),
  legacy_imported_at timestamptz,
  -- New saved words accepted outside the daily free limit because they were
  -- brought in from this device's earlier data (first sync, or adopting guest
  -- data after sign-in). Bounded once per account; see sorlio_sync_push.
  carried_over_saves integer not null default 0 check (carried_over_saves >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.sorlio_sync_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  store_key text not null references public.sorlio_sync_stores (store_key),
  item_id text not null check (char_length(item_id) between 1 and 512),
  rev bigint not null check (rev > 0),
  deleted boolean not null default false,
  data jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_key, item_id),
  check (deleted = (data is null))
);

create index if not exists sorlio_sync_items_user_rev_idx on public.sorlio_sync_items (user_id, rev);
create index if not exists sorlio_sync_items_tombstone_idx on public.sorlio_sync_items (updated_at) where deleted;

create table if not exists public.sorlio_save_quota (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  saves integer not null default 0 check (saves >= 0),
  primary key (user_id, day)
);

alter table public.sorlio_sync_state enable row level security;
alter table public.sorlio_sync_items enable row level security;
alter table public.sorlio_save_quota enable row level security;
revoke all on table public.sorlio_sync_state from anon, authenticated;
revoke all on table public.sorlio_sync_items from anon, authenticated;
revoke all on table public.sorlio_save_quota from anon, authenticated;

comment on table public.sorlio_sync_items is
  'Synced learning data, one row per (user, store, item), revision-ordered with durable tombstones. Cascades on auth user delete.';
comment on table public.sorlio_sync_state is
  'Per-account sync revision counter and tombstone purge watermark. Cascades on auth user delete.';
comment on table public.sorlio_save_quota is
  'Free-tier daily new-word save counter. Cascades on auth user delete. Rows older than 30 days purged.';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.sorlio_sync_free_daily_saves()
returns integer language sql immutable as $$ select 5 $$;

/** One-time allowance for saved words carried over from earlier local data. */
create or replace function public.sorlio_sync_carry_over_allowance()
returns integer language sql immutable as $$ select 500 $$;

/**
 * Resolves and checks the caller. Raises unless the session belongs to
 * p_expected_user and that account still exists.
 */
create or replace function public.sorlio_sync_caller(p_expected_user uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_expected_user is null or v_uid <> p_expected_user then
    raise exception 'identity_mismatch' using errcode = '28000';
  end if;
  if not exists (select 1 from auth.users u where u.id = v_uid) then
    raise exception 'account_missing' using errcode = '28000';
  end if;
  return v_uid;
end;
$$;

/**
 * Converts an account's 0002 rows into items. Idempotent: an item that
 * already exists is never overwritten. p_store limits the import to one store
 * (used when a reader opts in to imported-text sync); null imports every store
 * marked legacy_auto_import.
 *
 * Must run while the caller holds the account's sync_state row lock.
 */
create or replace function public.sorlio_sync_import_legacy(p_user uuid, p_store text default null)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_store record;
  v_legacy jsonb;
  v_meta jsonb;
  v_rev bigint;
  v_count integer := 0;
  v_item record;
begin
  select last_rev into v_rev from public.sorlio_sync_state where user_id = p_user;
  if v_rev is null then
    raise exception 'sync_state_missing';
  end if;

  for v_store in
    select s.* from public.sorlio_sync_stores s
    where (p_store is null and s.legacy_auto_import) or s.store_key = p_store
  loop
    v_legacy := null;
    v_meta := null;
    select d.data into v_legacy from public.sorlio_user_data d
      where d.user_id = p_user and d.store_key = v_store.store_key;
    select d.data into v_meta from public.sorlio_user_data d
      where d.user_id = p_user and d.store_key = '__sync_meta__:' || v_store.store_key;

    if v_legacy is not null then
      for v_item in
        select x.item_id, x.item_data from (
          select
            case v_store.kind
              when 'list-by-id' then e.value ->> v_store.id_field
              when 'list-of-strings' then e.value #>> '{}'
            end as item_id,
            case v_store.kind
              when 'list-by-id' then e.value
              else 'true'::jsonb
            end as item_data
          from jsonb_array_elements(case when jsonb_typeof(v_legacy) = 'array' then v_legacy else '[]'::jsonb end) e
          where v_store.kind in ('list-by-id', 'list-of-strings')
          union all
          select r.key, r.value
          from jsonb_each(case when jsonb_typeof(v_legacy) = 'object' then v_legacy else '{}'::jsonb end) r
          where v_store.kind = 'record'
          union all
          select '__value__', v_legacy
          where v_store.kind = 'object' and jsonb_typeof(v_legacy) = 'object'
        ) x
        where x.item_id is not null and char_length(x.item_id) between 1 and 512
          and octet_length(x.item_data::text) <= v_store.max_item_bytes
      loop
        v_rev := v_rev + 1;
        insert into public.sorlio_sync_items (user_id, store_key, item_id, rev, deleted, data)
        values (p_user, v_store.store_key, v_item.item_id, v_rev, false, v_item.item_data)
        on conflict (user_id, store_key, item_id) do nothing;
        if found then v_count := v_count + 1; end if;
      end loop;
    end if;

    -- The account's own deletions recorded by 0002 clients. These are this
    -- account's tombstones (they came from its own server rows), so applying
    -- them is correct — unlike device-local legacy metadata, which is ignored.
    if v_meta is not null and jsonb_typeof(v_meta -> 'tombstones') = 'object' then
      for v_item in select t.key as item_id from jsonb_each(v_meta -> 'tombstones') t
        where char_length(t.key) between 1 and 512
      loop
        v_rev := v_rev + 1;
        insert into public.sorlio_sync_items (user_id, store_key, item_id, rev, deleted, data)
        values (p_user, v_store.store_key, v_item.item_id, v_rev, true, null)
        on conflict (user_id, store_key, item_id) do nothing;
      end loop;
    end if;
  end loop;

  update public.sorlio_sync_state set last_rev = v_rev where user_id = p_user;
  return v_count;
end;
$$;

/**
 * Locks (creating if needed) the account's sync state row. First use runs the
 * legacy import exactly once.
 */
create or replace function public.sorlio_sync_lock_state(p_user uuid)
returns public.sorlio_sync_state
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_state public.sorlio_sync_state;
begin
  insert into public.sorlio_sync_state (user_id) values (p_user) on conflict (user_id) do nothing;
  select * into v_state from public.sorlio_sync_state where user_id = p_user for update;
  if v_state.legacy_imported_at is null then
    perform public.sorlio_sync_import_legacy(p_user, null);
    update public.sorlio_sync_state set legacy_imported_at = now() where user_id = p_user;
    select * into v_state from public.sorlio_sync_state where user_id = p_user;
  end if;
  return v_state;
end;
$$;

-- ---------------------------------------------------------------------------
-- Pull
-- ---------------------------------------------------------------------------

/**
 * Returns items with rev > p_after_rev, oldest first, at most p_limit.
 *
 * If p_after_rev is older than the tombstone purge watermark the client's
 * view may be missing deletions, so it is told to resync from 0 instead.
 * p_after_rev = 0 returns every remaining row (live and tombstoned).
 */
create or replace function public.sorlio_sync_pull(p_expected_user uuid, p_after_rev bigint, p_limit integer default 1000)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := public.sorlio_sync_caller(p_expected_user);
  v_state public.sorlio_sync_state;
  v_limit integer := least(greatest(coalesce(p_limit, 1000), 1), 2000);
  v_items jsonb;
  v_max bigint;
  v_count integer;
  v_premium boolean;
  v_saves integer;
begin
  if p_after_rev is null or p_after_rev < 0 then
    raise exception 'invalid_cursor' using errcode = '22023';
  end if;

  v_state := public.sorlio_sync_lock_state(v_uid);
  v_premium := public.sorlio_has_premium(v_uid);
  select coalesce(q.saves, 0) into v_saves from public.sorlio_save_quota q where q.user_id = v_uid and q.day = current_date;

  if p_after_rev > 0 and p_after_rev < v_state.purged_through_rev then
    return jsonb_build_object(
      'resync_required', true,
      'last_rev', v_state.last_rev,
      'purged_through_rev', v_state.purged_through_rev
    );
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'store', i.store_key, 'id', i.item_id, 'rev', i.rev, 'deleted', i.deleted, 'data', i.data
         ) order by i.rev), '[]'::jsonb),
         max(i.rev), count(*)
    into v_items, v_max, v_count
    from (
      select * from public.sorlio_sync_items
      where user_id = v_uid and rev > p_after_rev
      order by rev
      limit v_limit
    ) i;

  return jsonb_build_object(
    'items', v_items,
    'next_rev', coalesce(v_max, p_after_rev),
    'has_more', v_count = v_limit,
    'last_rev', v_state.last_rev,
    'purged_through_rev', v_state.purged_through_rev,
    'premium', v_premium,
    'save_quota', jsonb_build_object(
      'day', current_date,
      'used', coalesce(v_saves, 0),
      'limit', case when v_premium then null else public.sorlio_sync_free_daily_saves() end
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Push
-- ---------------------------------------------------------------------------

/**
 * Applies a batch of item operations. Each op:
 *   { "store": text, "id": text, "op": "put" | "delete",
 *     "base_rev": bigint | null, "data": jsonb (put only),
 *     "mode": "normal" | "import" }
 *
 * Returns one result per op, in order:
 *   { "status": "applied", "rev": bigint | null }
 *   { "status": "conflict", "current": { "rev", "deleted", "data" } }
 *   { "status": "rejected", "reason": text }
 *
 * Rules:
 *   put, no row             → insert if base_rev is null (save quota applies
 *                             to new saved words); a base_rev means the row
 *                             existed and was purged after deletion → conflict
 *   put, live row           → update if base_rev = row.rev; no-op success if
 *                             data is already identical; otherwise conflict
 *   put, tombstone          → base_rev null and mode normal: re-create (a
 *                             deliberate new save after a deletion);
 *                             otherwise conflict (stale copy of a deleted item)
 *   delete                  → always wins; idempotent
 *
 * Modes:
 *   normal — an ordinary change made on this device;
 *   import — a device's first sync, uploading data that predates it (a
 *            tombstone beats such a copy: it may be stale);
 *   adopt  — guest data the reader chose to add to their account after
 *            signing in.
 * New saved words in import/adopt mode do not use the daily free limit (they
 * were saved earlier) but draw on a one-time per-account carry-over allowance,
 * so the free limit cannot be bypassed by relabelling new saves.
 *
 * p_day is the client's local calendar date, used for the free save quota so
 * "today" matches what the reader sees. It is clamped to UTC today ± 1 day.
 */
create or replace function public.sorlio_sync_push(p_expected_user uuid, p_ops jsonb, p_day date default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := public.sorlio_sync_caller(p_expected_user);
  v_state public.sorlio_sync_state;
  v_rev bigint;
  v_day date := current_date;
  v_premium boolean;
  v_results jsonb := '[]'::jsonb;
  v_op jsonb;
  v_store public.sorlio_sync_stores;
  v_store_key text;
  v_id text;
  v_kind text;
  v_mode text;
  v_base bigint;
  v_data jsonb;
  v_row public.sorlio_sync_items;
  v_live integer;
  v_quota_ok boolean;
begin
  if p_ops is null or jsonb_typeof(p_ops) <> 'array' then
    raise exception 'invalid_ops' using errcode = '22023';
  end if;
  if jsonb_array_length(p_ops) > 500 then
    raise exception 'too_many_ops' using errcode = '22023';
  end if;
  if p_day is not null and p_day between current_date - 1 and current_date + 1 then
    v_day := p_day;
  end if;

  v_state := public.sorlio_sync_lock_state(v_uid);
  v_rev := v_state.last_rev;
  v_premium := public.sorlio_has_premium(v_uid);

  for v_op in select value from jsonb_array_elements(p_ops) loop
    v_store_key := v_op ->> 'store';
    v_id := v_op ->> 'id';
    v_kind := v_op ->> 'op';
    v_mode := coalesce(v_op ->> 'mode', 'normal');
    v_base := case when jsonb_typeof(v_op -> 'base_rev') = 'number' then (v_op ->> 'base_rev')::bigint else null end;
    v_data := v_op -> 'data';

    select * into v_store from public.sorlio_sync_stores where store_key = v_store_key;
    if v_store.store_key is null then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'unknown_store'));
      continue;
    end if;
    if v_id is null or char_length(v_id) < 1 or char_length(v_id) > 512 then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'invalid_id'));
      continue;
    end if;
    if v_kind not in ('put', 'delete') or v_mode not in ('normal', 'import', 'adopt') then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'invalid_op'));
      continue;
    end if;

    select * into v_row from public.sorlio_sync_items
      where user_id = v_uid and store_key = v_store_key and item_id = v_id;

    if v_kind = 'delete' then
      if v_row.item_id is null then
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'applied', 'rev', null));
      elsif v_row.deleted then
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'applied', 'rev', v_row.rev));
      else
        v_rev := v_rev + 1;
        update public.sorlio_sync_items
          set deleted = true, data = null, rev = v_rev, updated_at = now()
          where user_id = v_uid and store_key = v_store_key and item_id = v_id;
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'applied', 'rev', v_rev));
      end if;
      continue;
    end if;

    -- put
    if v_data is null or jsonb_typeof(v_data) = 'null' then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'missing_data'));
      continue;
    end if;
    if octet_length(v_data::text) > v_store.max_item_bytes then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'too_large'));
      continue;
    end if;

    if v_row.item_id is not null and not v_row.deleted then
      if v_row.data = v_data then
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'applied', 'rev', v_row.rev));
      elsif v_base is not null and v_base = v_row.rev then
        v_rev := v_rev + 1;
        update public.sorlio_sync_items
          set data = v_data, rev = v_rev, updated_at = now()
          where user_id = v_uid and store_key = v_store_key and item_id = v_id;
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'applied', 'rev', v_rev));
      else
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'conflict',
          'current', jsonb_build_object('rev', v_row.rev, 'deleted', false, 'data', v_row.data)));
      end if;
      continue;
    end if;

    -- A write based on a revision the server no longer has: the item was
    -- deleted (its tombstone may even have been purged). Never resurrect it.
    if v_row.item_id is null and v_base is not null then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'conflict',
        'current', jsonb_build_object('rev', 0, 'deleted', true, 'data', null)));
      continue;
    end if;

    if v_row.item_id is not null and v_row.deleted and (v_base is not null or v_mode = 'import') then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'conflict',
        'current', jsonb_build_object('rev', v_row.rev, 'deleted', true, 'data', null)));
      continue;
    end if;

    -- A new live item (fresh insert or deliberate re-creation).
    select count(*) into v_live from public.sorlio_sync_items
      where user_id = v_uid and store_key = v_store_key and not deleted;
    if v_live >= v_store.max_items then
      v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'store_full'));
      continue;
    end if;

    if v_store_key = 'lire.savedWords.v1' and not v_premium and v_mode in ('import', 'adopt') then
      update public.sorlio_sync_state
        set carried_over_saves = carried_over_saves + 1
        where user_id = v_uid and carried_over_saves < public.sorlio_sync_carry_over_allowance()
        returning true into v_quota_ok;
      if v_quota_ok is not true then
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'save_quota'));
        continue;
      end if;
      v_quota_ok := null;
    elsif v_store_key = 'lire.savedWords.v1' and not v_premium then
      insert into public.sorlio_save_quota as q (user_id, day, saves)
        values (v_uid, v_day, 1)
        on conflict (user_id, day) do update set saves = q.saves + 1
        where q.saves < public.sorlio_sync_free_daily_saves()
        returning true into v_quota_ok;
      if v_quota_ok is not true then
        v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'rejected', 'reason', 'save_quota'));
        continue;
      end if;
      v_quota_ok := null;
    end if;

    v_rev := v_rev + 1;
    insert into public.sorlio_sync_items (user_id, store_key, item_id, rev, deleted, data)
      values (v_uid, v_store_key, v_id, v_rev, false, v_data)
      on conflict (user_id, store_key, item_id) do update
        set deleted = false, data = excluded.data, rev = excluded.rev, updated_at = now();
    v_results := v_results || jsonb_build_array(jsonb_build_object('status', 'applied', 'rev', v_rev));
  end loop;

  update public.sorlio_sync_state set last_rev = v_rev where user_id = v_uid;
  return jsonb_build_object('results', v_results, 'last_rev', v_rev);
end;
$$;

-- ---------------------------------------------------------------------------
-- Store-level operations
-- ---------------------------------------------------------------------------

/**
 * Removes every cloud copy in one opt-in store (imported texts) when the
 * reader turns its sync off. Rows are deleted outright rather than
 * tombstoned: a tombstone would tell the reader's OTHER devices to delete
 * their local copies, and turning sync off must never delete anyone's local
 * data. Clients forget their sync bases for a store they no longer sync (see
 * engine.ts), so a later opt-in uploads local copies afresh.
 */
create or replace function public.sorlio_sync_remove_store(p_expected_user uuid, p_store text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := public.sorlio_sync_caller(p_expected_user);
  v_count integer;
begin
  if not exists (select 1 from public.sorlio_sync_stores where store_key = p_store and not legacy_auto_import) then
    raise exception 'not_opt_in_store' using errcode = '22023';
  end if;
  perform public.sorlio_sync_lock_state(v_uid);
  delete from public.sorlio_sync_items where user_id = v_uid and store_key = p_store;
  get diagnostics v_count = row_count;
  -- Old-format copies of the same store go too.
  delete from public.sorlio_user_data
    where user_id = v_uid and store_key in (p_store, '__sync_meta__:' || p_store);
  return jsonb_build_object('removed', v_count);
end;
$$;

/** Imports old-format copies of one opt-in store (imported texts) on demand. */
create or replace function public.sorlio_sync_import_store(p_expected_user uuid, p_store text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := public.sorlio_sync_caller(p_expected_user);
  v_count integer;
begin
  if not exists (select 1 from public.sorlio_sync_stores where store_key = p_store) then
    raise exception 'unknown_store' using errcode = '22023';
  end if;
  perform public.sorlio_sync_lock_state(v_uid);
  v_count := public.sorlio_sync_import_legacy(v_uid, p_store);
  return jsonb_build_object('imported', v_count);
end;
$$;

-- ---------------------------------------------------------------------------
-- Maintenance (service role / cron only)
-- ---------------------------------------------------------------------------

/**
 * Purges tombstones older than p_days and advances each affected account's
 * watermark, so a client that has been away longer than that resyncs fully
 * instead of trusting stale items. Also prunes old save-quota rows.
 */
create or replace function public.sorlio_sync_purge(p_days integer default 180)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_cutoff timestamptz := now() - make_interval(days => greatest(p_days, 30));
  v_purged integer;
begin
  with purged as (
    delete from public.sorlio_sync_items
    where deleted and updated_at < v_cutoff
    returning user_id, rev
  ), marks as (
    select user_id, max(rev) as max_rev, count(*) as n from purged group by user_id
  ), bump as (
    update public.sorlio_sync_state s
      set purged_through_rev = greatest(s.purged_through_rev, m.max_rev)
      from marks m where s.user_id = m.user_id
    returning m.n
  )
  select coalesce(sum(n), 0) into v_purged from bump;

  delete from public.sorlio_save_quota where day < current_date - 30;
  return jsonb_build_object('tombstones_purged', v_purged);
end;
$$;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

revoke all on function public.sorlio_sync_caller(uuid) from public, anon, authenticated;
revoke all on function public.sorlio_sync_import_legacy(uuid, text) from public, anon, authenticated;
revoke all on function public.sorlio_sync_lock_state(uuid) from public, anon, authenticated;
revoke all on function public.sorlio_sync_purge(integer) from public, anon, authenticated;
revoke all on function public.sorlio_sync_free_daily_saves() from public, anon;
revoke all on function public.sorlio_sync_carry_over_allowance() from public, anon, authenticated;
revoke all on function public.sorlio_sync_pull(uuid, bigint, integer) from public, anon;
revoke all on function public.sorlio_sync_push(uuid, jsonb, date) from public, anon;
revoke all on function public.sorlio_sync_remove_store(uuid, text) from public, anon;
revoke all on function public.sorlio_sync_import_store(uuid, text) from public, anon;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'grant execute on function public.sorlio_sync_pull(uuid, bigint, integer) to authenticated';
    execute 'grant execute on function public.sorlio_sync_push(uuid, jsonb, date) to authenticated';
    execute 'grant execute on function public.sorlio_sync_remove_store(uuid, text) to authenticated';
    execute 'grant execute on function public.sorlio_sync_import_store(uuid, text) to authenticated';
    execute 'grant execute on function public.sorlio_sync_free_daily_saves() to authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.sorlio_sync_purge(integer) to service_role';
  end if;
end $$;
