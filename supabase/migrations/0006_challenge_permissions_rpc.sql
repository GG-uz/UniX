begin;
-- All mutators lock the acting university before any challenge row. Settings,
-- revocation and approvals for that university are therefore ordered transactions.
create function unix_private.actor_uni(writing boolean default false) returns text
language plpgsql set search_path='' as $$
declare u text;
begin
  select p.university_id into strict u from public.profiles p join auth.users a on a.id=p.id
    where p.id=auth.uid() and a.email_confirmed_at is not null;
  if writing then perform pg_advisory_xact_lock(4101,hashtext(u)); end if;
  return u;
end $$;
create function unix_private.is_admin(u text) returns boolean language sql stable set search_path='' as $$
  select exists(select from unix_private.university_admins where university=u and member=auth.uid());
$$;
create function unix_private.require_admin(u text) returns void language plpgsql set search_path='' as $$
begin
  if not unix_private.is_admin(u) then raise insufficient_privilege; end if;
end $$;
create function unix_private.needs_approval(u text) returns boolean language sql stable set search_path='' as $$
  select coalesce((select approval_required from unix_private.university_challenge_settings where university=u),true);
$$;
-- NULL means the caller is an administrator. An unappointed caller always fails.
create function unix_private.appointment(u text,d text) returns uuid language plpgsql set search_path='' as $$
declare a uuid;
begin
  if unix_private.is_admin(u) then return null; end if;
  select id into a from unix_private.captain_appointments where university=u and discipline=d
    and member=auth.uid() and revoked_at is null;
  if a is null then raise insufficient_privilege; end if;
  return a;
end $$;
create function unix_private.record(u text,e text,obj uuid) returns void language sql set search_path='' as $$
  insert into unix_private.challenge_audit(actor,university,event,object_id) values(auth.uid(),u,e,obj);
$$;

