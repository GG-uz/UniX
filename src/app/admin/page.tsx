'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import {
  ShieldCheck,
  Users,
  MapPin,
  Swords,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  Eye,
  Lock,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { Match, Team, Venue } from '@/types';

export default function AdminPage() {
  const { currentUser, matches, teams, venues, resolveDispute, approveVenue, suspendTeam, showToast } =
    useAppState();

  const [activeTab, setActiveTab] = useState<'DISPUTES' | 'TEAMS' | 'VENUES'>('DISPUTES');

  // Only Super Admin can access this page
  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Lock className="w-14 h-14 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-white">Access Restricted</h2>
          <p className="text-sm text-neutral-400">
            This area is for <strong className="text-red-400">Super Admin</strong> role only.
          </p>
          <p className="text-xs text-neutral-500">
            Switch to the Admin persona via the Role Selector in the navbar.
          </p>
        </div>
      </div>
    );
  }

  const disputedMatches = matches.filter((m) => m.status === 'DISPUTED');
  const allMatches = matches;

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin Control Panel
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">League Moderation Hub</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Signed in as <strong className="text-white">{currentUser.fullName}</strong> (League Commissioner)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-neutral-400">Disputed Matches</div>
              <div className={`text-2xl font-black ${disputedMatches.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {disputedMatches.length}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Teams', value: teams.length, icon: Users, color: 'text-blue-400' },
            { label: 'Registered Venues', value: venues.length, icon: MapPin, color: 'text-amber-400' },
            { label: 'Total Matches', value: allMatches.length, icon: Swords, color: 'text-emerald-400' },
            { label: 'Open Disputes', value: disputedMatches.length, icon: AlertTriangle, color: disputedMatches.length > 0 ? 'text-red-400' : 'text-emerald-400' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-8">
          {[
            { id: 'DISPUTES', label: 'Score Disputes', badge: disputedMatches.length },
            { id: 'TEAMS', label: 'Team Management', badge: teams.length },
            { id: 'VENUES', label: 'Venue Approvals', badge: venues.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-black/20 text-neutral-900' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Tab: Disputes */}
        {activeTab === 'DISPUTES' && (
          <div className="space-y-6">
            {disputedMatches.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No Active Disputes</h3>
                <p className="text-xs text-neutral-400 mt-1">All submitted match scores are confirmed and in agreement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {disputedMatches.map((m) => (
                  <DisputeCard key={m.id} match={m} onResolve={resolveDispute} />
                ))}
              </div>
            )}

            {/* All Recent Matches Overview */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">All Recent Match Results</h3>
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-950/80 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3">Match</th>
                      <th className="px-4 py-3">Sport</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-center">Score</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {allMatches.map((m) => (
                      <tr key={m.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">
                          {m.challengerTeam.name} vs {m.opponentTeam?.name ?? 'Open'}
                        </td>
                        <td className="px-4 py-3 text-neutral-400">{m.sportType}</td>
                        <td className="px-4 py-3 text-neutral-400">{formatDate(m.scheduledDate)}</td>
                        <td className="px-4 py-3 text-center font-bold text-amber-400">
                          {m.scoreTeam1 !== undefined && m.scoreTeam2 !== undefined
                            ? `${m.scoreTeam1} – ${m.scoreTeam2}`
                            : '–'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              m.status === 'OPEN'
                                ? 'badge-open'
                                : m.status === 'BOOKED'
                                ? 'badge-booked'
                                : m.status === 'COMPLETED'
                                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                                : 'badge-disputed'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Teams */}
        {activeTab === 'TEAMS' && (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-950/80 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4">University</th>
                  <th className="px-5 py-4">Sport</th>
                  <th className="px-5 py-4 text-center">W–D–L</th>
                  <th className="px-5 py-4 text-center">Points</th>
                  <th className="px-5 py-4 text-center">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.logoUrl}</span>
                        <div>
                          <div className="font-bold text-white">{team.name}</div>
                          <div className="text-[11px] text-neutral-500">Capt: {team.captainName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-300">{team.universityName}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-bold uppercase">
                        {team.sportType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-bold">
                      <span className="text-emerald-400">{team.matchesWon}</span>–
                      <span className="text-neutral-400">{team.matchesDrawn}</span>–
                      <span className="text-red-400">{team.matchesLost}</span>
                    </td>
                    <td className="px-5 py-4 text-center font-black text-amber-400">{team.totalPoints}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => suspendTeam && suspendTeam(team.id)}
                        className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 text-[11px] font-bold transition-colors"
                      >
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Venues */}
        {activeTab === 'VENUES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-white">{venue.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{venue.address}</p>
                    </div>
                    {venue.isFeatured && (
                      <span className="badge-featured px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                    <div><strong className="text-neutral-300">Rate:</strong> {formatCurrency(venue.hourlyRate)}/hr</div>
                    <div><strong className="text-neutral-300">Rating:</strong> ⭐ {venue.rating}</div>
                    <div><strong className="text-neutral-300">Surface:</strong> {venue.surfaceType}</div>
                    <div><strong className="text-neutral-300">Total Slots:</strong> {venue.slots.length}</div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-neutral-800 flex gap-2">
                  <button
                    onClick={() => approveVenue && approveVenue(venue.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Venue
                  </button>
                  <button
                    onClick={() => showToast(`Venue "${venue.name}" flagged for review.`)}
                    className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Flag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Dispute Resolution Card ── */
function DisputeCard({
  match,
  onResolve,
}: {
  match: Match;
  onResolve?: (matchId: string, winnerId: string | null) => void;
}) {
  return (
    <div className="p-6 rounded-2xl bg-red-950/10 border border-red-500/30 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="badge-disputed px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Score Disputed
          </span>
          <span className="text-xs text-neutral-400">{formatDate(match.scheduledDate)}</span>
        </div>
        <div className="flex items-center justify-around bg-neutral-950/60 rounded-2xl p-4 border border-neutral-800/60 my-3">
          <div className="text-center">
            <div className="text-2xl">{match.challengerTeam.logoUrl}</div>
            <div className="text-xs font-bold text-white mt-1">{match.challengerTeam.name}</div>
            <div className="text-xl font-black text-amber-400 mt-1">{match.scoreTeam1 ?? '?'}</div>
          </div>
          <div className="text-sm font-black text-neutral-600">VS</div>
          <div className="text-center">
            <div className="text-2xl">{match.opponentTeam?.logoUrl ?? '🛡️'}</div>
            <div className="text-xs font-bold text-white mt-1">{match.opponentTeam?.name ?? 'Opponent'}</div>
            <div className="text-xl font-black text-amber-400 mt-1">{match.scoreTeam2 ?? '?'}</div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 italic">Venue: {match.venue.name}</p>
      </div>
      <div className="mt-5 pt-4 border-t border-red-900/40 flex gap-2">
        <button
          onClick={() => onResolve?.(match.id, match.challengerTeamId)}
          className="flex-1 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition-colors"
        >
          Award {match.challengerTeam.name}
        </button>
        <button
          onClick={() => onResolve?.(match.id, match.opponentTeamId ?? null)}
          className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors"
        >
          Award {match.opponentTeam?.name ?? 'Opponent'}
        </button>
        <button
          onClick={() => onResolve?.(match.id, null)}
          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors"
        >
          Draw
        </button>
      </div>
    </div>
  );
}
