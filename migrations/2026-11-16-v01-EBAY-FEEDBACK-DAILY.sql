-- Use the existing signed eBay sync job daily at 00:00 UTC (09:00 JST).
do $$
declare
  sync_job_id bigint;
begin
  select jobid into strict sync_job_id
  from cron.job
  where jobname = 'collect-tcg-ebay-feedback-weekly-dev';

  perform cron.alter_job(job_id := sync_job_id, schedule := '0 0 * * *');
end
$$;
