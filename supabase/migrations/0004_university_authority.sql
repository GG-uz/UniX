begin;
create schema unix_private;
revoke all on schema unix_private from public, anon, authenticated;

create table public.disciplines (
  id text primary key, name text not null, category text not null
);
insert into public.disciplines values
 ('FOOTBALL','Футбол','Спорт'), ('BASKETBALL','Баскетбол','Спорт'),
 ('VOLLEYBALL','Волейбол','Спорт'), ('CHESS','Шахматы','Спорт'),
 ('MATHEMATICS','Математика','Образование'), ('PHYSICS','Физика','Образование'),
 ('CHEMISTRY','Химия','Образование'), ('IT_HACKATHON','IT-хакатон','IT'),
 ('ESPORTS','Киберспорт','IT'), ('CASE_CHAMPIONSHIP','Кейс-чемпионат','Бизнес'),
 ('OTHER','Другая дисциплина','Другое');
alter table public.disciplines enable row level security;
revoke all on public.disciplines from public, anon, authenticated;
grant select on public.disciplines to anon, authenticated;
create policy disciplines_read on public.disciplines for select to anon, authenticated using (true);

alter table public.profiles add constraint profiles_member_university unique (id, university_id);
create table unix_private.university_admins (
  member uuid primary key, university text not null,
  granted_by uuid not null references public.profiles(id), granted_at timestamptz not null default now(),
  foreign key(member, university) references public.profiles(id, university_id),
  check(member <> granted_by)
);
create index university_admins_by_uni on unix_private.university_admins(university);
create table unix_private.captain_appointments (
  id uuid primary key default gen_random_uuid(), member uuid not null, university text not null,
  discipline text not null references public.disciplines(id),
  granted_by uuid not null references public.profiles(id), granted_at timestamptz not null default now(),
  revoked_at timestamptz, revoked_by uuid references public.profiles(id),
  foreign key(member, university) references public.profiles(id, university_id),
  check(member <> granted_by), check((revoked_at is null) = (revoked_by is null))
);
create unique index captain_active on unix_private.captain_appointments(member,discipline) where revoked_at is null;
create index captain_roster on unix_private.captain_appointments(university,discipline) where revoked_at is null;
create table unix_private.university_challenge_settings (
  university text primary key references public.universities(id),
  approval_required boolean not null default true
);
alter table unix_private.university_admins enable row level security;
alter table unix_private.captain_appointments enable row level security;
alter table unix_private.university_challenge_settings enable row level security;
revoke all on all tables in schema unix_private from public, anon, authenticated;
commit;
