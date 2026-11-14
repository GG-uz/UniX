'use client';

import React, { useState } from 'react';
import { Match } from '@/types';
import { Swords, Clock, MapPin, AlertTriangle, CheckCircle2, Flag } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getDisciplineLabel } from '@/lib/utils';
import { AcceptChallengeModal } from './AcceptChallengeModal';
import { ScoreSubmitModal } from './ScoreSubmitModal';
import { useAppState } from '@/context/AppStateContext';

interface ChallengeCardProps {
  match: Match;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ match }) => {
  const { userTeam, cancelBooking, disputeMatch } = useAppState();
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  const isChallengerMine = match.challengerTeamId === userTeam.id;
  const isOpponentMine = match.opponentTeamId === userTeam.id;
  const isMine = isChallengerMine || isOpponentMine;

  const isOpen = match.status === 'OPEN';
  const isBooked = match.status === 'BOOKED';
  const isCompleted = match.status === 'COMPLETED';
  const isDisputed = match.status === 'DISPUTED';

  const statusBadge = () => {
    if (isOpen) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Ждет соперника</span>;
    if (isBooked) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 text-blue-400">Матч подтвержден</span>;
    if (isCompleted) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-purple-400">Завершен</span>;
    if (isDisputed) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400">⚠ Спор / Протест</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-400">{match.status}</span>;
  };

  return (
    <div className={`rounded-3xl bg-neutral-900 border transition-all p-6 flex flex-col justify-between shadow-xl ${
      isDisputed ? 'border-red-900/60 bg-red-950/10' : 'border-neutral-800 hover:border-neutral-700'
    }`}>
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
              {getDisciplineLabel(match.sportType)}
            </span>
            {statusBadge()}
          </div>

          <div className="text-neutral-400 text-xs flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatDate(match.scheduledDate)} в {formatTime(match.scheduledDate)}</span>
          </div>
        </div>

        {/* Rival Match Teams Face-off Block */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 my-3">
          <div className="grid grid-cols-11 items-center">
            {/* Challenger Team */}
            <div className="col-span-5 flex items-center gap-3">
              <span className="text-3xl shrink-0">{match.challengerTeam.logoUrl || '🛡️'}</span>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">{match.challengerTeam.name}</div>
                <div className="text-[11px] text-amber-400 font-semibold truncate">{match.challengerTeam.universityName}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Очки: {match.challengerTeam.totalPoints} • {match.challengerTeam.matchesWon}В-{match.challengerTeam.matchesLost}П
                </div>
              </div>
            </div>

            {/* Score or VS Divider */}
            <div className="col-span-1 text-center">
              {isCompleted || isDisputed ? (
                <div className="font-black text-sm text-white leading-none">
                  <span className="text-amber-400">{match.scoreTeam1 ?? '?'}</span>
                  <span className="text-neutral-500 mx-0.5">:</span>
                  <span className="text-amber-400">{match.scoreTeam2 ?? '?'}</span>
                </div>
              ) : (
                <span className="font-black text-xs text-neutral-600">VS</span>
              )}
            </div>

            {/* Opponent Team or Open Slot */}
            <div className="col-span-5 flex items-center justify-end gap-3 text-right">
              {match.opponentTeam ? (
                <>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate">{match.opponentTeam.name}</div>
                    <div className="text-[11px] text-amber-400 font-semibold truncate">{match.opponentTeam.universityName}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Очки: {match.opponentTeam.totalPoints} • {match.opponentTeam.matchesWon}В-{match.opponentTeam.matchesLost}П
                    </div>
                  </div>
                  <span className="text-3xl shrink-0">{match.opponentTeam.logoUrl || '🛡️'}</span>
                </>
              ) : (
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">Слот свободен</div>
                  <div className="text-[11px] text-neutral-400">Примите вызов</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Callout */}
        <p className="text-xs text-neutral-300 italic mb-4 leading-relaxed">
          &ldquo;{match.description}&rdquo;
        </p>

        {/* Venue Location Details */}
        <div className="text-xs text-neutral-400 space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-white font-medium">{match.venue.name}</span>
            <span className="text-neutral-500">•</span>
            <span className="truncate">{match.venue.address}</span>
          </div>
          <div className="text-[11px] text-neutral-400 pl-5">
            Покрытие/Зал: {match.venue.surfaceType}
          </div>
        </div>
      </div>

      {/* Prepayment info & Action CTA */}
      <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Сплит-доля команды:</span>
          <span className="text-sm font-black text-amber-400">
            {formatCurrency(match.slot.price / 2)}
          </span>
          <span className="text-[10px] text-neutral-400 ml-1">/ команда</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Accept (non-mine, open) */}
          {isOpen && !isChallengerMine && (
            <button
              onClick={() => setAcceptModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5" />
              Принять Вызов
            </button>
          )}

          {/* My challenge active */}
          {isOpen && isChallengerMine && (
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800 text-amber-400 border border-neutral-700 text-xs font-bold">
              Ваш Вызов Активен
            </span>
          )}

          {/* Submit Score (mine, booked) */}
          {isMine && isBooked && (
            <button
              onClick={() => setScoreModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700 text-purple-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Внести Счет
            </button>
          )}

          {/* Dispute (mine, completed) */}
          {isMine && isCompleted && (
            <button
              onClick={() => disputeMatch(match.id)}
              className="px-3 py-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800 text-orange-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              Опротестовать
            </button>
          )}

          {/* Cancel (mine, open or booked) */}
          {isMine && match.booking && (isOpen || isBooked) && (
            <button
              onClick={() => cancelBooking(match.id)}
              className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900 text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Отменить Бронь
            </button>
          )}
        </div>
      </div>

      {/* Accept Challenge Modal */}
      {acceptModalOpen && (
        <AcceptChallengeModal
          isOpen={acceptModalOpen}
          onClose={() => setAcceptModalOpen(false)}
          match={match}
        />
      )}

      {/* Score Submit Modal */}
      {scoreModalOpen && (
        <ScoreSubmitModal
          isOpen={scoreModalOpen}
          onClose={() => setScoreModalOpen(false)}
          match={match}
        />
      )}
    </div>
  );
};
