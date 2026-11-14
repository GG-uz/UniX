'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import {
  Trophy,
  Shield,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building2,
  Calendar,
  XCircle,
  Check,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const {
    currentUser,
    userTeam,
    matches,
    venues,
    cancelBooking,
    switchUserRole,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'MY_MATCHES' | 'TEAM_STATS' | 'MANAGER_VIEW'>('MY_MATCHES');
  const [nowTime, setNowTime] = useState<number>(0);

  React.useEffect(() => {
    setNowTime(Date.now());
  }, []);

  // Matches involving this team
  const myMatches = matches.filter(
    (m) => m.challengerTeamId === userTeam.id || m.opponentTeamId === userTeam.id
  );

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentUser.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentUser.universityName ? (
                  <span className="font-semibold text-neutral-300">{currentUser.universityName}</span>
                ) : (
                  'Venue Administration'
                )}{' '}
                • {currentUser.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl">{userTeam.logoUrl}</span>
                <span className="text-xs font-bold text-white">{userTeam.name}</span>
                <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  {userTeam.sportType}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="text-center px-2">
              <div className="text-xs text-neutral-400">Total Points</div>
              <div className="text-xl font-black text-amber-400">{userTeam.totalPoints}</div>
            </div>
            <div className="w-px h-8 bg-neutral-800" />
            <div className="text-center px-2">
              <div className="text-xs text-neutral-400">Record</div>
              <div className="text-sm font-bold text-white">
                {userTeam.matchesWon}W - {userTeam.matchesDrawn}D - {userTeam.matchesLost}L
              </div>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setActiveTab('MY_MATCHES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'MY_MATCHES'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            My Team&apos;s Bookings &amp; Matches ({myMatches.length})
          </button>

          <button
            onClick={() => setActiveTab('TEAM_STATS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'TEAM_STATS'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Roster &amp; Form
          </button>

          {currentUser.role === 'VENUE_MANAGER' && (
            <button
              onClick={() => setActiveTab('MANAGER_VIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'MANAGER_VIEW'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              Venue Manager Dashboard (Revenue)
            </button>
          )}
        </div>

        {/* Tab 1: My Matches & 48h Cancellation Control */}
        {activeTab === 'MY_MATCHES' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-neutral-300">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-amber-300 block">Strict 48-Hour Cancellation Rule Active:</strong>
                Cancelling any match booking at least 48 hours prior to kickoff issues an instant 100% deposit refund.
                Within 48 hours, the deposit is forfeited to compensate the arena operator.
              </div>
            </div>

            {myMatches.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-neutral-900 border border-neutral-800">
                <p className="text-sm text-neutral-400">No active match reservations found.</p>
                <Link
                  href="/venues"
                  className="mt-4 inline-block px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
                >
                  Reserve an Arena Slot
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myMatches.map((m) => {
                  const hasBooking = !!m.booking;
                  const isWithin48h =
                    hasBooking && nowTime > 0 && nowTime > new Date(m.booking!.cancellationDeadline).getTime();

                  return (
                    <div
                      key={m.id}
                      className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
                            {m.sportType}
                          </span>
                          <span className="text-neutral-400 text-xs">
                            {formatDate(m.scheduledDate)} at {formatTime(m.scheduledDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between my-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                          <div className="font-bold text-sm text-white">
                            {m.challengerTeam.name}
                          </div>
                          <span className="text-xs text-neutral-500 font-bold">VS</span>
                          <div className="font-bold text-sm text-white">
                            {m.opponentTeam?.name || 'Open Slot'}
                          </div>
                        </div>

                        <div className="text-xs text-neutral-400 space-y-1 mt-3">
                          <div><strong>Venue:</strong> {m.venue.name}</div>
                          <div><strong>Status:</strong> <span className="text-amber-400 font-bold">{m.status}</span></div>
                          {hasBooking && (
                            <>
                              <div>
                                <strong>Deposit Paid:</strong> {formatCurrency(m.booking!.amountPaid)}{' '}
                                ({m.booking!.paymentStatus})
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                <strong>Deadline:</strong> {formatDate(m.booking!.cancellationDeadline)} {formatTime(m.booking!.cancellationDeadline)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Action */}
                      {hasBooking && m.status !== 'COMPLETED' && (
                        <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                          <span className="text-[11px] text-neutral-400">
                            {isWithin48h ? (
                              <span className="text-red-400 font-semibold">Under 48h (Deposit forfeited)</span>
                            ) : (
                              <span className="text-emerald-400 font-semibold">&gt;48h (100% Refundable)</span>
                            )}
                          </span>

                          <button
                            onClick={() => cancelBooking(m.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900 text-red-300 text-xs font-bold transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Team Roster & Stats */}
        {activeTab === 'TEAM_STATS' && (
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white">Team Performance &amp; Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Wins</div>
                <div className="text-2xl font-black text-emerald-400">{userTeam.matchesWon}</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Draws</div>
                <div className="text-2xl font-black text-neutral-300">{userTeam.matchesDrawn}</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Losses</div>
                <div className="text-2xl font-black text-red-400">{userTeam.matchesLost}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Venue Manager Dashboard */}
        {activeTab === 'MANAGER_VIEW' && (() => {
          // Dynamically compute manager's venue stats
          const myVenues = venues.filter((v) => v.managerId === currentUser.id);
          const myVenueIds = new Set(myVenues.map((v) => v.id));
          const venueMatches = matches.filter((m) => myVenueIds.has(m.venueId));

          const totalRevenue = venueMatches.reduce((sum, m) => sum + (m.booking?.amountPaid ?? 0), 0);
          const totalBookedSlots = myVenues.reduce(
            (sum, v) => sum + v.slots.filter((s) => s.isBooked).length,
            0
          );
          const forfeitedRevenue = venueMatches
            .filter((m) => m.booking?.paymentStatus === 'FORFEITED')
            .reduce((sum, m) => sum + (m.booking?.amountPaid ?? 0), 0);

          const displayVenueName = myVenues[0]?.name ?? 'Your Venue';

          return (
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">{displayVenueName} — Management Portal</h3>
                  <p className="text-xs text-neutral-400">Revenue, booked slots, and late cancellation compensations.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  {myVenues.length} Venue{myVenues.length !== 1 ? 's' : ''} Managed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="text-xs text-neutral-400">Total Revenue (Prepaid)</div>
                  <div className="text-2xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">{venueMatches.length} confirmed bookings</div>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="text-xs text-neutral-400">Booked Slots</div>
                  <div className="text-2xl font-black text-white">{totalBookedSlots}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">across all your venues</div>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="text-xs text-neutral-400">48h Forfeited Deposits</div>
                  <div className="text-2xl font-black text-amber-400">${forfeitedRevenue.toFixed(2)}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">kept per late-cancel policy</div>
                </div>
              </div>

              {myVenues.length === 0 && (
                <div className="text-center text-sm text-neutral-400 py-8">
                  No venues linked to your account yet. Contact Admin to register a venue.
                </div>
              )}

              {/* Per-venue booking breakdown */}
              {myVenues.map((venue) => {
                const vMatches = matches.filter((m) => m.venueId === venue.id);
                return (
                  <div key={venue.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-bold text-white">{venue.name}</div>
                        <div className="text-[11px] text-neutral-400">{venue.address}</div>
                      </div>
                      {venue.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">⭐ Featured</span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400">{vMatches.length} matches booked · {venue.slots.filter(s => s.isBooked).length}/{venue.slots.length} slots taken</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
