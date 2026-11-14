'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { CreateChallengeModal } from '@/components/challenges/CreateChallengeModal';
import { Swords, Plus, Filter, Sparkles } from 'lucide-react';
import { SportType } from '@/types';

function ChallengesContent() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get('sport') || 'ALL';

  const { matches, userTeam } = useAppState();
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'BOOKED'>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredMatches = matches.filter((m) => {
    const matchesSport = selectedSport === 'ALL' || m.sportType === selectedSport;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    return matchesSport && matchesStatus;
  });

  const openCount = matches.filter((m) => m.status === 'OPEN').length;

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Swords className="w-3.5 h-3.5" />
              Inter-University Matchmaking
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Challenge Board &amp; Match Feed
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Post open match requests, accept challenges from rival faculties, and split arena rental fees automatically with guaranteed escrow protection.
            </p>
          </div>

          {/* Post Challenge CTA */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post New Challenge</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 mb-8">
          {/* Sport Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
            {['ALL', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL'].map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSport === sport
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {sport === 'ALL' ? 'All Sports' : sport === 'FOOTBALL' ? '⚽ Football' : sport === 'BASKETBALL' ? '🏀 Basketball' : '🏐 Volleyball'}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                selectedStatus === 'ALL'
                  ? 'bg-neutral-800 text-white border-neutral-700'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              All Fixtures
            </button>
            <button
              onClick={() => setSelectedStatus('OPEN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                selectedStatus === 'OPEN'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Open ({openCount})
            </button>
            <button
              onClick={() => setSelectedStatus('BOOKED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                selectedStatus === 'BOOKED'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Locked &amp; Confirmed
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        {filteredMatches.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800">
            <Swords className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No challenges match this filter</h3>
            <p className="text-xs text-neutral-400 mt-1">Be the first to post a match challenge for your university team!</p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
            >
              Post Challenge Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <ChallengeCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Create Challenge Modal */}
        {createModalOpen && (
          <CreateChallengeModal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white">Loading challenges...</div>}>
      <ChallengesContent />
    </Suspense>
  );
}
