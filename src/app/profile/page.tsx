import Link from 'next/link';
import { Suspense } from 'react';
import { signout } from '@/lib/auth/actions';
import { requireProfile } from '@/lib/auth/session';

async function Profile() {
  const user = await requireProfile();
  const roles = { STUDENT_CAPTAIN: 'Студент', VENUE_MANAGER: 'Организатор', SUPER_ADMIN: 'Администратор' };
  return <section className="mx-auto max-w-lg px-5 py-12 space-y-4">
    <h1 className="text-3xl font-bold">{user.full_name}</h1>
    <p>{user.email}</p><p>{user.university.name} · {roles[user.role]}</p>
    {user.role !== 'STUDENT_CAPTAIN' && <Link className="block underline" href="/organizer">Кабинет организатора</Link>}
    {user.role === 'SUPER_ADMIN' && <Link className="block underline" href="/admin">Панель администратора</Link>}
    <form action={signout}><button className="rounded border px-4 py-2">Выйти</button></form>
  </section>;
}

export default function ProfilePage() {
  return <Suspense fallback={null}><Profile /></Suspense>;
}
