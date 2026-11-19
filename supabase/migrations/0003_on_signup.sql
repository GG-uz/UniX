begin;
create function public.create_unix_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Both inputs are untrusted: profiles enforces the name limit and university FK.
  insert into public.profiles (id, full_name, university_id, role) values
    (new.id, btrim(new.raw_user_meta_data->>'full_name'),
     new.raw_user_meta_data->>'university_id', 'STUDENT_CAPTAIN');
  return new;
end;
$$;
revoke all on function public.create_unix_profile() from public, anon, authenticated;
create trigger unix_profile_on_signup after insert on auth.users
  for each row execute function public.create_unix_profile();
commit;
