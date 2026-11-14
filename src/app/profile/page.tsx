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
import { formatCurrency, formatDate, formatTime, getDisciplineLabel } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const {
    currentUser,
    userTeam,
    matches,
    venues,
    cancelBooking,
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
                  {currentUser.role === 'STUDENT_CAPTAIN'
                    ? 'Студент-Капитан'
                    : currentUser.role === 'VENUE_MANAGER'
                    ? 'Менеджер площадок'
                    : 'Супер-Администратор'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentUser.universityName ? (
                  <span className="font-bold text-amber-400">{currentUser.universityName}</span>
                ) : (
                  'Управление Комплексами'
                )}{' '}
                • {currentUser.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl">{userTeam.logoUrl}</span>
                <span className="text-xs font-bold text-white">{userTeam.name}</span>
                <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  {getDisciplineLabel(userTeam.sportType)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">Очки</div>
              <div className="text-xl font-black text-amber-400">{userTeam.totalPoints}</div>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">Винрейт</div>
              <div className="text-xl font-black text-emerald-400">
                {Math.round(
                  (userTeam.matchesWon / (userTeam.matchesWon + userTeam.matchesLost + userTeam.matchesDrawn || 1)) * 100
                )}%
              </div>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-neutral-400 uppercase">Матчи</div>
              <div className="text-xl font-black text-white">
                {userTeam.matchesWon + userTeam.matchesLost + userTeam.matchesDrawn}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-neutral-800 mb-8 pb-1">
          <button
            onClick={() => setActiveTab('MY_MATCHES')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MY_MATCHES'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Мои Бронирования &amp; Матчи ({myMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('TEAM_STATS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'TEAM_STATS'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Состав &amp; Статистика Команды
          </button>
          <button
            onClick={() => setActiveTab('MANAGER_VIEW')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MANAGER_VIEW'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Кабинет Владельца Площадки (Выручка)
          </button>
        </div>

        {/* Tab 1: My Bookings & Matches */}
        {activeTab === 'MY_MATCHES' && (
          <div className="space-y-6">
            {myMatches.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
                <p className="text-sm text-neutral-400">У вашей команды пока нет активных бронирований слотов.</p>
                <Link
                  href="/venues"
                  className="mt-4 inline-block px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
                >
                  Забронировать Слот
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
                      className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
                            {getDisciplineLabel(m.sportType)}
                          </span>
                          <span className="text-neutral-400 text-xs">
                            {formatDate(m.scheduledDate)} в {formatTime(m.scheduledDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between my-2 p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                          <div className="font-bold text-sm text-white">
                            {m.challengerTeam.name}
                          </div>
                          <span className="text-xs text-neutral-500 font-bold">VS</span>
                          <div className="font-bold text-sm text-white text-right">
                            {m.opponentTeam ? m.opponentTeam.name : 'Ожидает соперника'}
                          </div>
                        </div>

                        <div className="text-xs text-neutral-400 space-y-1 mt-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span>{m.venue.name}</span>
                          </div>
                          <div className="pl-5 text-[11px] text-neutral-400">
                            {m.venue.surfaceType}
                          </div>
                        </div>

                        {/* Strict 48h Cancellation Box */}
                        {hasBooking && (
                          <div className="mt-4 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400 text-[11px]">Статус оплаты:</span>
                              <span className="font-bold text-amber-400 text-[11px]">
                                {m.booking!.paymentStatus === 'PAID_FULL'
                                  ? 'Оплачено 100%'
                                  : m.booking!.paymentStatus === 'PAID_SPLIT'
                                  ? 'Сплит (50%)'
                                  : m.booking!.paymentStatus === 'FORFEITED'
                                  ? 'Залог удержан'
                                  : 'Возвращено'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400 text-[11px]">Внесенный залог:</span>
                              <span className="font-bold text-white text-[11px]">
                                {formatCurrency(m.booking!.amountPaid)}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-500" /> Дедлайн 48ч:
                              </span>
                              <span className="text-[11px] font-bold text-neutral-300">
                                {formatDate(m.booking!.cancellationDeadline)} {formatTime(m.booking!.cancellationDeadline)}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {isWithin48h ? (
                                <span className="text-red-400 font-bold">
                                  ⚠ Дедлайн истек: при отмене залог будет удержан площадкой.
                                </span>
                              ) : (
                                <span className="text-emerald-400 font-bold">
                                  ✓ Отмена доступна со 100% возвратом депозита.
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cancel Action */}
                      {hasBooking && (m.status === 'OPEN' || m.status === 'BOOKED') && (
                        <div className="pt-4 border-t border-neutral-800 mt-4 flex justify-end">
                          <button
                            onClick={() => cancelBooking(m.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900 text-red-300 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Отменить бронирование
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

        {/* Tab 2: Team Details */}
        {activeTab === 'TEAM_STATS' && (
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white">Показатели Команды {userTeam.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Победы</div>
                <div className="text-2xl font-black text-emerald-400">{userTeam.matchesWon}</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Ничьи</div>
                <div className="text-2xl font-black text-neutral-300">{userTeam.matchesDrawn}</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Поражения</div>
                <div className="text-2xl font-black text-red-400">{userTeam.matchesLost}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Venue Manager Dashboard */}
        {activeTab === 'MANAGER_VIEW' && (() => {
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

          const displayVenueName = myVenues[0]?.name ?? 'Ваша площадка';

          return (
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">{displayVenueName} — Кабинет Арены</h3>
                  <p className="text-xs text-neutral-400">Выручка, занятые слоты и компенсации за позднюю отмену.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  {myVenues.length} Площадок под управлением
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="text-xs text-neutral-400">Общая Выручка с Предоплат</div>
                  <div className="text-2xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">{venueMatches.length} подтвержденных броней</div>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="text-xs text-neutral-400">Занятые Слоты</div>
                  <div className="text-2xl font-black text-white">{totalBookedSlots}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">на всех локациях</div>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="text-xs text-neutral-400">Удержано по правилу 48ч</div>
                  <div className="text-2xl font-black text-amber-400">{formatCurrency(forfeitedRevenue)}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">компенсация за срыв слотов</div>
                </div>
              </div>

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
                    <div className="text-xs text-neutral-400">{vMatches.length} матчей забронировано · {venue.slots.filter(s => s.isBooked).length}/{venue.slots.length} слотов занято (до {formatCurrency(venue.hourlyRate)}/ч)</div>
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
