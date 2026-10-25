-- Development 2026-10-25-v07
-- Shared Owner-only eBay blocked-buyer master list.
-- Rerunnable where practical. Do not apply to Production without explicit approval.

create table if not exists public.ebay_banlist (
  id uuid primary key default gen_random_uuid(),
  ebay_username text not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint ebay_banlist_username_not_blank check (length(btrim(ebay_username)) > 0),
  constraint ebay_banlist_username_length check (length(ebay_username) <= 100),
  constraint ebay_banlist_reason_length check (reason is null or length(reason) <= 500)
);

create unique index if not exists ebay_banlist_username_lower_uidx
  on public.ebay_banlist (lower(btrim(ebay_username)));

alter table public.ebay_banlist enable row level security;

revoke all on table public.ebay_banlist from anon, authenticated;
grant select, insert, update, delete on table public.ebay_banlist to authenticated;

-- Policies deliberately reuse the existing server-side owner authorization helper.
drop policy if exists "Owners can read ebay banlist" on public.ebay_banlist;
create policy "Owners can read ebay banlist"
  on public.ebay_banlist for select
  to authenticated
  using ((select public.is_app_owner()));

drop policy if exists "Owners can add ebay banlist" on public.ebay_banlist;
create policy "Owners can add ebay banlist"
  on public.ebay_banlist for insert
  to authenticated
  with check ((select public.is_app_owner()));

drop policy if exists "Owners can update ebay banlist" on public.ebay_banlist;
create policy "Owners can update ebay banlist"
  on public.ebay_banlist for update
  to authenticated
  using ((select public.is_app_owner()))
  with check ((select public.is_app_owner()));

drop policy if exists "Owners can delete ebay banlist" on public.ebay_banlist;
create policy "Owners can delete ebay banlist"
  on public.ebay_banlist for delete
  to authenticated
  using ((select public.is_app_owner()));
