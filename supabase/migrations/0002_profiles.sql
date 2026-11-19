begin;
do $$ begin
  create type public.user_role as enum ('STUDENT_CAPTAIN', 'VENUE_MANAGER', 'SUPER_ADMIN');
exception when duplicate_object then null;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 1 and 100),
  university_id text not null references public.universities(id),
  role public.user_role not null default 'STUDENT_CAPTAIN'
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
create policy own_profile on public.profiles for select to authenticated
  using (id = (select auth.uid()));
-- No client INSERT/UPDATE/DELETE. Role changes require a trusted DB administrator.
commit;
