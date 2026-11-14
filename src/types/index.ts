export type UserRole = 'STUDENT_CAPTAIN' | 'VENUE_MANAGER' | 'SUPER_ADMIN';

export type SportType = 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL';

export type MatchStatus = 'OPEN' | 'BOOKED' | 'COMPLETED' | 'DISPUTED';

export type PaymentStatus = 'PENDING' | 'PAID_FULL' | 'PAID_SPLIT' | 'REFUNDED' | 'FORFEITED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  universityName?: string;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  sportType: SportType;
  captainId: string;
  captainName: string;
  universityName: string;
  logoUrl?: string;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  totalPoints: number;
  recentForm: ('W' | 'L' | 'D')[];
}

export interface Slot {
  id: string;
  venueId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  isBooked: boolean;
  price: number;
}

export interface Venue {
  id: string;
  name: string;
  managerId: string;
  address: string;
  city: string;
  hourlyRate: number;
  sportTypes: SportType[];
  surfaceType: string;
  isFeatured: boolean;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  cancellationHours: number; // 48
  amenities: string[];
  slots: Slot[];
}

export interface Match {
  id: string;
  sportType: SportType;
  challengerTeamId: string;
  challengerTeam: Team;
  opponentTeamId?: string;
  opponentTeam?: Team;
  venueId: string;
  venue: Venue;
  slotId: string;
  slot: Slot;
  status: MatchStatus;
  scoreTeam1?: number;
  scoreTeam2?: number;
  scheduledDate: string;
  description: string;
  createdAt: string;
  booking?: Booking;
}

export interface Booking {
  id: string;
  matchId: string;
  userId: string;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  cancellationDeadline: string; // Slot Start Time - 48 Hours
  isSplitPayment: boolean;
  paymentMethod: 'STRIPE' | 'SBP' | 'CARD';
  createdAt: string;
}
