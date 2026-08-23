-- 0001 · Extensions
--
-- pgcrypto supplies gen_random_uuid() for primary keys and gen_random_bytes()
-- for the beta list's unsubscribe token. Every later migration assumes it.

create extension if not exists pgcrypto;
