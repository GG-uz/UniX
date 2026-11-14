'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/AppStateContext';
import { Sparkles, Star, MapPin, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const FeaturedVenues: React.FC = () => {
  const { venues } = useAppState();
  const featuredVenues = venues.filter((v) => v.isFeatured);

  return (
    <section className="py-16 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Priority Paid Partners
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Arenas &amp; Stadiums
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Top-tier sports facilities with guaranteed heating, professional referee booths, and instant time-slot booking.
            </p>
          </div>
          <Link
            href="/venues"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Explore all {venues.length} venues <ArrowRight className="w-4 h-4" />
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
                    Featured Partner
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-xs font-bold text-white">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{venue.rating}</span>
                    <span className="text-neutral-400">({venue.reviewCount})</span>
                  </div>

                  {/* Surface Tag */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-700">
                      {venue.surfaceType}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-800">
                      {availableSlots} slots open
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{venue.address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">{formatCurrency(venue.hourlyRate)}</div>
                        <div className="text-[11px] text-neutral-400 uppercase font-semibold">per hour</div>
                      </div>
                    </div>

                    {/* Amenities Pill List */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {venue.amenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700/60"
                        >
                          <CheckCircle className="w-3 h-3 text-amber-400" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 48-Hour Cancellation Guarantee & CTA */}
                  <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      <span>48-hr full refund guarantee</span>
                    </div>

                    <Link
                      href={`/venues/${venue.id}`}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:gap-2"
                    >
                      <span>Pick Time Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
