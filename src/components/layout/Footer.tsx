'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, Clock, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-sm mt-auto">
      {/* Top Banner: Rules & Guarantees */}
      <div className="border-b border-neutral-900/60 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Strict 48-Hour Guarantee</div>
              <div className="text-xs text-neutral-400">Cancel &gt;48h for 100% refund; late cancels forfeit deposit</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Verified Arena Operators</div>
              <div className="text-xs text-neutral-400">All venues inspected with FIFA / FIBA standard surfaces</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Official Inter-Uni Rankings</div>
              <div className="text-xs text-neutral-400">Automated points computation & official season cups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white tracking-tight">UNISPORT LEAGUE</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            The premier digital matchmaker and venue reservation infrastructure for collegiate student-athletes.
          </p>
          <div className="text-xs text-neutral-400">
            Powered by Next.js & Supabase
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Sports Disciplines</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/venues?sport=FOOTBALL" className="hover:text-amber-400 transition-colors">Football (5x5, 7x7, 11x11)</Link></li>
            <li><Link href="/venues?sport=BASKETBALL" className="hover:text-amber-400 transition-colors">Basketball (3x3, Full Court)</Link></li>
            <li><Link href="/venues?sport=VOLLEYBALL" className="hover:text-amber-400 transition-colors">Volleyball (Classic & Mixed)</Link></li>
            <li><Link href="/challenges" className="hover:text-amber-400 transition-colors">Open Match Challenges</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Partner Universities</h4>
          <ul className="space-y-2 text-xs">
            <li><span className="hover:text-white transition-colors">HSE University (Вышка)</span></li>
            <li><span className="hover:text-white transition-colors">Bauman Moscow State Tech (МГТУ)</span></li>
            <li><span className="hover:text-white transition-colors">Lomonosov Moscow State (МГУ)</span></li>
            <li><span className="hover:text-white transition-colors">Moscow Inst. Physics & Tech (МФТИ)</span></li>
            <li><span className="hover:text-white transition-colors">ITMO University (ИТМО)</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Venue Management</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/venues" className="hover:text-amber-400 transition-colors">List Your Sports Complex</Link></li>
            <li><span className="text-amber-400 font-medium">Featured Priority Placement ($)</span></li>
            <li><Link href="/venues" className="hover:text-amber-400 transition-colors">Automated Slot Scheduling</Link></li>
            <li><span className="hover:text-white transition-colors">Stripe & Direct Payouts</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
        <div>&copy; 2026-2027 UniSport League Inc. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link href="/venues" className="hover:underline">Cancellation Policy</Link>
          <Link href="/challenges" className="hover:underline">Fair Play Code</Link>
          <Link href="/leaderboards" className="hover:underline">Rulebook 2026/2027</Link>
        </div>
      </div>
    </footer>
  );
};
