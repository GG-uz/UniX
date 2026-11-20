import { Suspense } from 'react';
import Link from 'next/link';
import DemoModeration from '@/components/admin/DemoModeration';
import { requireProfile } from '@/lib/auth/session';

async function Admin() {
  const profile = await requireProfile(['SUPER_ADMIN']);
  return <><Link href="/admin/universities" className="block p-4 text-center underline">Администраторы университетов</Link>
    <DemoModeration name={profile.full_name} /></>;
}

export default function AdminPage() {
  return <Suspense fallback={null}><Admin /></Suspense>;
}
