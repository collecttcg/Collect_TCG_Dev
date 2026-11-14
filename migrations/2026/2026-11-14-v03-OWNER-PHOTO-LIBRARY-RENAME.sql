-- Allow authenticated Owners to rename objects in the existing private library.
begin;

drop policy if exists "Dev photo library no browser updates" on storage.objects;
drop policy if exists "Photo library owner rename" on storage.objects;
create policy "Photo library owner rename" on storage.objects
for update to authenticated
using (bucket_id = 'owner-card-photo-library-dev' and (select public.is_app_owner()) is true)
with check (bucket_id = 'owner-card-photo-library-dev' and (select public.is_app_owner()) is true);

commit;
