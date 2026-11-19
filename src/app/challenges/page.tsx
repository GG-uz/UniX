'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { CreateChallengeModal } from '@/components/challenges/CreateChallengeModal';
import { Swords, Plus } from 'lucide-react';
import { DISCIPLINE_LIST } from '@/types';

function ChallengesContent() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get('sport') || 'ALL';

  const { matches } = useAppState();
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'BOOKED' | 'COMPLETED'>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredMatches = matches.filter((m) => {
    const matchesSport = selectedSport === 'ALL' || m.sportType === selectedSport;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    const matchesDate = !date || new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(m.scheduledDate)) === date;
    return matchesSport && matchesStatus && matchesDate;
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
              Межуниверситетский Матчмейкинг
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Доска Вызовов &amp; Лента Матчей
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Публикуйте открытые вызовы, принимайте соперников от других вузов (TEAM University, WIUT, Inha, MDIST, Amity, ТУИТ) и автоматически делите стоимость аренды пополам.
            </p>
          </div>

          {/* Post Challenge CTA */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Опубликовать Новый Вызов</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 mb-8 shadow-lg">
          {/* Discipline Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">Направление:</span>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Все дисциплины ({DISCIPLINE_LIST.length})</option>
              {DISCIPLINE_LIST.map((d) => (
                <option key={d.type} value={d.type}>
                  {d.icon} {d.labelRu}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-300">
            Дата (Ташкент)
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2" />
          </label>
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Все матчи' },
              { id: 'OPEN', label: `Ждут соперника (${openCount})` },
              { id: 'BOOKED', label: 'Подтвержденные' },
              { id: 'COMPLETED', label: 'Завершенные' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Cards Grid */}
        {filteredMatches.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
            <p className="text-sm text-neutral-400">
              По выбранным фильтрам активных вызовов не найдено.
            </p>
            <button
              onClick={() => {
                 setSelectedSport('ALL');
                 setDate('');
                setSelectedStatus('ALL');
              }}
              className="mt-3 text-xs text-amber-400 font-bold hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <ChallengeCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      {createModalOpen && (
        <CreateChallengeModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 p-12 text-white">Загрузка вызовов...</div>}>
      <ChallengesContent />
    </Suspense>
  );
}
