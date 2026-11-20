// Pure simulation. Identifiers, dates and results belong only to this lab.
export const day = '2027-03-01';
export const campuses = ['Академия «Орион»','Институт «Спектр»','Университет «Вектор»'];
export const disciplines = ['Футбол','Шахматы','Математика','IT-хакатон','Бизнес-кейс','Другая дисциплина'];
export type Format = 'TEAM' | 'INDIVIDUAL';
export type System = 'knockout' | 'groups';
export const formatNames = {TEAM:'Команды', INDIVIDUAL:'Студенты'};
export const systemNames = {knockout:'На выбывание',groups:'Групповой этап'};
const teamNames = ['Орбита','Импульс','Касательная','Призма','Волна','Вихрь','Кварц','Линия','Луч','Дельта','Фаза','Старт','Пульс','Такт','Арка','Вектор'];
const aliases = ['Комета','Фотон','Зенит','Радар','Искра','Кадр','Квант','Спутник','Маяк','Вега','Октава','Курс','Север','Юг','Марс','Точка'];
export function pool(format:Format) {
  return (format==='TEAM'?teamNames:aliases).map((name,i)=>({id:`${format}-${i+1}`,name,university:campuses[i%campuses.length]}));
}
export type Config = {title:string;description:string;discipline:string;format:Format;system:System;
  organizer:string;capacity:number;regStart:string;regEnd:string;start:string;end:string};
export const defaults:Config = {title:'',description:'',discipline:disciplines[0],format:'TEAM',system:'knockout',
  organizer:campuses[0],capacity:8,regStart:day,regEnd:'2027-03-07',start:'2027-03-08',end:'2027-03-10'};
function dateOK(s:string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;
}
export function validate(c:Config):string {
  if (c.title.trim().length<2||c.title.length>80||!c.description.trim()||c.description.length>600) return 'Укажите название (2–80 символов) и описание (до 600).';
  if(!campuses.includes(c.organizer)||!disciplines.includes(c.discipline)||!Object.hasOwn(formatNames,c.format)||!Object.hasOwn(systemNames,c.system))return 'Выберите параметры из списка.';
  if(!Number.isInteger(c.capacity)||c.capacity<2||c.capacity>16)return 'Допустимо от 2 до 16 мест.';
  if(![c.regStart,c.regEnd,c.start,c.end].every(dateOK)||c.regStart>c.regEnd||c.regEnd<day||c.regEnd>c.start||c.start>c.end)return 'Проверьте порядок дат: регистрация, затем соревнование. Приём не должен закончиться до учебной даты.';
  return '';
}
export type Application = {id:string;status:'pending'|'approved'|'rejected'};
export type Score = {a:number;b:number;tie?:string};
export type Slot = {date:string;time:string;venue:string};
export type Tournament = Config & {id:string;today:string;apps:Application[];entrants:string[];scores:Record<string,Score>;slots:Record<string,Slot>};
export type Match = {id:string;round:number;group:number;a:string|null;b:string|null;bye:boolean;winner:string|null;score?:Score};
export function create(id:string,c:Config):Tournament {
  if(validate(c)) throw new Error(validate(c));
  return {...c,title:c.title.trim(),id,today:day,apps:[],entrants:[],scores:{},slots:{}};
}
export function approved(t:Tournament) {return t.apps.filter(a=>a.status==='approved').length;}
export function registrationOpen(t:Tournament) {return !t.entrants.length && t.today>=t.regStart && t.today<=t.regEnd;}
export function groups(ids:string[]) {
  const n=Math.max(1,Math.ceil(ids.length/4));
  return Array.from({length:n},(_,i)=>ids.filter((_,j)=>j%n===i));
}
export function matches(t:Tournament):Match[] {
  if(!t.entrants.length)return [];
  const list:Match[]=[];
  function add(id:string,round:number,group:number,a:string|null,b:string|null,bye=false) {
    const score=t.scores[id];
    const winner=bye?a??b:!a||!b||!score?null:score.a>score.b?a:score.b>score.a?b:score.tie??null;
    list.push({id,round,group,a,b,bye,winner,score});return winner;
  }
  if(t.system==='knockout') {
    // Balanced seed placement: empty seeds cannot meet each other in round one.
    let seeds=[1,2];
    while(seeds.length<t.entrants.length){const sum=seeds.length*2+1;seeds=seeds.flatMap(v=>[v,sum-v]);}
    let players:(string|null)[]=seeds.map(v=>t.entrants[v-1]??null);
    for(let r=1;players.length>1;r++) {
      const next:(string|null)[]=[];
      for(let i=0;i<players.length;i+=2)next.push(add(`k-${r}-${i/2}`,r,0,players[i],players[i+1],r===1&&(!players[i]||!players[i+1])));
      players=next;
    }
  } else groups(t.entrants).forEach((ids,g)=>{
    const ring:(string|null)[]=[...ids];if(ring.length%2)ring.push(null);
    for(let r=1;r<ring.length;r++) {
      for(let i=0;i<ring.length/2;i++){const a=ring[i],b=ring[ring.length-1-i];if(a&&b)add(`g-${g}-${r}-${i}`,r,g,a,b);}
      ring.splice(1,0,ring.pop()!);
    }
  });
  return list;
}
export function standings(ids:string[],games:Match[]) {
  const rows=ids.map(id=>({id,played:0,points:0,diff:0,rank:0}));
  for(const row of rows)for(const m of games){
    if(!m.score||(row.id!==m.a&&row.id!==m.b))continue;
    const delta=(m.score.a-m.score.b)*(row.id===m.a?1:-1);
    row.played++;row.diff+=delta;row.points+=delta>0?3:delta===0?1:0;
  }
  rows.sort((x,y)=>y.points-x.points||y.diff-x.diff);
  rows.forEach((r,i)=>{const prev=rows[i-1];r.rank=prev&&prev.points===r.points&&prev.diff===r.diff?prev.rank:i+1;});
  return rows;
}
export function phase(t:Tournament) {
  if(!t.entrants.length)return 'Предстоящий';
  const games=matches(t);
  return games.every(m=>m.bye||(t.system==='groups'?!!m.score:!!m.winner))?'Завершён':'Идёт';
}
export type Action =
  | {type:'open'|'close'}
  | {type:'apply'|'approve'|'reject';participant:string}
  | {type:'score';id:string;score:Score}
  | {type:'slot';id:string;slot:Slot};

