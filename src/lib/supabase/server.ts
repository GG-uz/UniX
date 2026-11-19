import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authConfig, cookieOptions } from './config';

// Only actions and the callback can write cookies. Proxy handles refresh for reads.
export async function supabase(writable = false) {
  const jar = await cookies();
  const config = authConfig();
  if (!config) return null;
  return createServerClient(config.url, config.key, {
    cookieOptions,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (updates) => {
        if (writable) {
          for (const { name, value, options } of updates) jar.set(name, value, options);
        }
      },
    },
  });
}
