import 'server-only';
import { notFound, redirect } from 'next/navigation';
import type { UserRole } from '@/types';
import { supabase } from '@/lib/supabase/server';

export async function requireProfile(allowed?: readonly UserRole[]) {
  const client = await supabase();
  if (!client) redirect('/auth/login');
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) redirect('/auth/login');

  // An inner embed can hide the profile when the related row isn't visible.
  // Read the two rows under the same user's RLS and distinguish empty from failed.
  const profile = await client.from('profiles').select('full_name,role,university_id')
    .eq('id', user.id).maybeSingle()
    .overrideTypes<{ full_name: string; role: UserRole; university_id: string } | null, { merge: false }>();
  if (profile.error) redirect('/auth/login?status=retry');
  const data = profile.data;
  if (!data) redirect('/auth/login?status=profile');
  if (allowed && !allowed.includes(data.role)) notFound();
  const university = await client.from('universities').select('name')
    .eq('id', data.university_id).maybeSingle();
  if (university.error) redirect('/auth/login?status=retry');
  if (!university.data) redirect('/auth/login?status=profile');
  return { ...data, university: university.data, email: user.email };
}
