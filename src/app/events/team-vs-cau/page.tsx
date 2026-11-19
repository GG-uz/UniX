import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { CopyEventLink } from '@/components/events/CopyEventLink';
import { officialEvent as event } from '@/lib/officialEvent';

const shareTitle = `${event.title} | UniX`;
export const metadata: Metadata = {
  title: event.title,
  description: event.description,
  openGraph: { type: 'website', siteName: 'UniX', locale: 'ru_RU', title: shareTitle, description: event.description },
  twitter: { card: 'summary', title: shareTitle, description: event.description },
};

export default function OfficialMatchPage() {
  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-12">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-amber-400 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> На главную UniX
      </Link>
      <header className="mt-4 rounded-3xl border border-amber-500/30 bg-neutral-900 p-6 sm:p-10">
        <p className="text-sm font-bold text-amber-400">Первое официальное событие UniX · {event.category} / {event.discipline}</p>
        <h1 className="my-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">{event.title}</h1>
        <p className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-400">
          <CalendarDays size={16} aria-hidden="true" /> {event.status}
        </p>
        <p className="mt-4 max-w-2xl text-neutral-300">{event.description}</p>
      </header>
      <section className="py-8" aria-labelledby="match-details">
        <h2 id="match-details" className="text-2xl font-bold">Информация о встрече</h2>
        <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-800 sm:grid-cols-2 lg:grid-cols-3">
          {['Дата', 'Время начала', 'Место проведения', 'Формат', 'Составы команд', 'Контакт организатора'].map(label => (
            <div key={label} className="bg-neutral-900 p-5">
              <dt className="text-sm text-neutral-400">{label}</dt>
              <dd className="mt-1 font-semibold">{event.pending}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-2xl border-l-4 border-amber-500 bg-neutral-900 p-5 sm:p-7">
        <h2 className="text-xl font-bold">Матч предстоит · Результат не опубликован</h2>
        <p className="mb-5 mt-2 text-neutral-300">Сохраните эту страницу, чтобы вернуться к деталям встречи.</p>
        <CopyEventLink />
      </section>
    </article>
  );
}
