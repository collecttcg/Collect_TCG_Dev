-- Development-only eBay seller feedback cache. Does not modify public.reviews.
create table if not exists public.ebay_feedback_dev (
  id bigint generated always as identity primary key,
  ebay_account text not null check (ebay_account in ('collect_tcg_1','collect_tcg_2','collect_tcg_3','collect_tcg_4','collect_tcg_5')),
  feedback_id text not null,
  feedback_type text not null check (feedback_type in ('positive','neutral','negative')),
  comment text not null check (char_length(comment) <= 2000),
  feedback_at timestamptz not null,
  imported_at timestamptz not null default now(),
  constraint ebay_feedback_dev_account_feedback_unique unique (ebay_account,feedback_id)
);
create index if not exists ebay_feedback_dev_latest_idx on public.ebay_feedback_dev (feedback_at desc);
alter table public.ebay_feedback_dev enable row level security;
revoke all on public.ebay_feedback_dev from anon,authenticated;
grant select on public.ebay_feedback_dev to anon,authenticated;
drop policy if exists ebay_feedback_dev_public_read on public.ebay_feedback_dev;
create policy ebay_feedback_dev_public_read on public.ebay_feedback_dev for select to anon,authenticated using (true);
-- Writes are restricted to backend service_role; no public inserts, updates or deletes.
create table if not exists public.ebay_feedback_sync_accounts_dev (
  ebay_account text primary key check (ebay_account in ('collect_tcg_1','collect_tcg_2','collect_tcg_3','collect_tcg_4','collect_tcg_5')),
  last_success_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  enabled boolean not null default false
);
alter table public.ebay_feedback_sync_accounts_dev enable row level security;
revoke all on public.ebay_feedback_sync_accounts_dev from anon,authenticated;
insert into public.ebay_feedback_sync_accounts_dev (ebay_account)
values ('collect_tcg_1'),('collect_tcg_2'),('collect_tcg_3'),('collect_tcg_4'),('collect_tcg_5')
on conflict (ebay_account) do nothing;
