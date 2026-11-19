import { Suspense } from 'react';
import { requireProfile } from '@/lib/auth/session';

async function Organizer() {
  const profile = await requireProfile(['VENUE_MANAGER', 'SUPER_ADMIN']);
  return <section className="mx-auto max-w-lg py-12 px-5">
    <h1 className="text-3xl font-bold">Кабинет организатора</h1>
    <p className="mt-4">{profile.full_name} · {profile.university.name}</p>
  </section>;
}

export default function OrganizerPage() {
  return <Suspense fallback={null}><Organizer /></Suspense>;
}
