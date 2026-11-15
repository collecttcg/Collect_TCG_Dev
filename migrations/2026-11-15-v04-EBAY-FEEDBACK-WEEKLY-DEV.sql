-- Weekly background sync of connected eBay sellers, Mondays at 09:00 JST.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Keep queued scheduler credentials inaccessible to public API roles.
revoke select on net.http_request_queue from public, anon, authenticated;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'ebay_feedback_schedule_dev') then
    perform vault.create_secret(gen_random_uuid()::text || gen_random_uuid()::text, 'ebay_feedback_schedule_dev');
  end if;
end
$$;

-- Only the Edge Function's service role can verify the dedicated scheduler token.
create or replace function public.verify_ebay_feedback_schedule_token_dev(p_token text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'ebay_feedback_schedule_dev'
      and sha256(convert_to(decrypted_secret, 'UTF8')) = sha256(convert_to(p_token, 'UTF8'))
  )
$$;
revoke all on function public.verify_ebay_feedback_schedule_token_dev(text) from public, anon, authenticated;
grant execute on function public.verify_ebay_feedback_schedule_token_dev(text) to service_role;

select cron.schedule('collect-tcg-ebay-feedback-weekly-dev', '0 0 * * 1', $cron$
  select net.http_post(
    url := 'https://cbzytysxtdcqxuckspye.supabase.co/functions/v1/ebay-feedback-weekly-dev',
    headers := jsonb_build_object('content-type', 'application/json', 'x-collect-tcg-schedule-token', credential.decrypted_secret),
    body := jsonb_build_object('seller', connection.ebay_account),
    timeout_milliseconds := 100000
  )
  from vault.decrypted_secrets credential
  cross join public.ebay_oauth_connections_dev connection
  join public.ebay_feedback_sync_accounts_dev account using (ebay_account)
  where credential.name = 'ebay_feedback_schedule_dev' and account.enabled
$cron$);
