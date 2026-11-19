import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SportType, DISCIPLINE_LIST } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // Format as Uzbek Sum (e.g. "180 000 сум")
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} сум`;
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('ru-RU', {
    timeZone: 'Asia/Tashkent',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleTimeString('ru-RU', {
    timeZone: 'Asia/Tashkent',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function getDisciplineLabel(sport: SportType): string {
  const found = DISCIPLINE_LIST.find((d) => d.type === sport);
  return found ? found.labelRu : sport;
}

export function getDisciplineIcon(sport: SportType): string {
  const found = DISCIPLINE_LIST.find((d) => d.type === sport);
  return found ? found.icon : '🏆';
}

export function getHoursRemaining(deadlineIso: string): number {
  const now = typeof window !== 'undefined' ? Date.now() : 0;
  const diffMs = new Date(deadlineIso).getTime() - now;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}
