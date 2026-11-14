'use client';

import React from 'react';
import Link from 'next/link';
import { Venue } from '@/types';
import { Sparkles, Star, MapPin, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { formatCurrency, getDisciplineLabel } from '@/lib/utils';

interface VenueCardProps {
  venue: Venue;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const availableSlots = venue.slots.filter((s) => !s.isBooked).length;

  return (
    <div
      className={`rounded-3xl bg-neutral-900 border transition-all duration-300 flex flex-col overflow-hidden group shadow-xl ${
        venue.isFeatured
          ? 'border-amber-500/50 shadow-amber-500/5 hover:border-amber-400'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Image Cover */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

        {/* Priority Sponsored Badge */}
        {venue.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3 h-3 text-neutral-950" />
            Featured Партнер
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-xs font-bold text-white">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{venue.rating}</span>
          <span className="text-neutral-400 text-[10px]">({venue.reviewCount})</span>
        </div>

        {/* Surface badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-semibold text-neutral-200 bg-neutral-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-neutral-700">
            {venue.surfaceType}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                {venue.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{venue.address}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-amber-400 block">
                {formatCurrency(venue.hourlyRate)}
              </span>
              <span className="text-[10px] text-neutral-400 block">/ час</span>
            </div>
          </div>

          {/* Sport / Project Pills */}
          <div className="flex flex-wrap gap-1 my-3">
            {venue.sportTypes.map((sp) => (
              <span
                key={sp}
                className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-neutral-950 text-neutral-300 border border-neutral-800"
              >
                {getDisciplineLabel(sp)}
              </span>
            ))}
          </div>

          {/* Amenities Mini List */}
          <div className="flex items-center gap-3 text-[11px] text-neutral-400 my-2">
            {venue.amenities.slice(0, 2).map((am) => (
              <div key={am} className="flex items-center gap-1 truncate">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{am}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Слоты: <strong className="text-white font-bold">{availableSlots}</strong></span>
          </div>

          <Link
            href={`/venues/${venue.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-white font-bold text-xs border border-neutral-700 transition-all flex items-center gap-1 active:scale-95"
          >
            Выбрать слот <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
