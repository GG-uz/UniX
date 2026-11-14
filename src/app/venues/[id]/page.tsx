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
import { formatCurrency } from '@/lib/utils';
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
        <h2 className="text-xl font-bold text-white">Venue Not Found</h2>
        <p className="text-sm text-neutral-400 mt-2">The requested arena does not exist or has been removed.</p>
        <Link href="/venues" className="mt-4 inline-block text-amber-500 font-bold text-xs underline">
          &larr; Back to Venues
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Arenas
        </button>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 mb-10">
          <div className="h-72 sm:h-96 w-full relative">
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            {venue.isFeatured && (
              <div className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Partner Arena
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-xs font-bold text-white">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{venue.rating}</span>
                    <span className="text-neutral-400">({venue.reviewCount} verified matches)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-xs text-neutral-300 font-medium">
                    {venue.surfaceType}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {venue.name}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{venue.address}, {venue.city}</span>
                </div>
              </div>

              <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-4 rounded-2xl text-right">
                <div className="text-xs text-neutral-400">Rental Rate</div>
                <div className="text-2xl font-black text-white">{formatCurrency(venue.hourlyRate)}</div>
                <div className="text-[11px] text-emerald-400 font-semibold">{availableSlotsCount} open slots</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Main Column: Time Slots Grid */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Available Time Slots</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Click any open slot to reserve or create an open challenge with 50% split deposit.
                </p>
              </div>
            </div>

            <SlotGrid venue={venue} />
          </div>

          {/* Right Sidebar: Rules, Amenities & Manager Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* STRICT 48-HOUR CANCELLATION POLICY BOX */}
            <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/40 text-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Strict 48-Hour Cancellation Rule
              </div>
              <p className="text-neutral-300 leading-relaxed text-xs">
                All slot reservations at <strong>{venue.name}</strong> require prepayment.
              </p>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] space-y-1.5">
                <div className="flex justify-between text-neutral-300">
                  <span>&gt;48 Hours Before:</span>
                  <span className="font-bold text-emerald-400">100% Full Refund</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>&le;48 Hours Before:</span>
                  <span className="font-bold text-red-400">Deposit Forfeited</span>
                </div>
              </div>
            </div>

            {/* Amenities Included */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Arena Amenities
              </h3>
              <div className="space-y-2">
                {venue.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Venue Manager Contact */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-white text-xs">
                Arena Manager
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  alt="Manager"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                />
                <div>
                  <div className="font-bold text-white">Dmitry Smirnov</div>
                  <div className="text-[11px] text-neutral-400">Verified Partner Operator</div>
                </div>
              </div>
              <div className="pt-2 border-t border-neutral-800 space-y-1 text-neutral-400 text-[11px]">
                <div>Response time: &lt; 15 mins</div>
                <div>Prepayment: Stripe Escrow Protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VenueDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-white">Loading arena details...</div>}>
      <VenueDetailContent />
    </Suspense>
  );
}
