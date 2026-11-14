'use client';

import React from 'react';
import Link from 'next/link';
import { Venue } from '@/types';
import { Sparkles, Star, MapPin, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VenueCardProps {
  venue: Venue;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const availableSlots = venue.slots.filter((s) => !s.isBooked).length;

  return (
    <div
      className={`rounded-2xl bg-neutral-900 border transition-all duration-300 flex flex-col overflow-hidden group ${
        venue.isFeatured
          ? 'border-amber-500/50 shadow-xl shadow-amber-500/5 hover:border-amber-400'
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
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-[11px] uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3 h-3 text-neutral-950" />
            Featured
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-xs font-bold text-white">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{venue.rating}</span>
        </div>

        {/* Surface badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[11px] font-medium text-neutral-300 bg-neutral-900/90 backdrop-blur-md px-2 py-0.5 rounded border border-neutral-700">
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
                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate max-w-[200px]">{venue.address}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-black text-white">{formatCurrency(venue.hourlyRate)}</span>
              <span className="text-[10px] text-neutral-400 block">/ hour</span>
            </div>
          </div>

          {/* Sport Badges */}
          <div className="mt-3 flex flex-wrap gap-1">
            {venue.sportTypes.map((sport) => (
              <span
                key={sport}
                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700"
              >
                {sport}
              </span>
            ))}
          </div>

          {/* Available Slots Indicator */}
          <div className="mt-4 text-xs flex items-center justify-between text-neutral-400">
            <span>Open slots:</span>
            <span className="font-semibold text-emerald-400">{availableSlots} slots available</span>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>48h Policy</span>
          </div>

          <Link
            href={`/venues/${venue.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-neutral-700 group-hover:border-amber-500/50"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
