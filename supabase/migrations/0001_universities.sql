begin;
create table public.universities (
  id text primary key,
  name text not null unique
);
alter table public.universities enable row level security;
revoke all on public.universities from public, anon, authenticated;
grant select on public.universities to anon, authenticated;
create policy university_directory on public.universities
  for select to anon, authenticated using (true);

-- Directory entries, not claims of partnership or verified membership.
insert into public.universities (id, name) values
  ('team', 'TEAM University'), ('cau', 'Central Asian University'),
  ('wiut', 'WIUT (Westminster)'), ('inha', 'Inha University Tashkent'),
  ('mdist', 'MDIST'), ('amity', 'Amity University Tashkent'), ('tuit', 'TUIT');
commit;
