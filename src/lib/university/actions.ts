'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireProfile } from '@/lib/auth/session';
import { viewer, represents, canAccept, type Challenge } from './data';

const board='/challenges', dashboard='/university/dashboard', create='/challenges/new';
function field(f: FormData,k: string) { const v=f.get(k);return typeof v==='string'?v.trim():''; }
function fail(path: string): never { redirect(`${path}?notice=failed`); }
function uuid(v:string) { return /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(v); }
async function actor(path: string, admin=false) {
  const { db,access,signedIn }=await viewer();
  if(!signedIn) redirect('/auth/login');
  if(!db || !access || !represents(access) || (admin && !access.admin)) fail(path);
  return { db,access };
}
function done(path:string) {
  revalidatePath(board);revalidatePath(dashboard);
  redirect(`${path}?notice=saved`);
}
export async function createChallenge(f:FormData) {
  const {db,access}=await actor(create); const d=field(f,'discipline'),type=field(f,'kind'),target=field(f,'target');
  const id=field(f,'id'), title=field(f,'title'),description=field(f,'description'),venue=field(f,'venue'),date=field(f,'date');
  if(!uuid(id)||!represents(access,d)||!d||!title||title.length>120||description.length>2000||venue.length>160||
    (date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))||!['OPEN','DIRECT'].includes(type)||
    (type==='DIRECT'&&(!target||target===access.university))) fail(create);
  const {error}=await db.rpc('uc_create',{p_id:id,p_discipline:d,p_target:type==='DIRECT'?target:null,p_title:title,
    p_description:description,p_date:date||null,p_venue:venue||null});
  if(error) fail(create); done(dashboard);
}
export async function acceptChallenge(f:FormData) {
  const {db,access}=await actor(board); const id=field(f,'id'); if(!uuid(id)) fail(board);
  const {data}=await db.from('challenge_feed').select('*').eq('id',id).maybeSingle();
  if(!data||!canAccept(access,data as Challenge)) fail(board);
  if((await db.rpc('uc_accept',{p_challenge:id})).error) fail(board);
  done(dashboard);
}
export async function manageUniversity(f:FormData) {
  const {db}=await actor(dashboard,true);
  const id=field(f,'id'),op=field(f,'op');
  if(op!=='mode'&&!uuid(id)) fail(dashboard);
  let result;
  switch(op) {
    case 'mode': {
      const mode=field(f,'mode');if(!['required','independent'].includes(mode))fail(dashboard);
      result=await db.rpc('uc_set_mode',{p_required:mode==='required'});break;
    }
    case 'appoint': result=await db.rpc('uc_appoint',{p_member:id,p_discipline:field(f,'discipline')});break;
    case 'revoke': result=await db.rpc('uc_revoke',{p_appointment:id});break;
    case 'approve': case 'reject':
      result=await db.rpc('uc_decide',{p_request:id,p_approve:op==='approve'});break;
    case 'cancel': result=await db.rpc('uc_cancel',{p_challenge:id});break;
    default: fail(dashboard);
  }
  if(result.error) fail(dashboard); done(dashboard);
}
export async function provision(f:FormData) {
  await requireProfile(['SUPER_ADMIN']);
  const {db}=await viewer(); const id=field(f,'id'),op=field(f,'op');
  if(!db||!uuid(id)||!['grant','revoke'].includes(op))fail('/admin/universities');
  const {error}=await db.rpc('uc_set_admin',{p_member:id,p_university:field(f,'university'),p_grant:op==='grant'});
  if(error)fail('/admin/universities');done('/admin/universities');
}
