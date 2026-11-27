-- Add an optional classification to the existing RLS-protected owner table.
alter table public.card_owner_private
  add column if not exists holding_strategy text
  constraint card_owner_private_holding_strategy_check
  check (holding_strategy in ('Trading', 'Long Term'));
