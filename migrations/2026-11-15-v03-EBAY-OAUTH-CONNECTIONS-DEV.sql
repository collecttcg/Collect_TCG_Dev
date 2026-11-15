-- Dev-only eBay OAuth connections; service-role access only.
create table if not exists public.ebay_oauth_connections_dev (
 ebay_account text primary key references public.ebay_feedback_sync_accounts_dev(ebay_account),
 refresh_token_ciphertext text not null,
 connected_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.ebay_oauth_connections_dev enable row level security;
revoke all on public.ebay_oauth_connections_dev from anon, authenticated;
create table if not exists public.ebay_oauth_states_dev (
 state_hash text primary key,
 ebay_account text not null references public.ebay_feedback_sync_accounts_dev(ebay_account),
 owner_id uuid not null,
 expires_at timestamptz not null,
 created_at timestamptz not null default now()
);
alter table public.ebay_oauth_states_dev enable row level security;
revoke all on public.ebay_oauth_states_dev from anon, authenticated;
create index if not exists ebay_oauth_states_dev_expires_idx on public.ebay_oauth_states_dev(expires_at);
