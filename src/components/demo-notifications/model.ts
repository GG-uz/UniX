type Related =
  | {kind:'challenge'; id:'orion-vector'}
  | {kind:'team'|'tournament'; id:string}
  | {kind:'match'; id:string; tournament:string};

function example(title:string,message:string,relatedEntity:Related) {
  return {title,message,relatedEntity};
}
const challenge = {kind:'challenge',id:'orion-vector'} as const;
const orbit = {kind:'team',id:'orbit'} as const;
const cup = {kind:'tournament',id:'orbit-cup'} as const;
export const examples = {
  challengeNew: example('Новый вызов университету','«Орион» приглашает «Вектор» сыграть в шахматы.',challenge),
  challengeAccepted: example('Вызов принят','«Вектор» принял шахматный вызов «Ориона». Результата матча пока нет.',challenge),
  captain: example('Капитан назначен','Комета представляет команду «Орбита» как капитан.',orbit),
  teamApproved: example('Команда одобрена','«Орбита» может представлять свой кампус.',orbit),
  teamRejected: example('Команда отклонена','Заявка команды «Точка роста» возвращена на исправление.',{kind:'team',id:'impulse'}),
  registered: example('Регистрация на турнир','«Орбита» включена в состав участников Кубка орбит.',cup),
  upcoming: example('Приближается соревнование','Пример напоминания от 7 марта: завтра, 8 марта 2027 года, начинается Кубок орбит.',cup),
  confirmed: example('Результат подтверждён','Итоги Кубка кампусов учтены в деморейтинге.',{kind:'tournament',id:'football-cup'}),
  elo: example('Изменение рейтинга Elo','Посмотрите, как первый четвертьфинал Кубка кампусов изменил рейтинг команд.',{kind:'match',id:'k-1-0',tournament:'football-cup'}),
};
export type ExampleType = keyof typeof examples;
export const types = Object.keys(examples) as ExampleType[];
export function eventPath(type:ExampleType) {
  const e=examples[type].relatedEntity;
  const path=e.kind==='challenge'?'/demo/university-challenges':e.kind==='match'?'/demo/rankings/history':
    `/demo/${e.kind==='team'?'teams':'tournaments'}/${e.id}`;
  return `${path}?example=${type}`;
}

// Only the in-app channel has an implementation. Future transports consume the same envelope.
export type DeliveryChannel = 'in-app'|'telegram'|'email';
export type DemoNotification = ReturnType<typeof example> & {
  id:string; recipientId:'demo:visitor'; type:ExampleType; createdAt:string;
  readAt:string|null; deliveryChannel:DeliveryChannel;
};
export type Action =
  | {kind:'receive'; type:ExampleType; id:string; at:string}
  | {kind:'read'; id:string; at:string} | {kind:'readAll'; at:string} | {kind:'clear'};
export function update(list:DemoNotification[], action:Action):DemoNotification[] {
  switch(action.kind){
    case 'clear': return [];
    case 'receive':
      if(list.some(n=>n.id===action.id))return list;
      return [{...examples[action.type],id:action.id,type:action.type,recipientId:'demo:visitor',
        deliveryChannel:'in-app',createdAt:action.at,readAt:null},...list];
    default: return list.map(n=>!n.readAt&&(action.kind==='readAll'||n.id===action.id)?{...n,readAt:action.at}:n);
  }
}
export type Status='all'|'read'|'unread';
export function filtered(list:DemoNotification[],type:ExampleType|'all',status:Status) {
  return list.filter(n=>(type==='all'||n.type===type)&&(status==='all'||(status==='read')===!!n.readAt));
}
