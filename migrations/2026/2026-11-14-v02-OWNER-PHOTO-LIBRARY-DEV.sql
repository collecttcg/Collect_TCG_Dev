-- Development-only bucket. Existing listing-image storage is independent.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('owner-card-photo-library-dev', 'owner-card-photo-library-dev', false,
        20971520, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- A restrictive policy keeps broad policies for other buckets from granting
-- anonymous access, non-owner access, or browser-side updates/deletes here.
drop policy if exists "Dev photo library isolation" on storage.objects;
create policy "Dev photo library isolation" on storage.objects
as restrictive for all to authenticated
using (bucket_id <> 'owner-card-photo-library-dev'
       or (select public.is_app_owner()) is true)
with check (bucket_id <> 'owner-card-photo-library-dev'
            or (select public.is_app_owner()) is true);

drop policy if exists "Dev photo library anonymous isolation" on storage.objects;
create policy "Dev photo library anonymous isolation" on storage.objects
as restrictive for all to anon
using (bucket_id <> 'owner-card-photo-library-dev')
with check (bucket_id <> 'owner-card-photo-library-dev');

drop policy if exists "Dev photo library read" on storage.objects;
create policy "Dev photo library read" on storage.objects
for select to authenticated
using (bucket_id = 'owner-card-photo-library-dev' and (select public.is_app_owner()) is true);

drop policy if exists "Dev photo library upload" on storage.objects;
create policy "Dev photo library upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'owner-card-photo-library-dev' and (select public.is_app_owner()) is true);

drop policy if exists "Dev photo library no browser updates" on storage.objects;
create policy "Dev photo library no browser updates" on storage.objects
as restrictive for update to anon, authenticated
using (bucket_id <> 'owner-card-photo-library-dev')
with check (bucket_id <> 'owner-card-photo-library-dev');

drop policy if exists "Dev photo library no browser deletes" on storage.objects;
create policy "Dev photo library no browser deletes" on storage.objects
as restrictive for delete to anon, authenticated
using (bucket_id <> 'owner-card-photo-library-dev');

commit;
