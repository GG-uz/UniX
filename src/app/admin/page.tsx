import { Suspense } from 'react';
import DemoModeration from '@/components/admin/DemoModeration';
import { requireProfile } from '@/lib/auth/session';

async function Admin() {
  const profile = await requireProfile(['SUPER_ADMIN']);
  return <DemoModeration name={profile.full_name} />;
}

export default function AdminPage() {
  return <Suspense fallback={null}><Admin /></Suspense>;
}
