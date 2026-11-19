import { supabase } from '@/lib/supabase/server';

function finish(location: '/profile' | '/auth/login?status=callback') {
  return new Response(null, { status: 303, headers: {
    Location: location, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer',
  } });
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  if (code && code.length <= 1024) {
    const client = await supabase(true);
    if (client) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return finish('/profile');
    }
  }
  return finish('/auth/login?status=callback');
}