create function public.uc_set_admin(p_member uuid,p_university text,p_grant boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or p_member=auth.uid() or p_grant is null or not exists (
    select from public.profiles p join auth.users a on p.id=a.id where p.id=auth.uid()
      and p.role='SUPER_ADMIN' and a.email_confirmed_at is not null
  ) then raise insufficient_privilege; end if;
  perform pg_advisory_xact_lock(4101,hashtext(p_university));
  if p_grant then
    if not exists(select from auth.users where id=p_member and email_confirmed_at is not null)
      then raise no_data_found; end if;
    insert into unix_private.university_admins(member,university,granted_by)
      values(p_member,p_university,auth.uid()); -- composite FK verifies the target's university
  else
    delete from unix_private.university_admins where member=p_member and university=p_university;
    if not found then raise no_data_found; end if;
  end if;
  perform unix_private.record(p_university,case when p_grant then 'ADMIN_GRANTED' else 'ADMIN_REVOKED' end,p_member);
end $$;

create function public.uc_candidates(p_name text) returns table(id uuid,full_name text)
language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni();
begin
  perform unix_private.require_admin(u);
  if length(trim(p_name)) between 2 and 100 then
    return query select p.id,p.full_name from public.profiles p join auth.users a on a.id=p.id
      where a.email_confirmed_at is not null and p.university_id=u and p.id<>auth.uid()
      and strpos(lower(p.full_name),lower(trim(p_name)))>0 order by p.full_name,p.id limit 20;
  end if;
end $$;
create function public.uc_set_mode(p_required boolean) returns void language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(true);
begin
  perform unix_private.require_admin(u);
  insert into unix_private.university_challenge_settings values(u,p_required)
    on conflict(university) do update set approval_required=excluded.approval_required;
  perform unix_private.record(u,case when p_required then 'MODE_APPROVAL' else 'MODE_INDEPENDENT' end,null);
end $$;
create function public.uc_appoint(p_member uuid,p_discipline text) returns void language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(true); a uuid;
begin
  perform unix_private.require_admin(u);
  if not exists(select from auth.users where id=p_member and email_confirmed_at is not null)
    then raise no_data_found; end if;
  insert into unix_private.captain_appointments(member,university,discipline,granted_by)
    values(p_member,u,p_discipline,auth.uid()) returning id into a;
  perform unix_private.record(u,'CAPTAIN_APPOINTED',a);
end $$;
create function public.uc_revoke(p_appointment uuid) returns void language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(true);
begin
  perform unix_private.require_admin(u);
  update unix_private.captain_appointments set revoked_at=now(),revoked_by=auth.uid()
    where id=p_appointment and university=u and revoked_at is null;
  if not found then raise no_data_found; end if;
  perform c.id from public.university_challenges c where c.id in (select challenge from unix_private.challenge_requests
    where appointment=p_appointment and status='PENDING') order by c.id for update;
  update public.university_challenges set state='CANCELLED' where state='PENDING_APPROVAL' and id in
    (select challenge from unix_private.challenge_requests where appointment=p_appointment and kind='CREATE' and status='PENDING');
  update unix_private.challenge_requests set status='INVALID',decided_at=now(),decided_by=auth.uid()
    where appointment=p_appointment and status='PENDING';
  perform unix_private.record(u,'CAPTAIN_REVOKED',p_appointment);
end $$;

create function public.uc_create(p_id uuid,p_discipline text,p_target text,p_title text,p_description text,
  p_date date,p_venue text) returns void language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(true); a uuid:=unix_private.appointment(u,p_discipline);
  pending boolean:=a is not null and unix_private.needs_approval(u);
  deadline timestamptz:=least(now()+interval '30 days',((p_date+1)::timestamp at time zone 'Asia/Tashkent'));
begin
  if deadline<=clock_timestamp() then raise exception 'Expired'; end if;
  insert into public.university_challenges(id,creator,discipline,target,title,description,proposed_date,venue,state,expires_at,published_at)
    values(p_id,u,p_discipline,p_target,trim(p_title),p_description,p_date,p_venue,
      case when pending then 'PENDING_APPROVAL' else 'OPEN' end,deadline,case when not pending then now() end);
  if pending then insert into unix_private.challenge_requests(challenge,appointment,university,kind) values(p_id,a,u,'CREATE'); end if;
  perform unix_private.record(u,case when pending then 'PROPOSED' else 'PUBLISHED' end,p_id);
end $$;

-- Called under the challenge row lock, including after a wait for another university.
create function unix_private.eligible(c public.university_challenges,u text) returns void language plpgsql set search_path='' as $$
begin
  if c.state<>'OPEN' or c.expires_at<=clock_timestamp() or c.creator=u or (c.target is not null and c.target<>u)
    then raise exception 'Challenge unavailable'; end if;
end $$;
create function unix_private.finish(c public.university_challenges,u text) returns void language plpgsql set search_path='' as $$
begin
  perform unix_private.eligible(c,u);
  update public.university_challenges set state='ACCEPTED',opponent=u,accepted_at=clock_timestamp()
    where id=c.id and state='OPEN' and expires_at>clock_timestamp();
  if not found then raise exception 'Challenge unavailable'; end if;
  update unix_private.challenge_requests set status='INVALID',decided_at=now()
    where challenge=c.id and status='PENDING';
  perform unix_private.record(u,'ACCEPTED',c.id);
end $$;
create function public.uc_accept(p_challenge uuid) returns void language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(true); c public.university_challenges; a uuid;
begin
  select * into strict c from public.university_challenges where id=p_challenge for update;
  perform unix_private.eligible(c,u);
  a:=unix_private.appointment(u,c.discipline);
  if a is not null and exists(select from unix_private.challenge_requests where challenge=c.id
    and university=u and kind='ACCEPT' and status='PENDING') then raise exception 'Request already pending'; end if;
  if a is not null and unix_private.needs_approval(u) then
    insert into unix_private.challenge_requests(challenge,appointment,university,kind) values(c.id,a,u,'ACCEPT');
    perform unix_private.record(u,'ACCEPT_PROPOSED',c.id);
  else
    perform unix_private.finish(c,u);
  end if;
end $$;
create function public.uc_decide(p_request uuid,p_approve boolean) returns void language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(true); c public.university_challenges; r unix_private.challenge_requests;
begin
  perform unix_private.require_admin(u);
  select ch.* into strict c from public.university_challenges ch join unix_private.challenge_requests req on ch.id=req.challenge
    where req.id=p_request and req.university=u for update of ch;
  select * into strict r from unix_private.challenge_requests where id=p_request and status='PENDING' for update;
  if p_approve is null or c.expires_at<=clock_timestamp() or not exists(select from unix_private.captain_appointments
    where id=r.appointment and university=u and discipline=c.discipline and revoked_at is null)
    then raise exception 'Request unavailable'; end if;
  update unix_private.challenge_requests set status=case when p_approve then 'APPROVED' else 'REJECTED' end,
    decided_by=auth.uid(),decided_at=now() where id=r.id;
  if r.kind='CREATE' then
    update public.university_challenges set state=case when p_approve then 'OPEN' else 'CANCELLED' end,
      published_at=case when p_approve then now() end where id=c.id and creator=u and state='PENDING_APPROVAL';
    if not found then raise exception 'Challenge unavailable'; end if;
  elsif p_approve then perform unix_private.finish(c,u);
  else perform unix_private.eligible(c,u);
  end if;
  perform unix_private.record(u,case when p_approve then 'APPROVED' else 'REJECTED' end,r.id);
end $$;
create function public.uc_cancel(p_challenge uuid) returns void language plpgsql security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(true);
begin
  perform unix_private.require_admin(u);
  update public.university_challenges set state='CANCELLED' where id=p_challenge and creator=u
    and state in ('OPEN','PENDING_APPROVAL') and expires_at>clock_timestamp();
  if not found then raise exception 'Challenge unavailable'; end if;
  update unix_private.challenge_requests set status='INVALID',decided_at=now() where challenge=p_challenge and status='PENDING';
  perform unix_private.record(u,'CANCELLED',p_challenge);
end $$;

-- Limited, non-identifying access summary for rendering public pages.
create function public.uc_access() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare u text:=unix_private.actor_uni();
begin
  return jsonb_build_object('university',u,'admin',unix_private.is_admin(u),'approval',unix_private.needs_approval(u),
    'disciplines',array(select discipline from unix_private.captain_appointments where member=auth.uid() and university=u and revoked_at is null),
    'pending',array(select r.challenge from unix_private.challenge_requests r join public.university_challenges c on c.id=r.challenge
      where r.university=u and r.status='PENDING' and r.kind='ACCEPT' and c.expires_at>now() and
      (unix_private.is_admin(u) or exists(select from unix_private.captain_appointments a where a.member=auth.uid()
        and a.revoked_at is null and a.university=u and a.discipline=c.discipline))));
end $$;
create function public.uc_dashboard() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare u text:=unix_private.actor_uni(); admin boolean:=unix_private.is_admin(u);
begin
  if not admin and not exists(select from unix_private.captain_appointments where member=auth.uid() and revoked_at is null)
    then raise insufficient_privilege; end if;
  return jsonb_build_object(
    'roster',array(select jsonb_build_object('id',a.id,'name',p.full_name,'discipline',a.discipline)
      from unix_private.captain_appointments a join public.profiles p on p.id=a.member
      where admin and a.university=u and a.revoked_at is null order by p.full_name,a.discipline),
    'requests',array(select jsonb_build_object('id',r.id,'title',c.title,'kind',r.kind,'creator',c.creator,'target',c.target,
        'description',c.description,'date',c.proposed_date,'venue',c.venue,'name',p.full_name,'status',
        case when r.status='PENDING' and c.expires_at<=now() then 'EXPIRED' else r.status end,'discipline',c.discipline)
      from unix_private.challenge_requests r join public.university_challenges c on c.id=r.challenge
      join unix_private.captain_appointments a on a.id=r.appointment
      join public.profiles p on p.id=a.member
      where r.university=u and (admin or a.member=auth.uid())
      order by (r.status='PENDING' and c.expires_at>now()) desc,r.created_at desc),
    'activity',array(select jsonb_build_object('id',c.id,'title',c.title,'creator',c.creator,'target',c.target,'opponent',c.opponent,
      'status',case when state in ('OPEN','PENDING_APPROVAL') and expires_at<=now() then 'EXPIRED' else state end)
      from public.university_challenges c where creator=u or (published_at is not null and (target=u or opponent=u))
        or exists(select from unix_private.challenge_requests r where r.university=u and r.challenge=c.id)
      order by c.created_at desc limit 100));
end $$;

-- New PostgreSQL functions initially grant PUBLIC execute. The whole migration
-- is transactional. Do not alter privileges of unrelated application functions.
revoke all on all functions in schema unix_private from public, anon, authenticated;
do $$
declare f regprocedure;
begin
  foreach f in array array[
    'public.uc_access()'::regprocedure,'public.uc_dashboard()'::regprocedure,
    'public.uc_set_admin(uuid,text,boolean)'::regprocedure,'public.uc_candidates(text)'::regprocedure,
    'public.uc_set_mode(boolean)'::regprocedure,'public.uc_appoint(uuid,text)'::regprocedure,
    'public.uc_revoke(uuid)'::regprocedure,'public.uc_create(uuid,text,text,text,text,date,text)'::regprocedure,
    'public.uc_accept(uuid)'::regprocedure,'public.uc_decide(uuid,boolean)'::regprocedure,
    'public.uc_cancel(uuid)'::regprocedure
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated',f);
    execute format('grant execute on function %s to authenticated',f);
  end loop;
end $$;
commit;
