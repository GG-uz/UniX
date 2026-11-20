import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Real SQL and privilege checks in an ephemeral single-connection WASM PostgreSQL.
// No network, Supabase project, real JWTs or production users.
test('university workflow, grants, RLS and losing/stale requests', async () => {
  const db = new PGlite();
  const q = async (sql, args = []) => (await db.query(sql,args)).rows;
  const rpc = async (name,...args) => (await q(`select public.uc_${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) as result`,args))[0].result;
  const who = async (id) => {
    await db.exec('reset role');
    await q("select set_config('fixture.uid',$1,false)",[id || '']);
    await db.exec(`set role ${id ? 'authenticated' : 'anon'}`);
  };
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key, raw_user_meta_data jsonb not null,email_confirmed_at timestamptz);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('fixture.uid',true),'')::uuid$$;
      grant usage on schema auth to anon,authenticated;`);
    for (const file of ['0001_universities','0002_profiles','0003_on_signup','0004_university_authority','0005_university_challenges','0006_challenge_permissions_rpc'])
      await db.exec(await readFile(new URL(`../supabase/migrations/${file}.sql`,import.meta.url),'utf8'));
    const [root,team,cau,wiut,tc,cc,wc,guest,other]=Array.from({length:9},()=>randomUUID());
    for(const [id,u] of [[root,'team'],[team,'team'],[cau,'cau'],[wiut,'wiut'],[tc,'team'],[cc,'cau'],[wc,'wiut'],[guest,'team'],[other,'team']])
      await q('insert into auth.users values($1,$2,now())',[id,JSON.stringify({university_id:u,full_name:'Fixture'})]);
    await q("update public.profiles set role='SUPER_ADMIN' where id=$1",[root]);
    const create = (id,target=null,d='FOOTBALL')=>rpc('create',id,d,target,'Fixture','',null,null);
    const feed = id=>q('select * from public.challenge_feed where id=$1',[id]);
    const request = async (id,kind)=> (await rpc('dashboard')).requests.find(r=>r.title==='Fixture' && r.kind===kind && r.status==='PENDING' && (!id || r.id===id));
    await who(null);
    await assert.rejects(rpc('access')); await assert.rejects(create(randomUUID()));
    await who(guest);
    await assert.rejects(create(randomUUID())); await assert.rejects(rpc('dashboard'));
    await assert.rejects(rpc('set_admin',other,'team',true)); await assert.rejects(rpc('appoint',other,'FOOTBALL'));
    await assert.rejects(q('select * from unix_private.university_admins'));
    await assert.rejects(q("update public.university_challenges set state='OPEN'"));
    await who(root);
    await assert.rejects(rpc('set_admin',root,'team',true)); await assert.rejects(create(randomUUID()));
    for (const [id,u] of [[team,'team'],[cau,'cau'],[wiut,'wiut']]) await rpc('set_admin',id,u,true);
    for (const [admin,cap] of [[team,tc],[cau,cc],[wiut,wc]]) {
      await who(admin); await rpc('appoint',cap,'FOOTBALL');
    await assert.rejects(rpc('appoint',admin,'FOOTBALL'));
    }
    await who(team); await assert.rejects(rpc('appoint',cc,'CHESS')); await rpc('appoint',other,'CHESS');
    assert.deepEqual((await q("select * from public.uc_candidates('Fixture')")).map(p=>p.id).sort(),[root,tc,guest,other].sort());
    await assert.rejects(rpc('set_admin',guest,'team',true));await assert.rejects(create(randomUUID(),'team'));
    const first=randomUUID(); await who(tc); await assert.rejects(create(first,null,'CHESS')); await create(first);
    await assert.rejects(create(first)); await assert.rejects(rpc('set_mode',false));
    await who(null); assert.equal((await feed(first)).length,0);
    await who(team); await rpc('set_mode',false); let r=await request(null,'CREATE'); assert.ok(r);
    await who(cau); await assert.rejects(rpc('decide',r.id,true));
    await who(team); await rpc('decide',r.id,true); await assert.rejects(rpc('decide',r.id,true));
    await assert.rejects(rpc('accept',first));
    await who(cc); await rpc('accept',first); await assert.rejects(rpc('accept',first));
    await who(cau);await rpc('set_mode',false);await who(cc);await assert.rejects(rpc('accept',first));
    await who(cau);await rpc('set_mode',true);
    await who(wc); await rpc('accept',first); await who(null); assert.equal((await feed(first))[0].status,'OPEN');
    await who(cau); const losing=(await request(null,'ACCEPT')).id;
    await who(wiut); await rpc('decide',(await request(null,'ACCEPT')).id,true);
    await who(cau); await assert.rejects(rpc('decide',losing,true));await assert.rejects(rpc('accept',first));
    assert.equal((await feed(first))[0].opponent,'wiut');
    const direct=randomUUID();await who(tc);await create(direct,'cau');await who(wiut);await assert.rejects(rpc('accept',direct));
    await who(cc);await rpc('accept',direct);await who(cau);r=await request(null,'ACCEPT');
    await rpc('revoke',(await rpc('dashboard')).roster[0].id);await assert.rejects(rpc('decide',r.id,true));
    await who(cc);await assert.rejects(rpc('accept',direct));await who(cau);await rpc('accept',direct);
    assert.equal((await feed(direct))[0].opponent,'cau');
    const open=randomUUID();await who(team);await create(open);
    await who(wiut);await rpc('set_mode',false);await who(wc);await rpc('accept',open);
    const expired=randomUUID();await who(team);await create(expired);await db.exec('reset role');
    await q("update public.university_challenges set created_at=now()-interval '2 days',expires_at=now()-interval '1 day' where id=$1",[expired]);
    await who(cau);await assert.rejects(rpc('accept',expired));assert.equal((await feed(expired))[0].status,'EXPIRED');
    await who(team);const cancelled=randomUUID();await create(cancelled);await rpc('cancel',cancelled);
    await who(cau);await assert.rejects(rpc('accept',cancelled));
    await who(team);await rpc('set_mode',true);await who(tc);const pending=randomUUID();await create(pending);
    await who(team);r=await request(null,'CREATE');await rpc('revoke',(await rpc('dashboard')).roster.find(a=>a.discipline==='FOOTBALL').id);
    await assert.rejects(rpc('decide',r.id,true));await who(null);assert.equal((await feed(pending)).length,0);
    await who(root);await rpc('set_admin',cau,'cau',false);await who(cau);await assert.rejects(rpc('dashboard'));
  } finally { await db.close(); }
});
