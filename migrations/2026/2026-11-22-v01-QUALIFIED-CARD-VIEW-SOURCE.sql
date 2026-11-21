begin;

alter table public.qualified_card_view_events add column if not exists source_type text;

CREATE OR REPLACE FUNCTION public.record_qualified_card_view_event_with_source(p_card_id text, p_visitor_id text, p_country_code text, p_source_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_card_id text:=btrim(coalesce(p_card_id,''));
  v_visitor_id text:=btrim(coalesce(p_visitor_id,''));
  v_country_code text:=upper(btrim(coalesce(p_country_code,'')));
  v_source_type text:=initcap(lower(btrim(coalesce(p_source_type,''))));
  v_existing_id bigint;
begin
  if v_card_id='' or char_length(v_card_id)>128 then return false; end if;
  if char_length(v_visitor_id)<8 or char_length(v_visitor_id)>128 then return false; end if;
  if v_country_code !~ '^[A-Z]{2}$' or v_country_code='XX' then v_country_code:=null; end if;

  if v_source_type not in ('Direct','Facebook','Instagram','Google','Carousell','Other') then v_source_type:=null; end if;

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

  insert into public.qualified_card_view_events(card_id,visitor_id,country_code,source_type)
  values(v_card_id,v_visitor_id,v_country_code,v_source_type);
  return true;
end;
$function$;
CREATE OR REPLACE FUNCTION public.get_recent_qualified_card_view_latest_source_context(p_start timestamp with time zone, p_end timestamp with time zone, p_status text DEFAULT NULL::text, p_game text DEFAULT NULL::text, p_limit integer DEFAULT 20)
 RETURNS TABLE(card_id text, viewed_at timestamp with time zone, country_code text, device_type text, source_type text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if not public.is_app_owner() then raise exception 'owner access required' using errcode='42501'; end if;
 if p_start is null or p_end is null or p_end<p_start then return; end if;
 return query
 select distinct on (e.card_id) e.card_id,e.created_at,e.country_code,e.device_type,e.source_type
 from public.qualified_card_view_events e join public.cards c on c.id::text=e.card_id
 where e.created_at between p_start and p_end
 and (p_status is null or btrim(p_status)='' or coalesce(c.availability,'Available')=p_status)
 and (p_game is null or btrim(p_game)='' or coalesce(c.game,'')=p_game)
 order by e.card_id,e.created_at desc,e.id desc;
end $function$;

revoke all on function public.record_qualified_card_view_event_with_source(text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_qualified_card_view_event_with_source(text,text,text,text) to anon, authenticated;

revoke all on function public.get_recent_qualified_card_view_latest_source_context(timestamptz,timestamptz,text,text,integer) from public, anon, authenticated;
grant execute on function public.get_recent_qualified_card_view_latest_source_context(timestamptz,timestamptz,text,text,integer) to authenticated;

commit;
