'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { SlotGrid } from '@/components/venues/SlotGrid';
import {
  Sparkles,
  Star,
  MapPin,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';
import { formatCurrency, getDisciplineLabel } from '@/lib/utils';
import Link from 'next/link';

function VenueDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { venues } = useAppState();

  const venueId = params.id as string;
  const venue = venues.find((v) => v.id === venueId);

  if (!venue) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-white">Площадка не найдена</h2>
        <p className="text-sm text-neutral-400 mt-2">Выбранная локация не существует или была перемещена.</p>
        <Link href="/venues" className="mt-4 inline-block text-amber-500 font-bold text-xs underline">
          &larr; Вернуться в каталог
        </Link>
      </div>
    );
  }

  const availableSlotsCount = venue.slots.filter((s) => !s.isBooked).length;

  return (
    <div className="py-10 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Назад к списку локаций
        </button>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 mb-10 shadow-2xl">
          <div className="h-72 sm:h-96 w-full relative">
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            {/* Badges */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              {venue.isFeatured && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                  Featured Партнер
                </div>
              )}
            </div>

            {/* Title & Info Bar */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  {venue.surfaceType}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white">{venue.name}</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-300 mt-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{venue.address}, {venue.city}</span>
                </div>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-2xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Тариф аренды
                </span>
                <span className="text-2xl font-black text-amber-400">
                  {formatCurrency(venue.hourlyRate)}
                </span>
                <span className="text-xs text-neutral-400 ml-1">/ час</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Left Details & Right Strict Policy Notice */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Доступные дисциплины и проекты</h3>
              <div className="flex flex-wrap gap-2">
                {venue.sportTypes.map((sp) => (
                  <span
                    key={sp}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-950 text-neutral-200 border border-neutral-800"
                  >
                    {getDisciplineLabel(sp)}
                  </span>
                ))}
              </div>

              <h3 className="text-base font-bold text-white pt-2">Удобства и Оснащение</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {venue.amenities.map((am) => (
                  <div key={am} className="flex items-center gap-2 text-xs text-neutral-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Strict 48h Policy Box */}
          <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/40 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Гарантия Отмены (48 Часов)</span>
              </div>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                На площадке действует строгое правило: отмена более чем за 48 часов до начала возвращает 100% залога. Поздняя отмена (&lt;48ч) передает депозит площадке.
              </p>
              <div className="mt-4 p-3 rounded-2xl bg-neutral-950 border border-amber-500/30 text-xs space-y-1.5 text-neutral-300">
                <div className="text-amber-400 font-bold">Условия бронирования:</div>
                <div>• Доступна сплит-оплата (50/50 с командой соперника)</div>
                <div>• Оплата через Payme, Click, Uzum Bank или Карту</div>
                <div>• Моментальное закрепление за вашей командой</div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs text-neutral-400">
              <span>Свободных слотов:</span>
              <span className="text-sm font-black text-white">{availableSlotsCount}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Slot Grid Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white">Расписание &amp; Доступные Слоты</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Выберите удобное время для проведения матча или научного поединка.
              </p>
            </div>
          </div>

          <SlotGrid venue={venue} />
        </div>
      </div>
    </div>
  );
}

export default function VenueDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 p-12 text-white">Загрузка площадки...</div>}>
      <VenueDetailContent />
    </Suspense>
  );
}
