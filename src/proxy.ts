import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authConfig, cookieOptions } from './lib/supabase/config';

export async function proxy(request: NextRequest) {
  const login = () => NextResponse.redirect(new URL('/auth/login', request.nextUrl.origin), {
    status: 303, headers: { 'Cache-Control': 'private, no-store' },
  });
  const config = authConfig();
  const publicPage = request.nextUrl.pathname.replace(/\/$/, '') === '/challenges';
  if (!config) return publicPage ? NextResponse.next() : login();
  let response = NextResponse.next({ request });
  const client = createServerClient(config.url, config.key, {
    cookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (updates) => {
        for (const { name, value } of updates) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of updates) response.cookies.set(name, value, options);
      },
    },
  });
  const { data: { user } } = await client.auth.getUser();
  if (!publicPage && !user?.email_confirmed_at) {
    const denied = login();
    for (const cookie of response.cookies.getAll()) denied.cookies.set(cookie);
    return denied;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/profile/:path*', '/admin/:path*', '/organizer/:path*', '/challenges/:path*', '/university/dashboard/:path*'] };