// Invalid and repeated transitions have no effect, including stale UI clicks.
export function change(t:Tournament,action:Action):Tournament {
  if(action.type==='open')return !t.entrants.length&&t.today<t.regStart?{...t,today:t.regStart}:t;
  if(action.type==='close'){
    if(!registrationOpen(t)||approved(t)<2)return t;
    return {...t,today:t.start,entrants:t.apps.filter(a=>a.status==='approved').map(a=>a.id),
      apps:t.apps.map(a=>a.status==='pending'?{...a,status:'rejected'}:a)};
  }
  if('participant' in action){
    if(!registrationOpen(t)||!pool(t.format).some(p=>p.id===action.participant))return t;
    const app=t.apps.find(a=>a.id===action.participant);
    if(action.type==='apply')return !app&&approved(t)<t.capacity?{...t,apps:[...t.apps,{id:action.participant,status:'pending'}]}:t;
    if(app?.status!=='pending'||(action.type==='approve'&&approved(t)>=t.capacity))return t;
    return {...t,apps:t.apps.map(a=>a===app?{...a,status:action.type==='approve'?'approved':'rejected'}:a)};
  }
  if(!('id' in action))return t;
  const before=matches(t),m=before.find(x=>x.id===action.id);
  if(!m||m.bye)return t;
  if(action.type==='slot'){
    const {date,time,venue}=action.slot;
    if((date&&(!dateOK(date)||date<t.start||date>t.end))||(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))||venue.length>100)return t;
    return {...t,slots:{...t.slots,[m.id]:{date,time,venue:venue.trim()}}};
  }
  if(!m.a||!m.b)return t;
  const {a,b,tie}=action.score;
  if(![a,b].every(n=>Number.isInteger(n)&&n>=0&&n<=999))return t;
  if(tie&&(t.system!=='knockout'||a!==b||(tie!==m.a&&tie!==m.b)))return t;
  const scores={...t.scores,[m.id]:{a,b,tie}};
  const updated={...t,scores};
  if(t.system==='knockout' && matches(updated).find(x=>x.id===m.id)?.winner!==m.winner) {
    let index=Number(m.id.split('-')[2]);
    for(let r=m.round+1;r<=before[before.length-1].round;r++){index=Math.floor(index/2);delete scores[`k-${r}-${index}`];}
  }
  return updated;
}
