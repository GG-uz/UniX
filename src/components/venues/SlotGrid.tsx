'use client';

import React, { useState } from 'react';
import { Venue, Slot } from '@/types';
import { Clock, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
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
    const dateKey = new Date(slot.startTime).toDateString();
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
    <div className="space-y-8">
      {Object.entries(groupedSlots).map(([dateStr, slots]) => (
        <div key={dateStr} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-white">{dateStr}</h4>
            </div>
            <span className="text-xs text-neutral-400">
              {slots.filter((s) => !s.isBooked).length} slots available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isBooked = slot.isBooked;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  disabled={isBooked}
                  className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isBooked
                      ? 'bg-neutral-950/60 border-neutral-800/80 opacity-50 cursor-not-allowed'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/60 cursor-pointer shadow-sm hover:shadow-amber-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    {isBooked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/60">
                        <Lock className="w-2.5 h-2.5" /> Booked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Open
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-3 pt-2 border-t border-neutral-900">
                    <div>
                      <span className="text-xs text-neutral-400">Total: </span>
                      <span className="text-sm font-extrabold text-amber-400">
                        {formatCurrency(slot.price)}
                      </span>
                    </div>
                    {!isBooked && (
                      <span className="text-[11px] font-semibold text-neutral-300 hover:text-white">
                        Book Slot &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Cancellation Modal */}
      {selectedSlot && (
        <CancellationModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedSlot(null);
          }}
          venue={venue}
          slot={selectedSlot}
          onConfirmBooking={handleConfirm}
        />
      )}
    </div>
  );
};
