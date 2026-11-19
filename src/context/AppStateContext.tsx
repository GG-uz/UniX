'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Team, Venue, Match, SportType } from '@/types';
import { MOCK_USERS, MOCK_TEAMS, MOCK_VENUES, MOCK_MATCHES } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

interface BookingConfirmationParams {
  venueId: string;
  slotId: string;
  sportType: SportType;
  challengerTeamId: string;
  opponentTeamId?: string;
  matchDescription?: string;
  isSplitPayment: boolean;
  paymentMethod: 'UZUM' | 'PAYME' | 'CLICK' | 'STRIPE';
}

interface AppStateContextType {
  currentUser: User;
  teams: Team[];
  venues: Venue[];
  matches: Match[];
  userTeam: Team;
  bookSlotAndCreateMatch: (params: BookingConfirmationParams) => { success: boolean; match?: Match; error?: string };
  acceptChallenge: (matchId: string, opponentTeamId: string, isSplit: boolean) => { success: boolean; error?: string };
  cancelBooking: (matchId: string) => { success: boolean; refunded: boolean; message: string };
  postOpenChallenge: (params: {
    sportType: SportType;
    venueId: string;
    slotId: string;
    description: string;
  }) => { success: boolean; match?: Match; error?: string };
  submitMatchScore: (matchId: string, score1: number, score2: number) => { success: boolean; error?: string };
  resolveDispute: (matchId: string, winnerId: string | null) => { success: boolean; error?: string };
  disputeMatch: (matchId: string) => { success: boolean; error?: string };
  approveVenue: (venueId: string) => { success: boolean };
  suspendTeam: (teamId: string) => { success: boolean };
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toastMessage: string | null;
  clearToast: () => void;
  showToast: (msg: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = MOCK_USERS[0]; // Demo participant; never used for authorization.
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  // Sync theme with document element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const userTeam = teams.find((t) => t.captainId === currentUser.id) || teams[0];

  const bookSlotAndCreateMatch = ({
    venueId,
    slotId,
    sportType,
    challengerTeamId,
    opponentTeamId,
    matchDescription,
    isSplitPayment,
    paymentMethod,
  }: BookingConfirmationParams) => {
    const venue = venues.find((v) => v.id === venueId);
    if (!venue) return { success: false, error: 'Площадка не найдена' };

    const slot = venue.slots.find((s) => s.id === slotId);
    if (!slot) return { success: false, error: 'Слот не найден' };
    if (slot.isBooked) return { success: false, error: 'Этот слот уже занят' };

    const challenger = teams.find((t) => t.id === challengerTeamId) || userTeam;
    const opponent = opponentTeamId ? teams.find((t) => t.id === opponentTeamId) : undefined;

    // Mark slot as booked in state
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id !== venueId) return v;
        return {
          ...v,
          slots: v.slots.map((s) => (s.id === slotId ? { ...s, isBooked: true } : s)),
        };
      })
    );

    const slotStart = new Date(slot.startTime);
    const cancellationDeadline = new Date(slotStart.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const price = isSplitPayment ? slot.price / 2 : slot.price;

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      sportType,
      challengerTeamId: challenger.id,
      challengerTeam: challenger,
      opponentTeamId: opponent?.id,
      opponentTeam: opponent,
      venueId: venue.id,
      venue,
      slotId: slot.id,
      slot: { ...slot, isBooked: true },
      status: opponent ? 'BOOKED' : 'OPEN',
      scheduledDate: slot.startTime,
      description: matchDescription || `${challenger.name} (${challenger.universityName}) ищет соперников в ${venue.name}`,
      createdAt: new Date().toISOString(),
      booking: {
        id: `bk-${Date.now()}`,
        matchId: `match-${Date.now()}`,
        userId: currentUser.id,
        amountPaid: price,
        paymentStatus: isSplitPayment ? 'PAID_SPLIT' : 'PAID_FULL',
        cancellationDeadline,
        isSplitPayment,
        paymentMethod,
        createdAt: new Date().toISOString(),
      },
    };

    setMatches((prev) => [newMatch, ...prev]);
    showToast(`Слот забронирован в ${venue.name}! Предоплата ${formatCurrency(price)} защищена.`);
    return { success: true, match: newMatch };
  };

  const acceptChallenge = (matchId: string, opponentTeamId: string, isSplit: boolean) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Вызов не найден' };
    if (match.status !== 'OPEN') return { success: false, error: 'Этот вызов уже занят или завершен' };

    const opponent = teams.find((t) => t.id === opponentTeamId);
    if (!opponent) return { success: false, error: 'Команда соперника не найдена' };

    const splitAmount = match.slot.price / 2;

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          status: 'BOOKED',
          opponentTeamId: opponent.id,
          opponentTeam: opponent,
          booking: m.booking
            ? {
                ...m.booking,
                paymentStatus: 'PAID_FULL',
                isSplitPayment: isSplit,
              }
            : undefined,
        };
      })
    );

    showToast(`Вызов принят! ${opponent.name} сыграет против ${match.challengerTeam.name}. Доплата ${formatCurrency(splitAmount)} зафиксирована.`);
    return { success: true };
  };

  const cancelBooking = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match || !match.booking) {
      return { success: false, refunded: false, message: 'Бронирование или матч не найдены.' };
    }

    const now = new Date();
    const deadline = new Date(match.booking.cancellationDeadline);
    const isWithin48Hours = now > deadline;

    // Release slot
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id !== match.venueId) return v;
        return {
          ...v,
          slots: v.slots.map((s) => (s.id === match.slotId ? { ...s, isBooked: false } : s)),
        };
      })
    );

    // Update match and booking status
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          status: 'OPEN',
          opponentTeamId: undefined,
          opponentTeam: undefined,
          booking: m.booking
            ? {
                ...m.booking,
                paymentStatus: isWithin48Hours ? 'FORFEITED' : 'REFUNDED',
              }
            : undefined,
        };
      })
    );

    if (isWithin48Hours) {
      const msg = 'Правило 48 часов: Отмена менее чем за 48 ч до начала. Залог удержан в пользу площадки.';
      showToast(msg);
      return { success: true, refunded: false, message: msg };
    } else {
      const msg = 'Бронь отменена более чем за 48 ч. 100% залога возвращено на ваш счет.';
      showToast(msg);
      return { success: true, refunded: true, message: msg };
    }
  };

  const postOpenChallenge = ({
    sportType,
    venueId,
    slotId,
    description,
  }: {
    sportType: SportType;
    venueId: string;
    slotId: string;
    description: string;
  }) => {
    return bookSlotAndCreateMatch({
      venueId,
      slotId,
      sportType,
      challengerTeamId: userTeam.id,
      matchDescription: description,
      isSplitPayment: true,
      paymentMethod: 'PAYME',
    });
  };

  const awardPoints = (teamId: string, result: 'WIN' | 'DRAW' | 'LOSS') => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const pts = result === 'WIN' ? 3 : result === 'DRAW' ? 1 : 0;
        const form: ('W' | 'L' | 'D') = result === 'WIN' ? 'W' : result === 'DRAW' ? 'D' : 'L';
        return {
          ...t,
          totalPoints: t.totalPoints + pts,
          matchesWon: result === 'WIN' ? t.matchesWon + 1 : t.matchesWon,
          matchesLost: result === 'LOSS' ? t.matchesLost + 1 : t.matchesLost,
          matchesDrawn: result === 'DRAW' ? t.matchesDrawn + 1 : t.matchesDrawn,
          recentForm: [form, ...t.recentForm].slice(0, 5),
        };
      })
    );
  };

  const submitMatchScore = (matchId: string, score1: number, score2: number) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Матч не найден' };
    if (match.status === 'COMPLETED') return { success: false, error: 'Счет матча уже зафиксирован' };

    const challengerResult = score1 > score2 ? 'WIN' : score1 < score2 ? 'LOSS' : 'DRAW';
    const opponentResult = score2 > score1 ? 'WIN' : score2 < score1 ? 'LOSS' : 'DRAW';

    if (match.opponentTeamId) {
      awardPoints(match.challengerTeamId, challengerResult);
      awardPoints(match.opponentTeamId, opponentResult);
    }

    setMatches((prev) =>
      prev.map((m) =>
        m.id !== matchId
          ? m
          : { ...m, status: 'COMPLETED', scoreTeam1: score1, scoreTeam2: score2 }
      )
    );

    const winner =
      score1 > score2
        ? match.challengerTeam.name
        : score2 > score1
        ? match.opponentTeam?.name ?? 'Соперник'
        : null;
    showToast(winner ? `🏆 Финальный счет зафиксирован! ${winner} побеждает ${score1}:${score2}.` : `🤝 Зафиксирована ничья ${score1}:${score2}.`);
    return { success: true };
  };

  const resolveDispute = (matchId: string, winnerId: string | null) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Матч не найден' };

    if (winnerId) {
      const loserId =
        winnerId === match.challengerTeamId ? match.opponentTeamId : match.challengerTeamId;
      awardPoints(winnerId, 'WIN');
      if (loserId) awardPoints(loserId, 'LOSS');
      const winnerTeam = teams.find((t) => t.id === winnerId);
      showToast(`⚖️ Диспут урегулирован: победа присуждена команде ${winnerTeam?.name ?? 'Команда'}.`);
    } else {
      if (match.challengerTeamId) awardPoints(match.challengerTeamId, 'DRAW');
      if (match.opponentTeamId) awardPoints(match.opponentTeamId, 'DRAW');
      showToast(`⚖️ Диспут урегулирован: матч объявлен ничейным.`);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id !== matchId ? m : { ...m, status: 'COMPLETED' }))
    );
    return { success: true };
  };

  const disputeMatch = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Матч не найден' };
    if (match.status !== 'COMPLETED') return { success: false, error: 'Только завершенный матч можно опротестовать' };

    setMatches((prev) =>
      prev.map((m) => (m.id !== matchId ? m : { ...m, status: 'DISPUTED' }))
    );
    showToast(`🚩 Подан протест на результат матча в ${match.venue.name}. Администратор рассмотрит заявку.`);
    return { success: true };
  };

  const approveVenue = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId);
    setVenues((prev) =>
      prev.map((v) => (v.id !== venueId ? v : { ...v, isFeatured: true }))
    );
    showToast(`✅ Площадка «${venue?.name ?? venueId}» верифицирована и получила статус Featured.`);
    return { success: true };
  };

  const suspendTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    showToast(`🚫 Команда «${team?.name ?? teamId}» временно дисквалифицирована Администратором.`);
    return { success: true };
  };

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        teams,
        venues,
        matches,
        userTeam,
        bookSlotAndCreateMatch,
        acceptChallenge,
        cancelBooking,
        postOpenChallenge,
        submitMatchScore,
        resolveDispute,
        disputeMatch,
        approveVenue,
        suspendTeam,
        theme,
        toggleTheme,
        toastMessage,
        clearToast,
        showToast,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
