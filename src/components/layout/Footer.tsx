import Link from 'next/link';
import { officialEvent } from '@/lib/officialEvent';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <div>
          <Link href="/" className="text-xl font-black text-amber-400">UniX</Link>
          <p className="mt-1 text-sm text-neutral-400">Соревнования университетов Узбекистана</p>
        </div>
        <nav aria-label="Дополнительные ссылки" className="flex flex-wrap items-center gap-x-6 text-sm font-semibold text-neutral-300">
          <Link className="py-3 hover:underline" href={officialEvent.href}>Официальный матч</Link>
          <Link className="py-3 hover:underline" href="/#organizers">Организаторам</Link>
          <Link className="py-3 hover:underline" href="/venues">Площадки (демо)</Link>
        </nav>
      </div>
    </footer>
  );
}
