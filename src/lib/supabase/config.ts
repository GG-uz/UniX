import 'server-only';

export function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

// Auth calls are server-only; a browser Supabase client never needs these cookies.
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const, // allow the email confirmation link
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
