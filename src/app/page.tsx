import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturedVenues } from '@/components/landing/FeaturedVenues';
import { LiveTicker } from '@/components/landing/LiveTicker';
import Link from 'next/link';
import { Swords, MapPin, Trophy, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section & Quick Search */}
      <HeroSection />

      {/* 2. Live Challenge & Match Results Ticker */}
      <LiveTicker />

      {/* 3. High-Priority Featured Venues */}
      <FeaturedVenues />

      {/* 4. Platform Workflow Section (How It Works) */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Structured Matchmaking
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              How UniSport League Eliminates No-Shows
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              University matches fail when teams back out on matchday. Our escrow-backed prepayment model fixes collegiate sports scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative group hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pick Arena &amp; Slot</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Choose a certified stadium (e.g. Dynamo Arena, Luzhniki) and lock a convenient evening slot with an instant 50% split deposit.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative group hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center font-black text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rival Accepts Challenge</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Another university team accepts your open challenge on the board, paying their matching 50% share. The slot is fully paid.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative group hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Play &amp; Climb Ranks</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Play the derby under pro lights. Submit match scores directly to automatically update official inter-university league standings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. High-Impact Call to Action */}
      <section className="py-20 bg-gradient-to-b from-neutral-950 to-neutral-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 backdrop-blur-md">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to defend your university&apos;s pride?
            </h2>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto mt-3">
              Join 18+ university teams in Football, Basketball, and Volleyball. Book your team&apos;s next derby in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/challenges"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-bold text-sm shadow-xl shadow-orange-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                Browse Open Challenges
              </Link>
              <Link
                href="/venues"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition-colors"
              >
                Browse Sports Venues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
