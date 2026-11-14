export type UserRole = 'STUDENT_CAPTAIN' | 'VENUE_MANAGER' | 'SUPER_ADMIN';

export type SportType = 
  | 'FOOTBALL' 
  | 'BASKETBALL' 
  | 'VOLLEYBALL' 
  | 'MATHEMATICS' 
  | 'PHYSICS' 
  | 'CHEMISTRY' 
  | 'IT_HACKATHON' 
  | 'ESPORTS' 
  | 'CASE_CHAMPIONSHIP';

export type DisciplineCategory = 'SPORT' | 'SCIENCE' | 'TECH' | 'BUSINESS';

export interface DisciplineInfo {
  type: SportType;
  labelRu: string;
  category: DisciplineCategory;
  categoryRu: string;
  icon: string;
}

export const DISCIPLINE_LIST: DisciplineInfo[] = [
  { type: 'FOOTBALL', labelRu: 'Футбол 5x5', category: 'SPORT', categoryRu: 'Спорт', icon: '⚽' },
  { type: 'BASKETBALL', labelRu: 'Баскетбол 3x3', category: 'SPORT', categoryRu: 'Спорт', icon: '🏀' },
  { type: 'VOLLEYBALL', labelRu: 'Волейбол', category: 'SPORT', categoryRu: 'Спорт', icon: '🏐' },
  { type: 'MATHEMATICS', labelRu: 'Математика & Матбои', category: 'SCIENCE', categoryRu: 'Наука & Олимпиады', icon: '📐' },
  { type: 'PHYSICS', labelRu: 'Физика & Инженерия', category: 'SCIENCE', categoryRu: 'Наука & Олимпиады', icon: '⚡' },
  { type: 'CHEMISTRY', labelRu: 'Химия & ЛабХакатон', category: 'SCIENCE', categoryRu: 'Наука & Олимпиады', icon: '🧪' },
  { type: 'IT_HACKATHON', labelRu: 'IT & Хакатоны (AI/Dev)', category: 'TECH', categoryRu: 'IT & Кибер', icon: '💻' },
  { type: 'ESPORTS', labelRu: 'Киберспорт (CS2/Dota2)', category: 'TECH', categoryRu: 'IT & Кибер', icon: '🎮' },
  { type: 'CASE_CHAMPIONSHIP', labelRu: 'Кейс-чемпионаты & Дебаты', category: 'BUSINESS', categoryRu: 'Бизнес & Лидерство', icon: '📊' },
];

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
  price: number;     // In UZS (сум), <= 300 000
}

export interface Venue {
  id: string;
  name: string;
  managerId: string;
  address: string;
  city: string;
  hourlyRate: number; // In UZS (сум), <= 300 000
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
  amountPaid: number; // In UZS
  paymentStatus: PaymentStatus;
  cancellationDeadline: string; // Slot Start Time - 48 Hours
  isSplitPayment: boolean;
  paymentMethod: 'UZUM' | 'PAYME' | 'CLICK' | 'STRIPE';
  createdAt: string;
}
