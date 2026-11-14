'use client';

import React, { useState } from 'react';
import { Match } from '@/types';
import { useAppState } from '@/context/AppStateContext';
import { Trophy, X, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

interface ScoreSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
}

export const ScoreSubmitModal: React.FC<ScoreSubmitModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const { submitMatchScore } = useAppState();
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    submitMatchScore(match.id, score1, score2);
    onClose();
  };

  const winner =
    score1 > score2
      ? match.challengerTeam.name
      : score2 > score1
      ? match.opponentTeam?.name ?? 'Opponent'
      : 'Draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Submit Final Match Score</h3>
              <p className="text-xs text-neutral-400">
                {formatDate(match.scheduledDate)} · {formatTime(match.scheduledDate)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* Teams Face-Off */}
          <div className="grid grid-cols-11 items-center gap-2">
            {/* Challenger */}
            <div className="col-span-5 text-center">
              <div className="text-3xl mb-1">{match.challengerTeam.logoUrl}</div>
              <div className="text-xs font-bold text-white truncate">{match.challengerTeam.name}</div>
              <div className="text-[11px] text-neutral-400">{match.challengerTeam.universityName}</div>
              <input
                type="number"
                min={0}
                max={99}
                value={score1}
                onChange={(e) => setScore1(Number(e.target.value))}
                className="mt-3 w-20 mx-auto block text-center text-3xl font-black text-amber-400 bg-neutral-950 border-2 border-neutral-800 rounded-2xl py-2 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* VS */}
            <div className="col-span-1 text-center text-xs font-black text-neutral-600">VS</div>

            {/* Opponent */}
            <div className="col-span-5 text-center">
              <div className="text-3xl mb-1">{match.opponentTeam?.logoUrl ?? '🛡️'}</div>
              <div className="text-xs font-bold text-white truncate">
                {match.opponentTeam?.name ?? 'Opponent'}
              </div>
              <div className="text-[11px] text-neutral-400">{match.opponentTeam?.universityName ?? ''}</div>
              <input
                type="number"
                min={0}
                max={99}
                value={score2}
                onChange={(e) => setScore2(Number(e.target.value))}
                className="mt-3 w-20 mx-auto block text-center text-3xl font-black text-amber-400 bg-neutral-950 border-2 border-neutral-800 rounded-2xl py-2 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Live Result Preview */}
          {(score1 !== score2) && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-center">
              <Flame className="w-4 h-4 text-emerald-400 inline mr-1.5" />
              <span className="text-emerald-300 font-bold">
                {winner} wins {score1} – {score2}!
              </span>
            </div>
          )}
          {score1 === score2 && score1 > 0 && (
            <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700 text-xs text-center text-neutral-300 font-semibold">
              Match drawn {score1} – {score2}
            </div>
          )}

          {/* Fairplay Warning */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex gap-2 text-[11px] text-neutral-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Score submissions are <strong className="text-white">final and binding</strong>. Disputed
              scores are escalated to the Super Admin for review. Intentionally false submissions
              may result in team suspension.
            </span>
          </div>

          {/* Agree Checkbox */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-[11px] text-neutral-300">
              I confirm this score is accurate and submitted with both captains' agreement.
            </span>
          </label>

          <button
            type="submit"
            disabled={!agreed}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              agreed
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Final Score
          </button>
        </form>
      </div>
    </div>
  );
};
