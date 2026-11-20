begin;
create table public.university_challenges (
  id uuid primary key, creator text not null references public.universities(id),
  discipline text not null references public.disciplines(id),
  target text references public.universities(id), opponent text references public.universities(id),
  title text not null check(length(trim(title)) between 1 and 120),
  description text not null check(length(description)<=2000),
  proposed_date date, venue text check(length(venue)<=160),
  state text not null check(state in ('PENDING_APPROVAL','OPEN','ACCEPTED','CANCELLED')),
  created_at timestamptz not null default now(), expires_at timestamptz not null,
  published_at timestamptz, accepted_at timestamptz,
  check(expires_at > created_at), check(creator <> target), check(creator <> opponent),
  check(target is null or opponent is null or target=opponent),
  check((state='ACCEPTED')=(opponent is not null)), check((state='ACCEPTED')=(accepted_at is not null)),
  check(state not in ('OPEN','ACCEPTED') or published_at is not null)
);
create index challenge_feed_recent on public.university_challenges(created_at desc);
create index challenge_feed_filter on public.university_challenges(discipline,state);
create index challenge_creator on public.university_challenges(creator);
create index challenge_target on public.university_challenges(target);
create index challenge_opponent on public.university_challenges(opponent);
alter table public.university_challenges enable row level security;
revoke all on public.university_challenges from public, anon, authenticated;
grant select on public.university_challenges to anon, authenticated;
create policy published_only on public.university_challenges for select to anon, authenticated
  using (published_at is not null);
-- Expiration is effective without a scheduler, including between page load and approval.
create view public.challenge_feed with (security_invoker=true) as
  select c.*, case when state in ('OPEN','PENDING_APPROVAL') and expires_at<=now()
    then 'EXPIRED' else state end as status,
    case when target is null then 'OPEN' else 'DIRECT' end as kind
  from public.university_challenges c;
revoke all on public.challenge_feed from public, anon, authenticated;
grant select on public.challenge_feed to anon, authenticated;

create table unix_private.challenge_requests (
  id uuid primary key default gen_random_uuid(),
  challenge uuid not null references public.university_challenges(id),
  appointment uuid not null references unix_private.captain_appointments(id),
  university text not null references public.universities(id),
  kind text not null check(kind in ('CREATE','ACCEPT')),
  status text not null default 'PENDING' check(status in ('PENDING','APPROVED','REJECTED','INVALID')),
  created_at timestamptz not null default now(),
  decided_by uuid references public.profiles(id), decided_at timestamptz
);
create unique index one_pending_per_uni on unix_private.challenge_requests(challenge,university,kind)
  where status='PENDING';
create index request_inbox on unix_private.challenge_requests(university,status);
create index request_captain on unix_private.challenge_requests(appointment);
create table unix_private.challenge_audit (
  id bigint generated always as identity primary key, at timestamptz not null default now(),
  actor uuid not null references public.profiles(id), university text not null references public.universities(id),
  event text not null, object_id uuid
);
alter table unix_private.challenge_requests enable row level security;
alter table unix_private.challenge_audit enable row level security;
revoke all on all tables in schema unix_private from public, anon, authenticated;
commit;
