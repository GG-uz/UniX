'use client';

import React, { useState } from 'react';
import { Match } from '@/types';
import { useAppState } from '@/context/AppStateContext';
import { Swords, ShieldAlert, CreditCard, X, CheckCircle2, Lock } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

interface AcceptChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
}

export const AcceptChallengeModal: React.FC<AcceptChallengeModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const { teams, userTeam, acceptChallenge } = useAppState();
  const [selectedTeamId, setSelectedTeamId] = useState(userTeam.id);
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'SBP' | 'CARD'>('STRIPE');

  if (!isOpen) return null;

  const splitShare = match.slot.price / 2;
  const eligibleTeams = teams.filter(
    (t) => t.id !== match.challengerTeamId && t.sportType === match.sportType
  );

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    const res = acceptChallenge(match.id, selectedTeamId, true);
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
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Accept Match Challenge</h3>
              <p className="text-xs text-neutral-400">Lock shared arena reservation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAccept} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Matchup Summary */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Challenger:</span>
              <span className="font-bold text-white">
                {match.challengerTeam.name} ({match.challengerTeam.universityName})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Arena &amp; Kickoff:</span>
              <span className="font-medium text-neutral-200">
                {match.venue.name} • {formatDate(match.scheduledDate)} at {formatTime(match.scheduledDate)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-800">
              <span className="text-neutral-400">Your Split Deposit:</span>
              <span className="font-black text-amber-400 text-sm">{formatCurrency(splitShare)}</span>
            </div>
          </div>

          {/* Select Your Team */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Select Your Represented Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {eligibleTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.universityName}) — {t.sportType}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Gateway */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['STRIPE', 'CARD', 'SBP'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaymentMethod(p as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === p
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  {p === 'STRIPE' ? 'Stripe' : p === 'CARD' ? 'Bank Card' : 'SBP Pay'}
                </button>
              ))}
            </div>
          </div>

          {/* Strict 48H Cancellation Rule Alert */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-neutral-300 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Prepayment &amp; 48H Guarantee Notice
            </div>
            <p>
              Your deposit of <strong>{formatCurrency(splitShare)}</strong> will be held in league escrow.
              Cancellations within 48 hours of kickoff forfeit the deposit.
            </p>
          </div>

          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-[11px] text-neutral-300">
              I agree to pay {formatCurrency(splitShare)} and adhere to league fair play &amp; cancellation rules.
            </span>
          </label>

          <button
            type="submit"
            disabled={!agreed}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              agreed
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 shadow-orange-500/20 active:scale-95 cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Pay Deposit ({formatCurrency(splitShare)}) &amp; Confirm Match</span>
          </button>
        </form>
      </div>
    </div>
  );
};
