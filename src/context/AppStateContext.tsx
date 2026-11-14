'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Team, Venue, Match, Slot, UserRole, SportType } from '@/types';
import { MOCK_USERS, MOCK_TEAMS, MOCK_VENUES, MOCK_MATCHES } from '@/lib/mockData';

interface BookingConfirmationParams {
  venueId: string;
  slotId: string;
  sportType: SportType;
  challengerTeamId: string;
  opponentTeamId?: string;
  matchDescription?: string;
  isSplitPayment: boolean;
  paymentMethod: 'STRIPE' | 'SBP' | 'CARD';
}

interface AppStateContextType {
  currentUser: User;
  switchUserRole: (role: UserRole) => void;
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
  toastMessage: string | null;
  clearToast: () => void;
  showToast: (msg: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Alexey, Captain
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const switchUserRole = (role: UserRole) => {
    const found = MOCK_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast(`Switched view to ${role.replace('_', ' ')} (${found.fullName})`);
    }
  };

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
    if (!venue) return { success: false, error: 'Venue not found' };

    const slot = venue.slots.find((s) => s.id === slotId);
    if (!slot) return { success: false, error: 'Slot not found' };
    if (slot.isBooked) return { success: false, error: 'Slot is already booked' };

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
      description: matchDescription || `${challenger.name} looking for opponent at ${venue.name}`,
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
    showToast(`Slot confirmed at ${venue.name}! Prepayment of $${price} secured.`);
    return { success: true, match: newMatch };
  };

  const acceptChallenge = (matchId: string, opponentTeamId: string, isSplit: boolean) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Match challenge not found' };
    if (match.status !== 'OPEN') return { success: false, error: 'Challenge is no longer open' };

    const opponent = teams.find((t) => t.id === opponentTeamId);
    if (!opponent) return { success: false, error: 'Opponent team not found' };

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

    showToast(`Challenge Accepted! ${opponent.name} matched with ${match.challengerTeam.name}. $${splitAmount} paid.`);
    return { success: true };
  };

  const cancelBooking = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match || !match.booking) {
      return { success: false, refunded: false, message: 'Match or booking not found.' };
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
      const msg = 'Strict 48H Policy Applied: Cancellation was within 48h of slot start. Deposit forfeited to Venue.';
      showToast(msg);
      return { success: true, refunded: false, message: msg };
    } else {
      const msg = 'Booking cancelled >48h before match. 100% deposit refunded to your account.';
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
      paymentMethod: 'STRIPE',
    });
  };

  // Award points: Win = 3pts, Draw = 1pt, Loss = 0pts
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
    if (!match) return { success: false, error: 'Match not found' };
    if (match.status === 'COMPLETED') return { success: false, error: 'Score already submitted' };

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
        ? match.opponentTeam?.name ?? 'Opponent'
        : null;
    showToast(winner ? `🏆 Final Score recorded! ${winner} wins ${score1}-${score2}.` : `🤝 Draw recorded! ${score1}-${score2}.`);
    return { success: true };
  };

  const resolveDispute = (matchId: string, winnerId: string | null) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Match not found' };

    if (winnerId) {
      const loserId =
        winnerId === match.challengerTeamId ? match.opponentTeamId : match.challengerTeamId;
      awardPoints(winnerId, 'WIN');
      if (loserId) awardPoints(loserId, 'LOSS');
      const winnerTeam = teams.find((t) => t.id === winnerId);
      showToast(`⚖️ Dispute resolved: ${winnerTeam?.name ?? 'Team'} awarded the victory.`);
    } else {
      if (match.challengerTeamId) awardPoints(match.challengerTeamId, 'DRAW');
      if (match.opponentTeamId) awardPoints(match.opponentTeamId, 'DRAW');
      showToast(`⚖️ Dispute resolved: Match declared a Draw.`);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id !== matchId ? m : { ...m, status: 'COMPLETED' }))
    );
    return { success: true };
  };

  const disputeMatch = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Match not found' };
    if (match.status !== 'COMPLETED') return { success: false, error: 'Only completed matches can be disputed' };

    setMatches((prev) =>
      prev.map((m) => (m.id !== matchId ? m : { ...m, status: 'DISPUTED' }))
    );
    showToast(`🚩 Dispute filed for match at ${match.venue.name}. Admin will review.`);
    return { success: true };
  };

  const approveVenue = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId);
    setVenues((prev) =>
      prev.map((v) => (v.id !== venueId ? v : { ...v, isFeatured: true }))
    );
    showToast(`✅ Venue "${venue?.name ?? venueId}" approved & marked as Featured.`);
    return { success: true };
  };

  const suspendTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    showToast(`🚫 Team "${team?.name ?? teamId}" has been suspended by Admin.`);
    return { success: true };
  };

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        switchUserRole,
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
