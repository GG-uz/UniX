'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { SportType, DISCIPLINE_LIST } from '@/types';
import { Swords, X, Lock } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { venues, postOpenChallenge, userTeam } = useAppState();
  const [sportType, setSportType] = useState<SportType>(userTeam.sportType || 'FOOTBALL');
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || '');
  const [description, setDescription] = useState('');

  const currentVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];
  const availableSlots = currentVenue?.slots.filter((s) => !s.isBooked) || [];
  const [selectedSlotId, setSelectedSlotId] = useState(availableSlots[0]?.id || '');
  if (!isOpen) return null;

  const activeSlot = currentVenue?.slots.find((s) => s.id === selectedSlotId) || availableSlots[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVenue || !activeSlot) return;

    const res = postOpenChallenge({
      sportType,
      venueId: currentVenue.id,
      slotId: activeSlot.id,
      description: description || `${userTeam.name} (${userTeam.universityName}) бросает открытый вызов в ${currentVenue.name}`,
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Опубликовать Вызов Командам</h3>
              <p className="text-xs text-neutral-400">Бронирование слота со сплит-предоплатой 50%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* Discipline Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Дисциплина / Направление
            </label>
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value as SportType)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {DISCIPLINE_LIST.map((d) => (
                <option key={d.type} value={d.type}>
                  {d.icon} {d.labelRu}
                </option>
              ))}
            </select>
          </div>

          {/* Venue Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Выберите Площадку или Хаб
            </label>
            <select
              value={selectedVenueId}
              onChange={(e) => {
                setSelectedVenueId(e.target.value);
                const nextVenue = venues.find((v) => v.id === e.target.value);
                const nextAvail = nextVenue?.slots.filter((s) => !s.isBooked) || [];
                setSelectedSlotId(nextAvail[0]?.id || '');
              }}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({formatCurrency(v.hourlyRate)}/ч)
                </option>
              ))}
            </select>
          </div>

          {/* Slot Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Доступное время слота
            </label>
            {availableSlots.length === 0 ? (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
                На этой локации нет свободных слотов. Выберите другую площадку.
              </div>
            ) : (
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.startTime)} в {formatTime(s.startTime)} – {formatTime(s.endTime)} ({formatCurrency(s.price)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Message / Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Текст вызова соперникам
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: TEAM Titans FC ждут реванша от любого вуза! Готовы показать красивую игру."
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Price Callout */}
          {activeSlot && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Ваша предоплата (50% сплит):
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">Вторую половину оплатит соперник</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-amber-400">
                  {formatCurrency(activeSlot.price / 2)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!activeSlot}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeSlot
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 hover:from-amber-400 hover:to-orange-400 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Опубликовать демо-вызов без списания
          </button>
        </form>
      </div>
    </div>
  );
};
