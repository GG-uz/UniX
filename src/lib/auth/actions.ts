'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase/server';

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

export async function register(form: FormData) {
  const client = await supabase(true);
  if (!client) redirect('/auth/register?status=unavailable');
  const email = field(form, 'email').trim();
  const password = field(form, 'password');
  const fullName = field(form, 'full_name').trim();
  const university = field(form, 'university_id');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      password.length < 12 || password.length > 128 || !fullName || fullName.length > 100 ||
      !/^[a-z0-9-]{1,64}$/.test(university)) redirect('/auth/register?status=invalid');
  const { data, error } = await client.from('universities').select('id').eq('id', university).maybeSingle();
  if (error || !data) redirect('/auth/register?status=university');
  const result = await client.auth.signUp({ email, password, options: {
    data: { full_name: fullName, university_id: university },
  } });
  if (result.error) redirect('/auth/register?status=failed');
  redirect('/auth/login?status=confirm');
}

export async function login(form: FormData) {
  const client = await supabase(true);
  if (!client) redirect('/auth/login?status=unavailable');
  const email = field(form, 'email').trim();
  const password = field(form, 'password');
  if (!email || email.length > 254 || !password || password.length > 128)
    redirect('/auth/login?status=invalid');
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect('/auth/login?status=invalid');
  redirect('/profile');
}

export async function signout() {
  const client = await supabase(true);
  if (client) {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) redirect('/auth/login?status=signout');
  }
  redirect('/auth/login');
}
