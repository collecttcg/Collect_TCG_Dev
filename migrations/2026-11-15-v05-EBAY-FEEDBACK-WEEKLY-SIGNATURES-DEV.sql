-- Replace reusable queued credentials with expiring, single-use signatures.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'ebay_feedback_schedule_signing_dev') then
    perform vault.create_secret(gen_random_uuid()::text || gen_random_uuid()::text, 'ebay_feedback_schedule_signing_dev');
  end if;
end
$$;
select vault.update_secret(id, gen_random_uuid()::text || gen_random_uuid()::text)
from vault.secrets where name = 'ebay_feedback_schedule_dev';

create or replace function public.verify_ebay_feedback_schedule_token_dev(p_token text)
returns boolean language sql stable security invoker set search_path = '' as 'select false';
revoke all on function public.verify_ebay_feedback_schedule_token_dev(text) from public, anon, authenticated, service_role;

create table if not exists public.ebay_feedback_schedule_claims_dev (
  ebay_account text primary key references public.ebay_feedback_sync_accounts_dev(ebay_account),
  issued_at bigint not null
);
alter table public.ebay_feedback_schedule_claims_dev enable row level security;
revoke all on public.ebay_feedback_schedule_claims_dev from public, anon, authenticated;
grant select, insert, update on public.ebay_feedback_schedule_claims_dev to service_role;

create or replace function public.claim_ebay_feedback_schedule_dev(p_seller text, p_issued_at bigint, p_signature text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  now_epoch bigint := floor(extract(epoch from statement_timestamp()))::bigint;
begin
  if p_issued_at is null or p_issued_at not between now_epoch - 180 and now_epoch then
    return false;
  end if;
  if not exists (
    select 1 from vault.decrypted_secrets
    where name = 'ebay_feedback_schedule_signing_dev'
      and sha256(convert_to(p_signature, 'UTF8')) = sha256(convert_to(encode(extensions.hmac(p_seller || ':' || p_issued_at::text, decrypted_secret, 'sha256'), 'hex'), 'UTF8'))
  ) then
    return false;
  end if;

  insert into public.ebay_feedback_schedule_claims_dev as claims (ebay_account, issued_at)
  select ebay_account, p_issued_at from public.ebay_feedback_sync_accounts_dev
  where ebay_account = p_seller and enabled
  on conflict (ebay_account) do update set issued_at = excluded.issued_at
  where claims.issued_at < excluded.issued_at;
  return found;
end
$$;
revoke all on function public.claim_ebay_feedback_schedule_dev(text,bigint,text) from public, anon, authenticated;
grant execute on function public.claim_ebay_feedback_schedule_dev(text,bigint,text) to service_role;

select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'collect-tcg-ebay-feedback-weekly-dev'),
  active := false,
  command := $cron$
    with request_time as (select floor(extract(epoch from statement_timestamp()))::bigint as issued_at)
    select net.http_post(
      url := 'https://cbzytysxtdcqxuckspye.supabase.co/functions/v1/ebay-feedback-weekly-dev',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-collect-tcg-schedule-signature',
        encode(extensions.hmac(connection.ebay_account || ':' || issued_at::text, credential.decrypted_secret, 'sha256'), 'hex')
      ),
      body := jsonb_build_object('seller', connection.ebay_account, 'issued_at', issued_at),
      timeout_milliseconds := 100000
    )
    from vault.decrypted_secrets credential
    cross join request_time
    cross join public.ebay_oauth_connections_dev connection
    join public.ebay_feedback_sync_accounts_dev account using (ebay_account)
    where credential.name = 'ebay_feedback_schedule_signing_dev' and account.enabled
  $cron$
);

-- After deploying the signed Edge Function and testing the command, enable the job with cron.alter_job.
