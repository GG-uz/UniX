'use client';

import { Suspense,useRef, useState } from 'react';
import {useSearchParams} from 'next/navigation';
import {EventContext} from '@/components/demo-notifications/EventContext';
import styles from './scenario.module.css';

const steps = ['Создание', 'Согласование', 'Заявки', 'Выбор соперника', 'Подтверждение'];
const status = ['Черновик', 'На согласовании', 'Принимает заявки', 'Ожидает решения', 'Соперник подтверждён'];
const candidates = ['Вектор', 'Спектр'] as const;
type Candidate = typeof candidates[number];
type Kind = 'open' | 'direct';
const disciplines = ['Шахматы', 'Футбол', 'Математика', 'IT-хакатон', 'Бизнес-кейс'];
const fresh = (kind: Kind) => ({
  step: 0, kind, discipline: disciplines[0], target: candidates[0] as Candidate,
  requests: [] as Candidate[], choice: null as Candidate | null,
});

export function Scenario() {
  return <Suspense fallback={<p role="status">Загрузка сценария…</p>}><ScenarioEntry/></Suspense>;
}
function ScenarioEntry(){
  const example=useSearchParams().get('example');
  return <><EventContext available={{challengeNew:true,challengeAccepted:true}}/>
    <Steps key={example??'default'} example={example}/></>;
}
function Steps({example}:{example:string|null}){
  const [s, set] = useState(() => {
    if(example==='challengeNew')return {...fresh('direct'),step:2};
    if(example==='challengeAccepted')return {...fresh('direct'),step:4,requests:[candidates[0]],choice:candidates[0]};
    return fresh('open');
  });
  const heading = useRef<HTMLHeadingElement>(null);
  const direct = s.kind === 'direct';
  const eligible = direct ? [s.target] : candidates;
  const allSubmitted = eligible.every(u => s.requests.includes(u));
  const titles = ['Какой вызов отправим?', 'Разрешить публикацию?', 'Кто готов участвовать?',
    'Чью заявку согласовать первой?', 'Соперник подтверждён'];
  const guides = [
    'Вы действуете за капитана вуза «Орион». Выберите дисциплину и определите, кому предложить соревнование.',
    'Теперь решение за администрацией «Ориона». Пока предложение капитана не одобрено, другие вузы не могут ответить.',
    direct ? `«Орион» пригласил только вуз «${s.target}». Отправьте ответ от его капитана.`
      : 'Отправьте по заявке от двух капитанов. Обе останутся на рассмотрении: первая заявка не бронирует место.',
    direct ? `Вы действуете за администрацию вуза «${s.target}». Выберите заявку своего капитана и подтвердите участие.`
      : 'Выберите, администрация какого вуза первой одобрит заявку своего капитана. Именно этот вуз станет соперником.',
    `Вуз «${s.choice}» принял вызов «Ориона». Соревнование согласовано, но матч ещё не сыгран и результата нет.`,
  ];
  const focusHeading = () => requestAnimationFrame(() => heading.current?.focus());
  function go(step: number) {
    set(prev => ({ ...prev, step,
      requests: step < 2 ? [] : prev.requests,
      choice: step < 3 ? null : prev.choice,
    }));
    focusHeading();
  }
  function restart(kind: Kind = s.kind) {
    set(fresh(kind));
    focusHeading();
  }
  function apply(u: Candidate) {
    set(prev => prev.step !== 2 || prev.requests.includes(u) || (prev.kind === 'direct' && u !== prev.target)
      ? prev : { ...prev, requests: [...prev.requests, u] });
  }

  return (
    <>
      <nav aria-label="Шаги сценария"><ol className={styles.steps}>
        {steps.map((name,i) => <li key={name}>
          <button type="button" disabled={i > s.step} aria-current={i === s.step ? 'step' : undefined}
            onClick={() => go(i)}><span>0{i + 1}</span>{name}</button>
        </li>)}
      </ol></nav>
      <div className={styles.workspace}>
        <section className={styles.stage} aria-labelledby="stage-title">
          <p className={styles.kicker}>Шаг 0{s.step + 1} / 05 · {steps[s.step]}</p>
          <h2 id="stage-title" tabIndex={-1} ref={heading}>{titles[s.step]}</h2>
          <p className={styles.guide}>{guides[s.step]}</p>

          {s.step === 0 && <>
            <fieldset className={styles.options}><legend>Тип вызова</legend>
              {(['open', 'direct'] as const).map(k => <label className={styles.option} key={k}>
                <input name="demo-kind" type="radio" checked={s.kind === k} onChange={() => set({ ...s, kind: k })}/>
                <span><b>{k === 'open' ? 'Открытый' : 'Адресный'}</b>
                  <small>{k === 'open' ? 'Для любого другого вуза' : 'Для одного выбранного вуза'}</small></span>
              </label>)}
            </fieldset>
            <div className={styles.fields}>
              <label>Дисциплина<select value={s.discipline} onChange={e => set({ ...s, discipline: e.target.value })}>
                {disciplines.map(d => <option key={d}>{d}</option>)}</select></label>
              {direct && <label>Кого пригласить<select value={s.target} onChange={e => set({ ...s, target: e.target.value as Candidate })}>
                {candidates.map(u => <option key={u}>{u}</option>)}</select></label>}
            </div>
          </>}
          {s.step === 1 && <p className={styles.callout}><b>Предложение капитана</b><br/>
            {s.discipline} · «Орион» приглашает {direct ? `вуз «${s.target}»` : 'любой другой вуз'}.</p>}
          {s.step === 2 && <div className={styles.rows}>
            {candidates.map(u => {
              const blocked = direct && s.target !== u, sent = s.requests.includes(u);
              return <div key={u} className={styles.row}><span><b>Вуз «{u}»</b><small>
                {blocked ? 'Не может принять: вызов адресован другому вузу.' : sent ? 'Заявка ожидает решения администрации.' : 'Капитан может предложить участие.'}
              </small></span><button className={styles.secondary} disabled={blocked || sent} onClick={() => apply(u)}
                aria-label={`Заявка от вуза «${u}»`}>{blocked ? 'Не приглашён' : sent ? 'Подана' : 'Подать заявку'}</button></div>;
            })}
            <p role="status">Подано заявок: {s.requests.length} из {eligible.length}</p>
          </div>}
          {s.step === 3 && <fieldset className={styles.options}><legend>Университет, подтверждающий участие</legend>
            {s.requests.map(u => <label key={u} className={styles.option}>
              <input type="radio" name="demo-opponent" checked={s.choice === u} onChange={() => set({ ...s, choice: u })}/>
              <span><b>Вуз «{u}»</b><small>Одобрить заявку его капитана</small></span>
            </label>)}
          </fieldset>}
          {s.step === 4 && <div className={styles.rows}>{s.requests.map(u => <div className={styles.row} key={u}>
            <b>Заявка вуза «{u}»</b><span>{s.choice === u ? 'Принятие одобрено' : 'Больше не действует'}</span>
          </div>)}</div>}

          <div className={styles.actions}>
            {s.step > 0 && <button className={styles.secondary} onClick={() => go(s.step - 1)}>← Назад</button>}
            {s.step < 4 ? <button className={styles.primary} onClick={() => go(s.step + 1)}
              disabled={(s.step === 2 && !allSubmitted) || (s.step === 3 && !s.choice)}>
              {['Передать на согласование', 'Одобрить и опубликовать', 'Перейти к выбору', 'Подтвердить участие'][s.step]} →
            </button> : <button className={styles.primary} onClick={() => restart(direct ? 'open' : 'direct')}>
              Попробовать {direct ? 'открытый' : 'адресный'} вызов →
            </button>}
          </div>
        </section>

        <aside aria-label="Сводка сценария" className={styles.sheet}>
          <p className={styles.kicker}>Карточка вызова</p>
          <p className={styles.pair}>Орион <span>—</span> {s.step === 4 ? s.choice : direct ? s.target : 'Любой вуз'}</p>
          <dl>{[['Дисциплина',s.discipline], ['Тип',direct ? 'Адресный' : 'Открытый'], ['Статус',status[s.step]]].map(([k,v]) =>
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <p>Все действия учебные. При возврате на предыдущий шаг решение можно переиграть. После перезагрузки прогресс исчезнет.</p>
          <button className={styles.secondary} onClick={() => restart()}>Начать заново</button>
        </aside>
      </div>
    </>
  );
}
