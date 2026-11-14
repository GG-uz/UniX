'use client';

import React, { useState } from 'react';
import { Match } from '@/types';
import { useAppState } from '@/context/AppStateContext';
import { Swords, ShieldAlert, X, CheckCircle2, Lock } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getDisciplineLabel } from '@/lib/utils';

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
  const [paymentMethod, setPaymentMethod] = useState<'UZUM' | 'PAYME' | 'CLICK' | 'STRIPE'>('PAYME');

  if (!isOpen) return null;

  const splitShare = match.slot.price / 2;
  const eligibleTeams = teams.filter(
    (t) => t.id !== match.challengerTeamId
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
              <h3 className="text-base font-black text-white">Принять Вызов на Матч</h3>
              <p className="text-xs text-neutral-400">Совместная 50/50 аренда слота</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAccept} className="p-6 space-y-5 text-sm">
          {/* Match Info Summary */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                {getDisciplineLabel(match.sportType)}
              </span>
              <span className="text-neutral-400">
                {formatDate(match.scheduledDate)} в {formatTime(match.scheduledDate)}
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              Соперник: {match.challengerTeam.name} ({match.challengerTeam.universityName})
            </div>
            <div className="text-xs text-neutral-400">
              Локация: {match.venue.name} • {match.venue.surfaceType}
            </div>
          </div>

          {/* Select Your Team */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Выберите вашу команду
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {eligibleTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.logoUrl} {t.name} ({t.universityName})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Split Callout */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Ваша 50% сплит-доля
              </span>
              <span className="text-xs text-neutral-400 mt-0.5 block">
                Вторая половина уже внесена соперником
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-400">
                {formatCurrency(splitShare)}
              </span>
            </div>
          </div>

          {/* 48h strict policy alert */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2 text-[11px] text-neutral-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Политика 48ч: Отмена менее чем за 48 часов до игры влечет потерю залога в пользу площадки.
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Способ оплаты
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['PAYME', 'CLICK', 'UZUM', 'STRIPE'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === method
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-md'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {method === 'UZUM' ? 'Uzum' : method}
                </button>
              ))}
            </div>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-[11px] text-neutral-300">
              Подтверждаю участие команды и согласен с правилом 48 часов.
            </span>
          </label>

          <button
            type="submit"
            disabled={!agreed}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              agreed
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 hover:from-amber-400 hover:to-orange-400 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Оплатить {formatCurrency(splitShare)} &amp; Подтвердить Матч
          </button>
        </form>
      </div>
    </div>
  );
};
