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
  Lock,
} from 'lucide-react';
import { formatCurrency, formatDate, getDisciplineLabel } from '@/lib/utils';
import { Match } from '@/types';

export default function AdminPage() {
  const { currentUser, matches, teams, venues, resolveDispute, approveVenue, suspendTeam, showToast } =
    useAppState();

  const [activeTab, setActiveTab] = useState<'DISPUTES' | 'TEAMS' | 'VENUES'>('DISPUTES');

  // Only Super Admin can access this page
  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3 p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl max-w-md">
          <Lock className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-white">Доступ Ограничен</h2>
          <p className="text-sm text-neutral-400">
            Этот раздел доступен только для роли <strong className="text-red-400">Супер-Администратора</strong>.
          </p>
          <p className="text-xs text-neutral-500">
            Переключите роль на «Супер-Администратор» в селекторе ролей в правом верхнем углу навбара.
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
              Панель Супер-Администратора
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Центр Модерации Лиги</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Вы вошли как <strong className="text-white">{currentUser.fullName}</strong> (Главный Комиссар)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-neutral-400">Спорные матчи</div>
              <div className={`text-2xl font-black ${disputedMatches.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {disputedMatches.length}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Всего Команд', value: teams.length, icon: Users, color: 'text-blue-400' },
            { label: 'Площадок & Хабов', value: venues.length, icon: MapPin, color: 'text-amber-400' },
            { label: 'Всего Матчей', value: allMatches.length, icon: Swords, color: 'text-emerald-400' },
            { label: 'Открытых Споров', value: disputedMatches.length, icon: AlertTriangle, color: disputedMatches.length > 0 ? 'text-red-400' : 'text-emerald-400' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-bold">{stat.label}</span>
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
            { id: 'DISPUTES', label: 'Споры по Счету', badge: disputedMatches.length },
            { id: 'TEAMS', label: 'Управление Командами', badge: teams.length },
            { id: 'VENUES', label: 'Верификация Площадок', badge: venues.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-black/20 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
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
              <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Нет Активных Споров</h3>
                <p className="text-xs text-neutral-400 mt-1">Все счета матчей согласованы капитанами и внесены в зачет.</p>
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
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Все Недавние Матчи</h3>
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-950/80 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3">Матч</th>
                      <th className="px-4 py-3">Дисциплина</th>
                      <th className="px-4 py-3">Дата</th>
                      <th className="px-4 py-3 text-center">Счет</th>
                      <th className="px-4 py-3 text-center">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {allMatches.map((m) => (
                      <tr key={m.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          {m.challengerTeam.name} vs {m.opponentTeam?.name ?? 'Открытый'}
                        </td>
                        <td className="px-4 py-3 text-neutral-400">{getDisciplineLabel(m.sportType)}</td>
                        <td className="px-4 py-3 text-neutral-400">{formatDate(m.scheduledDate)}</td>
                        <td className="px-4 py-3 text-center font-black text-amber-400">
                          {m.scoreTeam1 !== undefined && m.scoreTeam2 !== undefined
                            ? `${m.scoreTeam1} : ${m.scoreTeam2}`
                            : '–'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              m.status === 'OPEN'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : m.status === 'BOOKED'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : m.status === 'COMPLETED'
                                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {m.status === 'OPEN'
                              ? 'Ожидает'
                              : m.status === 'BOOKED'
                              ? 'Забронирован'
                              : m.status === 'COMPLETED'
                              ? 'Завершен'
                              : 'Спор'}
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
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-950/80 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-4">Команда</th>
                  <th className="px-5 py-4">Университет</th>
                  <th className="px-5 py-4">Дисциплина</th>
                  <th className="px-5 py-4 text-center">В–Н–П</th>
                  <th className="px-5 py-4 text-center">Очки</th>
                  <th className="px-5 py-4 text-center">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{team.logoUrl}</span>
                        <div>
                          <div className="font-bold text-white">{team.name}</div>
                          <div className="text-[11px] text-neutral-400">Капитан: {team.captainName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-amber-400 font-bold">{team.universityName}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-neutral-950 text-neutral-300 text-[10px] font-bold border border-neutral-800">
                        {getDisciplineLabel(team.sportType)}
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
                        className="px-3 py-1 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Дисквалификация
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
              <div key={venue.id} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-white text-base">{venue.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{venue.address}</p>
                    </div>
                    {venue.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                    <div><strong className="text-neutral-300">Тариф:</strong> {formatCurrency(venue.hourlyRate)}/ч</div>
                    <div><strong className="text-neutral-300">Рейтинг:</strong> ⭐ {venue.rating}</div>
                    <div><strong className="text-neutral-300">Тип:</strong> {venue.surfaceType}</div>
                    <div><strong className="text-neutral-300">Слотов:</strong> {venue.slots.length}</div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-neutral-800 flex gap-2">
                  <button
                    onClick={() => approveVenue && approveVenue(venue.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Одобрить (Featured)
                  </button>
                  <button
                    onClick={() => showToast(`Площадка «${venue.name}» отправлена на повторную проверку.`)}
                    className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Пожаловаться
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
    <div className="p-6 rounded-3xl bg-red-950/10 border border-red-500/30 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" /> Счет Опротестован
          </span>
          <span className="text-xs text-neutral-400">{formatDate(match.scheduledDate)}</span>
        </div>
        <div className="flex items-center justify-around bg-neutral-950/60 rounded-2xl p-4 border border-neutral-800/60 my-3">
          <div className="text-center">
            <div className="text-2xl">{match.challengerTeam.logoUrl}</div>
            <div className="text-xs font-bold text-white mt-1">{match.challengerTeam.name}</div>
            <div className="text-xl font-black text-amber-400 mt-1">{match.scoreTeam1 ?? '?'}</div>
          </div>
          <div className="text-sm font-black text-neutral-600">:</div>
          <div className="text-center">
            <div className="text-2xl">{match.opponentTeam?.logoUrl ?? '🛡️'}</div>
            <div className="text-xs font-bold text-white mt-1">{match.opponentTeam?.name ?? 'Соперник'}</div>
            <div className="text-xl font-black text-amber-400 mt-1">{match.scoreTeam2 ?? '?'}</div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 italic">Локация: {match.venue.name}</p>
      </div>
      <div className="mt-5 pt-4 border-t border-red-900/40 flex gap-2">
        <button
          onClick={() => onResolve?.(match.id, match.challengerTeamId)}
          className="flex-1 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition-colors cursor-pointer"
        >
          Победа {match.challengerTeam.name}
        </button>
        <button
          onClick={() => onResolve?.(match.id, match.opponentTeamId ?? null)}
          className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
        >
          Победа {match.opponentTeam?.name ?? 'Соперник'}
        </button>
        <button
          onClick={() => onResolve?.(match.id, null)}
          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
        >
          Ничья
        </button>
      </div>
    </div>
  );
}
