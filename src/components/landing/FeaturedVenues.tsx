'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/AppStateContext';
import { Sparkles, Star, MapPin, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { formatCurrency, getDisciplineLabel } from '@/lib/utils';

export const FeaturedVenues: React.FC = () => {
  const { venues } = useAppState();
  const featuredVenues = venues.filter((v) => v.isFeatured);

  return (
    <section className="py-16 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Приоритетные Площадки &amp; Хабы
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Рекомендуемые Локации для Битв
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Кампус TEAM University, профессиональные футбольные комплексы и IT-арены Ташкента (ставка до 300 000 сум/час).
            </p>
          </div>
          <Link
            href="/venues"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Все {venues.length} площадки <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredVenues.map((venue) => {
            const availableSlots = venue.slots.filter((s) => !s.isBooked).length;
            return (
              <div
                key={venue.id}
                className="group relative rounded-3xl bg-neutral-900/80 border border-amber-500/30 overflow-hidden shadow-2xl hover:border-amber-400 transition-all duration-300 flex flex-col"
              >
                {/* Image Banner */}
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                  {/* Priority Sponsored Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                    Featured Партнер
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-neutral-700 text-xs text-white font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{venue.rating}</span>
                    <span className="text-neutral-400 text-[10px]">({venue.reviewCount})</span>
                  </div>

                  {/* Surface and Price pill */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                        {venue.surfaceType}
                      </span>
                      <h3 className="text-lg font-black text-white">{venue.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block">Аренда</span>
                      <span className="text-base font-black text-amber-400">
                        {formatCurrency(venue.hourlyRate)}
                      </span>
                      <span className="text-[11px] text-neutral-400">/час</span>
                    </div>
                  </div>
                </div>

                {/* Details Bottom Bar */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{venue.address}</span>
                    </div>

                    {/* Discipline Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {venue.sportTypes.map((sp) => (
                        <span
                          key={sp}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700"
                        >
                          {getDisciplineLabel(sp)}
                        </span>
                      ))}
                    </div>

                    {/* Amenities Checklist */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1">
                      {venue.amenities.slice(0, 4).map((am) => (
                        <div key={am} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{am}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-neutral-300">
                        Свободных слотов:{' '}
                        <strong className="text-white font-bold">{availableSlots}</strong>
                      </span>
                    </div>

                    <Link
                      href={`/venues/${venue.id}`}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 font-bold text-xs text-white border border-neutral-700 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      Забронировать слот <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
