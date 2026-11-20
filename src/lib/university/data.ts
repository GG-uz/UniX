import 'server-only';
import { supabase } from '@/lib/supabase/server';

export type Access = { university: string; admin: boolean; approval: boolean; disciplines: string[]; pending: string[] };
export type Entry = { id: string; name: string };
export type Challenge = {
  id: string; title: string; description: string; discipline: string; creator: string;
  target: string | null; opponent: string | null; status: string; kind: string;
  proposed_date: string | null; venue: string | null; created_at: string; expires_at: string;
};
export type Dashboard = {
  roster: { id: string; name: string; discipline: string }[];
  requests: { id: string; kind: string; status: string; title: string; discipline: string; name: string;
    creator: string; target: string | null; description: string; date: string | null; venue: string | null }[];
  activity: Pick<Challenge, 'id' | 'title' | 'creator' | 'target' | 'opponent' | 'status'>[];
};
export type Db = NonNullable<Awaited<ReturnType<typeof supabase>>>;
export async function viewer() {
  const db = await supabase();
  if (!db) return { db, access: null, signedIn: false };
  const { data: { user } } = await db.auth.getUser();
  const { data } = user?.email_confirmed_at ? await db.rpc('uc_access') : { data: null };
  return { db, access: data as Access | null, signedIn: !!user?.email_confirmed_at };
}
export async function directories(db: Db) {
  const [u,d] = await Promise.all(['universities','disciplines'].map(t => db.from(t).select('id,name').order('name')));
  if (u.error || d.error) return null;
  return { universities: u.data as Entry[], disciplines: d.data as Entry[] };
}
export function represents(a: Access | null, discipline?: string) {
  return !!a && (a.admin || (discipline ? a.disciplines.includes(discipline) : a.disciplines.length > 0));
}
export function canAccept(a: Access | null, c: Challenge) {
  return !!a && represents(a,c.discipline) && c.status === 'OPEN' && c.creator !== a.university &&
    (!c.target || c.target === a.university) && (a.admin || !a.pending.includes(c.id));
}
export const labels: Record<string,string> = {
  PENDING_APPROVAL:'На согласовании', OPEN:'Открыт', ACCEPTED:'Соперник подтверждён',
  CANCELLED:'Отменён', EXPIRED:'Срок истёк', PENDING:'На согласовании', APPROVED:'Одобрено',
  REJECTED:'Отклонено', INVALID:'Больше не действует',
};
export type Query = Record<string,string | string[] | undefined>;
export function param(s: Query, key: string) { return typeof s[key]==='string' ? s[key] : ''; }
export function entryName(entries: Entry[],id: string) { return entries.find(e=>e.id===id)?.name ?? id; }
