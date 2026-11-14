'use client';

import React, { useState } from 'react';
import { Venue, Slot, SportType } from '@/types';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  Lock,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue;
  slot: Slot;
  onConfirmBooking: (params: {
    sportType: SportType;
    isSplitPayment: boolean;
    paymentMethod: 'STRIPE' | 'SBP' | 'CARD';
    matchDescription: string;
  }) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  venue,
  slot,
  onConfirmBooking,
}) => {
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'SBP' | 'CARD'>('STRIPE');
  const [sportType, setSportType] = useState<SportType>(venue.sportTypes[0] || 'FOOTBALL');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const slotStart = new Date(slot.startTime);
  const cancellationDeadline = new Date(slotStart.getTime() - 48 * 60 * 60 * 1000);

  const totalAmount = slot.price;
  const payNowAmount = isSplit ? totalAmount / 2 : totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPolicy) return;

    onConfirmBooking({
      sportType,
      isSplitPayment: isSplit,
      paymentMethod,
      matchDescription: description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirm Booking &amp; Secure Slot</h3>
              <p className="text-xs text-neutral-400">{venue.name} • {slot.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Slot Summary Card */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Scheduled Kickoff:</span>
              <span className="font-bold text-white">
                {formatDate(slot.startTime)} • {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Total Slot Cost:</span>
              <span className="font-bold text-amber-400">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Arena Address:</span>
              <span className="text-neutral-300 truncate max-w-[250px]">{venue.address}</span>
            </div>
          </div>

          {/* Sport Discipline Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1.5">
              Match Discipline
            </label>
            <div className="grid grid-cols-3 gap-2">
              {venue.sportTypes.map((sp) => (
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

          {/* Match Note / Open Challenge description */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1.5">
              Match Note or Challenge Callout
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., HSE Eagles 7x7 looking for rival team. Fast pace, bibs provided."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Prepayment Split Option */}
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Payment Model
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsSplit(false)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !isSplit
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Full Prepayment</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Pay 100% ({formatCurrency(totalAmount)})</div>
              </button>

              <button
                type="button"
                onClick={() => setIsSplit(true)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSplit
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-400" />
                  Split 50 / 50
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Pay 50% now ({formatCurrency(totalAmount / 2)})</div>
              </button>
            </div>
            {isSplit && (
              <p className="text-[11px] text-neutral-400 italic">
                * Your team pays $ {totalAmount / 2} now to hold the reservation. When an opponent accepts your challenge, their team pays the remaining $ {totalAmount / 2}.
              </p>
            )}
          </div>

          {/* Mock Stripe / Payment Gateway Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1.5">
              Select Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'STRIPE', label: 'Stripe Pay' },
                { id: 'CARD', label: 'Credit Card' },
                { id: 'SBP', label: 'SBP Fast Pay' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === p.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* STRICT 48-HOUR CANCELLATION POLICY WARNING CARD */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Strict 48-Hour Cancellation Rule
                </h4>
                <p className="text-[11px] text-neutral-300 leading-relaxed mt-1">
                  To protect venue owners and prevent last-minute no-shows, any booking cancellation made{' '}
                  <strong className="text-white">within 48 hours</strong> of game kickoff will{' '}
                  <strong className="text-red-400 underline">forfeit the full deposit</strong>.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 text-[11px] flex justify-between items-center text-neutral-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Free Cancellation Deadline:
              </span>
              <span className="font-bold text-amber-300">
                {formatDate(cancellationDeadline.toISOString())} at {formatTime(cancellationDeadline.toISOString())}
              </span>
            </div>

            {/* Checkbox acknowledgement */}
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-[11px] text-neutral-300 font-medium">
                I understand and agree to the 48-hour cancellation policy. If my team cancels after the deadline, our deposit is transferred to the venue.
              </span>
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={!agreedToPolicy}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              agreedToPolicy
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 shadow-amber-500/20 active:scale-95 cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pay &amp; Lock Slot ({formatCurrency(payNowAmount)})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
