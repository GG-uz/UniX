'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import { DISCIPLINE_LIST } from '@/types';
import type { SportType } from '@/types';
import { officialEvent as event } from '@/lib/officialEvent';
import styles from '@/app/HomeExperiment.module.css';

export function HeroSection() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType>('FOOTBALL');
  const [selectedDate, setSelectedDate] = useState('');

  const handleSearch = (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    const params = new URLSearchParams({ sport: selectedSport });
    if (selectedDate) params.set('date', selectedDate);
    router.push(`/challenges?${params.toString()}`);
  };

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.shell}>
          <div className={`${styles.heroGrid} ${styles.reveal}`}>
            <h1 id="hero-title" className={styles.headline}>
              Три направления. Одна команда. Твой университет.
            </h1>
            <div>
              <p className={styles.lede}>
                Спорт, образование, IT и бизнес: три равных направления для студентов Узбекистана.
              </p>
              <div className={styles.actions}>
                <Link href="/challenges" className={styles.actionPrimary}>
                  Смотреть соревнования
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href={event.href} className={styles.actionSecondary}>
                  Официальный матч
                </Link>
              </div>
            </div>
          </div>

          <section className={styles.match} aria-labelledby="match-title">
            <div className={styles.matchTop}>
              <h2 id="match-title" className={styles.matchLabel}>
                Первый официальный матч
              </h2>
              <Link href={event.href} className={styles.matchLink}>
                Страница матча
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.matchNames}>
              <span>TEAM University</span>
              <span className={styles.matchDash} aria-hidden="true">
                —
              </span>
              <span className={styles.srOnly}>против</span>
              <span>Central Asian University</span>
            </p>
            <dl className={styles.matchSpecs}>
              <div className={styles.spec}>
                <dt>Дисциплина</dt>
                <dd>{event.discipline}</dd>
              </div>
              <div className={styles.spec}>
                <dt>Дата и время</dt>
                <dd>{event.pending}</dd>
              </div>
              <div className={styles.spec}>
                <dt>Место</dt>
                <dd>{event.pending}</dd>
              </div>
              <div className={styles.spec}>
                <dt>Статус</dt>
                <dd>Матч согласован, идёт подготовка</dd>
              </div>
            </dl>
          </section>
        </div>
      </section>

      <section className={styles.find} id="find" aria-labelledby="find-title">
        <div className={styles.shell}>
          <div className={styles.findGrid}>
            <div>
              <h2 id="find-title" className={styles.findTitle}>
                Найти соревнование
              </h2>
              <p className={styles.findNote}>
                Демонстрационный каталог: соревнования показаны как примеры, без реальных бронирований.
              </p>
            </div>
            <form onSubmit={handleSearch} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="unix-discipline" className={styles.label}>
                  Дисциплина
                </label>
                <select
                  id="unix-discipline"
                  value={selectedSport}
                  onChange={(changeEvent) => setSelectedSport(changeEvent.target.value as SportType)}
                  className={styles.select}
                >
                  {DISCIPLINE_LIST.map((discipline) => (
                    <option key={discipline.type} value={discipline.type}>
                      {discipline.labelRu}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="unix-date" className={styles.label}>
                  Дата, если известна
                </label>
                <input
                  id="unix-date"
                  type="date"
                  value={selectedDate}
                  onChange={(changeEvent) => setSelectedDate(changeEvent.target.value)}
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.submit}>
                <Search size={16} aria-hidden="true" />
                Найти
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
