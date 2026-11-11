-- Development 2026-10-05-v01
-- Preserve country attribution on Qualified Views even when an embedded browser
-- changes the anonymous visitor ID between the site-visit and card-view requests.

alter table public.qualified_card_view_events
  add column if not exists country_code text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname='qualified_card_view_events_country_code_check'
      and conrelid='public.qualified_card_view_events'::regclass
  ) then
    alter table public.qualified_card_view_events
      add constraint qualified_card_view_events_country_code_check
      check (country_code is null or country_code ~ '^[A-Z]{2}$');
  end if;
end $$;

create or replace function public.record_qualified_card_view_event_with_country(
  p_card_id text,
  p_visitor_id text,
  p_country_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card_id text:=btrim(coalesce(p_card_id,''));
  v_visitor_id text:=btrim(coalesce(p_visitor_id,''));
  v_country_code text:=upper(btrim(coalesce(p_country_code,'')));
  v_existing_id bigint;
begin
  if v_card_id='' or char_length(v_card_id)>128 then return false; end if;
  if char_length(v_visitor_id)<8 or char_length(v_visitor_id)>128 then return false; end if;
  if v_country_code !~ '^[A-Z]{2}$' or v_country_code='XX' then v_country_code:=null; end if;

  if auth.uid() is not null and public.is_app_owner() then
    return false;
  end if;

  if not exists (select 1 from public.cards c where c.id::text=v_card_id) then
    return false;
  end if;

  select e.id
  into v_existing_id
  from public.qualified_card_view_events e
  where e.card_id=v_card_id
    and e.visitor_id=v_visitor_id
    and e.created_at>=now()-interval '30 minutes'
  order by e.created_at desc
  limit 1;

  if v_existing_id is not null then
    if v_country_code is not null then
      update public.qualified_card_view_events
      set country_code=coalesce(country_code,v_country_code)
      where id=v_existing_id;
    end if;
    return true;
  end if;

  insert into public.qualified_card_view_events(card_id,visitor_id,country_code)
  values(v_card_id,v_visitor_id,v_country_code);
  return true;
end;
$$;

revoke all on function public.record_qualified_card_view_event_with_country(text,text,text) from public;
grant execute on function public.record_qualified_card_view_event_with_country(text,text,text) to anon, authenticated, service_role;

create or replace function public.get_country_card_view_insights(p_start timestamptz,p_end timestamptz)
returns table(country_code text,card_id text,views bigint,unique_views bigint)
language plpgsql
stable
security definer
set search_path=public
as $$
begin
  if not public.is_app_owner() then
    raise exception 'owner access required' using errcode='42501';
  end if;
  if p_start is null or p_end is null or p_end < p_start then
    raise exception 'invalid date range';
  end if;

  return query
  with attributed as (
    select
      q.card_id,
      q.visitor_id,
      coalesce(nullif(q.country_code,'XX'),country_event.country_code,'XX') as country_code
    from public.qualified_card_view_events q
    left join lateral (
      select c.country_code
      from public.site_visit_country_events c
      where c.visitor_id=q.visitor_id
        and c.created_at >= q.created_at - interval '24 hours'
        and c.created_at <= q.created_at + interval '30 minutes'
      order by abs(extract(epoch from (c.created_at-q.created_at))) asc,c.created_at desc
      limit 1
    ) country_event on true
    where q.created_at >= p_start and q.created_at <= p_end
  )
  select a.country_code,a.card_id,count(*)::bigint,count(distinct a.visitor_id)::bigint
  from attributed a
  group by a.country_code,a.card_id
  order by count(*) desc,a.country_code asc,a.card_id asc;
end;
$$;
