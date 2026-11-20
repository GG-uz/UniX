import { campuses,change,create,defaults,matches,phase,pool,type Config,type Format,type Match,type Tournament } from './model.ts';

const base={...defaults,regStart:'2027-03-01',regEnd:'2027-03-07'};
function config(title:string,description:string,discipline:string,format:Format,
  system:Config['system'],organizer:string,capacity:number,start:string,end:string):Config {
  return {...base,title,description,discipline,format,system,organizer,capacity,start,end};
}
function higher(m:Match,t:Tournament) {
  const order=pool(t.format);
  return order.findIndex(p=>p.id===m.a)<order.findIndex(p=>p.id===m.b)?{a:2,b:0}:{a:0,b:2};
}
function varied(m:Match,t:Tournament) {
  if(t.system==='groups') {
    const n=Number(m.id.split('-').at(-1));
    if(n%4===0)return {a:1,b:1};
    if(n%5===0)return {a:0,b:0};
  }
  return higher(m,t);
}
function settle(t:Tournament,decide:(m:Match,t:Tournament)=>{a:number;b:number}) {
  let next=t,guard=0;
  while(phase(next)!=='Завершён'&&guard++<64) {
    const game=matches(next).find(m=>!m.bye&&m.a&&m.b&&!m.score);
    if(!game)break;
    next=change(next,{type:'score',id:game.id,score:decide(game,next)});
  }
  return next;
}
function enroll(t:Tournament,ids:string[]) {
  let next=t;
  for(const id of ids){next=change(next,{type:'apply',participant:id});next=change(next,{type:'approve',participant:id});}
  return change(next,{type:'close'});
}
function build(id:string,c:Config,offset:number,count:number,
  decide:(m:Match,t:Tournament)=>{a:number;b:number}) {
  const ids=pool(c.format).slice(offset,offset+count).map(p=>p.id);
  return change(settle(enroll(create(id,c),ids),decide),{type:'confirm'});
}

export function seedTournaments():Tournament[] {
  const orbit=create('orbit-cup',config('Кубок орбит',
    'Учебный командный кубок. Одобрите пятую заявку и закройте регистрацию, чтобы увидеть неполную сетку.',
    'Футбол','TEAM','knockout',campuses[0],5,'2027-03-08','2027-03-10'));
  let cup=enroll(orbit,pool('TEAM').slice(0,4).map(p=>p.id));
  cup=change(cup,{type:'apply',participant:'TEAM-5'});

  const logic=enroll(create('logic-lab',config('Лаборатория логики',
    'Личный круговой турнир: результаты каждого поединка меняют таблицу очков.',
    'Математика','INDIVIDUAL','groups',campuses[1],4,'2027-03-08','2027-03-10')),
    pool('INDIVIDUAL').slice(0,4).map(p=>p.id));

  const sprint=enroll(create('case-sprint',config('Спринт решений',
    'Завершённый учебный финал по бизнес-кейсам без подтверждения итогов.',
    'Бизнес-кейс','TEAM','knockout',campuses[2],2,'2027-03-08','2027-03-10')),
    pool('TEAM').slice(0,2).map(p=>p.id));
  const unconfirmed=change(sprint,{type:'score',id:matches(sprint)[0].id,score:{a:2,b:1}});

  const footballCup=build('football-cup',config('Кубок кампусов',
    'Восемь команд, полная сетка и подтверждённые итоги для демо-рейтинга.',
    'Футбол','TEAM','knockout',campuses[0],8,'2027-03-08','2027-03-08'),0,8,higher);
  const footballFriday=build('football-friday',config('Пятничный футбол',
    'Небольшой турнир на четыре команды: проверка коэффициента поля.',
    'Футбол','TEAM','knockout',campuses[1],4,'2027-03-09','2027-03-09'),1,4,higher);
  const mathLeague=build('math-league',config('Летняя математическая лига',
    'Индивидуальные группы с круговой системой и частичными ничьими.',
    'Математика','INDIVIDUAL','groups',campuses[1],8,'2027-03-10','2027-03-10'),0,8,varied);
  const itHack=build('it-hack',config('Хакатон кампусов',
    'Командный групповой этап по IT-направлению.',
    'IT-хакатон','TEAM','groups',campuses[0],6,'2027-03-11','2027-03-11'),0,6,varied);
  const caseCup=build('case-cup',config('Кубок бизнес-кейсов',
    'Индивидуальный плей-офф по бизнес-анализу.',
    'Бизнес-кейс','INDIVIDUAL','knockout',campuses[2],4,'2027-03-12','2027-03-12'),1,4,higher);
  const chessOpen=build('chess-open',config('Открытый шахматный турнир',
    'Индивидуальная сетка на восемь участников.',
    'Шахматы','INDIVIDUAL','knockout',campuses[0],8,'2027-03-13','2027-03-13'),0,8,higher);
  const educationForum=build('education-forum',config('Форум образовательных команд',
    'Командный турнир по направлению «Образование».',
    'Образование','TEAM','knockout',campuses[2],4,'2027-03-14','2027-03-14'),2,4,higher);

  return [cup,logic,unconfirmed,footballCup,footballFriday,mathLeague,itHack,caseCup,chessOpen,educationForum];
}
