import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// Disposable, network-isolated PostgreSQL. No host DB URL is accepted.
const available=spawnSync('docker',['info','--format','{{.ServerVersion}}'],{timeout:8000}).status===0;
test('two real connections: direct/direct, approval/approval and approval/direct', {
  skip: available?false:'Docker engine unavailable; concurrency NOT tested',timeout:120000,
},async()=>{
  const name=`unix-race-${randomUUID()}`;
  function docker(args,input) {
    const r=spawnSync('docker',args,{input,encoding:'utf8',timeout:20000});
    assert.equal(r.status,0,r.stderr);return r.stdout.trim();
  }
  const psql=['psql','-X','-qAt','-U','postgres','-v','ON_ERROR_STOP=1'];
  const sql=s=>docker(['exec','-i',name,...psql],s);
  const deadline=async fn=>{const end=Date.now()+15000;while(!fn()){assert.ok(Date.now()<end,'timeout waiting for PostgreSQL');await delay(80);}};
  const session=app=>{
    const cp=spawn('docker',['exec','-i','-e',`PGAPPNAME=${app}`,name,...psql]);
    let out='',err='';cp.stdout.on('data',b=>out+=b);cp.stderr.on('data',b=>err+=b);
    return {cp,out:()=>out,err:()=>err,exit:new Promise(resolve=>cp.on('close',resolve))};
  };
  const [root,t,c,w,cc,wc]=Array.from({length:6},()=>randomUUID());
  const as=id=>`set role authenticated;set fixture.uid='${id}';`;
  docker(['run','--rm','--pull=never','--network','none','-d','--name',name,'-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16']);
  try {
    await deadline(()=>spawnSync('docker',['exec',name,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0);
    sql(`create role anon;create role authenticated;create schema auth;
      create table auth.users(id uuid primary key,raw_user_meta_data jsonb,email_confirmed_at timestamptz);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('fixture.uid',true),'')::uuid$$;
      grant usage on schema auth to authenticated,anon;`);
    for(const f of ['0001_universities','0002_profiles','0003_on_signup','0004_university_authority','0005_university_challenges','0006_challenge_permissions_rpc'])
      sql(await readFile(new URL(`../supabase/migrations/${f}.sql`,import.meta.url),'utf8'));
    for(const [id,u] of [[root,'team'],[t,'team'],[c,'cau'],[w,'wiut'],[cc,'cau'],[wc,'wiut']])
      sql(`insert into auth.users values('${id}','{"full_name":"Fixture","university_id":"${u}"}',now());`);
    sql(`update public.profiles set role='SUPER_ADMIN' where id='${root}';${as(root)}
      select uc_set_admin('${t}','team',true),uc_set_admin('${c}','cau',true),uc_set_admin('${w}','wiut',true);`);
    sql(`${as(c)}select uc_appoint('${cc}','FOOTBALL');`);sql(`${as(w)}select uc_appoint('${wc}','FOOTBALL');`);
    for(const [left,right] of [[false,false],[true,true],[true,false]]) {
      const id=randomUUID();sql(`${as(t)}select uc_create('${id}','FOOTBALL',null,'Race','',null,null);`);
      function action(approval,admin,cap,u) {
        if(!approval)return `${as(admin)}select uc_accept('${id}');`;
        sql(`${as(cap)}select uc_accept('${id}');`);
        const req=sql(`select id from unix_private.challenge_requests where challenge='${id}' and university='${u}';`);
        return `${as(admin)}select uc_decide('${req}',true);`;
      }
      const one=action(left,c,cc,'cau'),two=action(right,w,wc,'wiut');
      const first=session('first');first.cp.stdin.write(`begin;${one}\n\\echo CLAIMED\n`);
      await deadline(()=>first.out().includes('CLAIMED'));
      const second=session('second');second.cp.stdin.end(`begin;${two} commit;\n`);
      await deadline(()=>sql("select exists(select from pg_stat_activity where application_name='second' and cardinality(pg_blocking_pids(pid))>0);")==='t');
      first.cp.stdin.end('commit;\n');assert.equal(await first.exit,0,first.err());
      assert.notEqual(await second.exit,0);assert.match(second.err(),/Challenge unavailable|no_data_found|no rows/i);
      assert.equal(sql(`select opponent from public.university_challenges where id='${id}' and state='ACCEPTED';`),'cau');
      assert.equal(sql(`select count(*) from unix_private.challenge_requests where challenge='${id}' and status='PENDING';`),'0');
    }
  } finally { docker(['rm','-f',name]); }
});
