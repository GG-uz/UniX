'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { SportType } from '@/types';
import { Swords, MapPin, Calendar, Clock, X, Lock } from 'lucide-react';
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

  if (!isOpen) return null;

  const currentVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];
  const availableSlots = currentVenue?.slots.filter((s) => !s.isBooked) || [];
  const [selectedSlotId, setSelectedSlotId] = useState(availableSlots[0]?.id || '');

  const activeSlot = currentVenue?.slots.find((s) => s.id === selectedSlotId) || availableSlots[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVenue || !activeSlot) return;

    const res = postOpenChallenge({
      sportType,
      venueId: currentVenue.id,
      slotId: activeSlot.id,
      description: description || `${userTeam.name} open challenge at ${currentVenue.name}`,
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
              <h3 className="text-base font-bold text-white">Post Open Match Challenge</h3>
              <p className="text-xs text-neutral-400">Lock venue slot with 50% split deposit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Sport Discipline */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Select Sport
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['FOOTBALL', 'BASKETBALL', 'VOLLEYBALL'] as SportType[]).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSportType(sp)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    sportType === sp
                      ? 'bg-amber-500 text-neutral-950 border-amber-500'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Arena Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Select Preferred Arena
            </label>
            <select
              value={selectedVenueId}
              onChange={(e) => {
                setSelectedVenueId(e.target.value);
                const nextVen = venues.find((v) => v.id === e.target.value);
                const openSlots = nextVen?.slots.filter((s) => !s.isBooked) || [];
                if (openSlots.length > 0) setSelectedSlotId(openSlots[0].id);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.city}) — {formatCurrency(v.hourlyRate)}/hr
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Select Open Time Slot
            </label>
            {availableSlots.length > 0 ? (
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.startTime)} • {formatTime(s.startTime)} - {formatTime(s.endTime)} — Total {formatCurrency(s.price)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 text-xs">
                No open slots currently available at this arena. Please choose another arena.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Callout / Description Message
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., HSE Eagles 7x7 looking for rival team. Certified ref booked. Split prepayment ready!"
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Deposit Notice */}
          {activeSlot && (
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400">Your 50% Split Deposit:</span>
              <span className="font-extrabold text-amber-400 text-sm">
                {formatCurrency(activeSlot.price / 2)}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!activeSlot}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Slot &amp; Broadcast Challenge</span>
          </button>
        </form>
      </div>
    </div>
  );
};
