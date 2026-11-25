-- Private invoice PDFs for the Development owner tools.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('owner-invoices-dev', 'owner-invoices-dev', false, 20971520, array['application/pdf'])
on conflict (id) do update
set public = false, file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Restrictive policies also constrain any broader storage policies.
drop policy if exists "Dev invoices isolation" on storage.objects;
create policy "Dev invoices isolation" on storage.objects
as restrictive for all to anon, authenticated
using (bucket_id <> 'owner-invoices-dev'
       or ((select auth.uid()) is not null and (select public.is_app_owner()) is true))
with check (bucket_id <> 'owner-invoices-dev'
            or ((select auth.uid()) is not null and (select public.is_app_owner()) is true
                and name ~ '^[0-9]{10}[.]pdf$' and name <> '0000000000.pdf'));

drop policy if exists "Dev invoices read" on storage.objects;
create policy "Dev invoices read" on storage.objects
for select to authenticated
using (bucket_id = 'owner-invoices-dev' and (select public.is_app_owner()) is true);

drop policy if exists "Dev invoices upload" on storage.objects;
create policy "Dev invoices upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'owner-invoices-dev' and (select public.is_app_owner()) is true);

drop policy if exists "Dev invoices delete" on storage.objects;
create policy "Dev invoices delete" on storage.objects
for delete to authenticated
using (bucket_id = 'owner-invoices-dev' and (select public.is_app_owner()) is true);

drop policy if exists "Dev invoices no overwrite" on storage.objects;
create policy "Dev invoices no overwrite" on storage.objects
as restrictive for update to anon, authenticated
using (bucket_id <> 'owner-invoices-dev')
with check (bucket_id <> 'owner-invoices-dev');

commit;
