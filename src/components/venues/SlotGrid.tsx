'use client';

import React, { useState } from 'react';
import { Venue, Slot } from '@/types';
import { Clock, CheckCircle2, Lock } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { CancellationModal } from './CancellationModal';
import { useAppState } from '@/context/AppStateContext';

interface SlotGridProps {
  venue: Venue;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ venue }) => {
  const { bookSlotAndCreateMatch, userTeam } = useAppState();
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Group slots by date
  const groupedSlots = venue.slots.reduce((acc, slot) => {
    const dateKey = formatDate(slot.startTime);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const handleSlotClick = (slot: Slot) => {
    if (slot.isBooked) return;
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  const handleConfirm = (params: any) => {
    if (!selectedSlot) return;

    bookSlotAndCreateMatch({
      venueId: venue.id,
      slotId: selectedSlot.id,
      sportType: params.sportType,
      challengerTeamId: userTeam.id,
      matchDescription: params.matchDescription,
      isSplitPayment: params.isSplitPayment,
      paymentMethod: params.paymentMethod,
    });

    setModalOpen(false);
    setSelectedSlot(null);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedSlots).map(([dateStr, slots]) => (
        <div key={dateStr} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-white capitalize">{dateStr}</h4>
            </div>
            <span className="text-xs text-neutral-400">
              Свободно: <strong className="text-amber-400">{slots.filter((s) => !s.isBooked).length}</strong> из {slots.length} слотов
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const isBooked = slot.isBooked;
              return (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={isBooked}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isBooked
                      ? 'bg-neutral-950/60 border-neutral-800/80 opacity-60 cursor-not-allowed'
                      : 'bg-neutral-950 border-neutral-800 hover:border-amber-500/80 hover:bg-neutral-900 cursor-pointer shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </span>
                    {isBooked ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> Занят
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Свободен
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-neutral-800/50">
                    <span className="text-[11px] text-neutral-400">Аренда:</span>
                    <span className="text-xs font-black text-amber-400">
                      {formatCurrency(slot.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Booking & Strict Cancellation Rule Modal */}
      {modalOpen && selectedSlot && (
        <CancellationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          slot={selectedSlot}
          venue={venue}
        />
      )}
    </div>
  );
};
