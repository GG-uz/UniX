import Link from 'next/link';
import { ArrowUpRight, Download } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import styles from './HomeExperiment.module.css';

const directions = [
  {
    key: 'sport',
    sport: 'FOOTBALL',
    title: 'Спорт',
    text: 'Футбол, баскетбол, волейбол, шахматы и киберспорт.',
    action: 'Соревнования по спорту',
  },
  {
    key: 'education',
    sport: 'MATHEMATICS',
    title: 'Образование',
    text: 'Олимпиады, интеллектуальные игры, дебаты и научные конкурсы.',
    action: 'Образовательные соревнования',
  },
  {
    key: 'it',
    sport: 'IT_HACKATHON',
    title: 'IT и бизнес',
    text: 'Хакатоны, стартап-баттлы и кейс-чемпионаты.',
    action: 'IT и бизнес в каталоге',
  },
] as const;

const steps = [
  ['Выбрать соревнование', 'Уточните направление и откройте карточку интересующего события.'],
  ['Подготовить заявку', 'Соберите команду и согласуйте участие с организатором встречи.'],
  ['Принять участие', 'Следите за обновлениями даты, места и формата на странице события.'],
  ['Узнать результат', 'Основание для публикации итога — подтверждение организатора после встречи.'],
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HeroSection />

      <section className={styles.section} id="directions" aria-labelledby="directions-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <h2 id="directions-title" className={styles.sectionTitle}>
              Три направления, ни одного главного
            </h2>
            <p className={styles.sectionNote}>У каждого направления свой каталог и свои дисциплины.</p>
          </div>
          <ul className={styles.pillars}>
            {directions.map((direction, index) => (
              <li key={direction.key} className={styles.pillar}>
                <span className={styles.numeral} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 className={styles.pillarTitle}>{direction.title}</h3>
                <p className={styles.pillarText}>{direction.text}</p>
                <Link href={`/challenges?sport=${direction.sport}`} className={styles.pillarLink}>
                  {direction.action}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} id="how" aria-labelledby="how-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <h2 id="how-title" className={styles.sectionTitle}>
              Как это работает
            </h2>
          </div>
          <ol className={styles.steps}>
            {steps.map(([title, text], index) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepText}>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.closing} aria-label="Рейтинги и организаторы">
        <div className={styles.shell}>
          <div className={styles.closingGrid}>
            <section className={styles.panel} aria-labelledby="ratings-title">
              <h2 id="ratings-title" className={styles.panelTitle}>
                Как читать рейтинги
              </h2>
              <p className={styles.panelText}>
                Рейтинг сравнивает команды внутри одной дисциплины. Общий зачёт вузов требует
                согласованных правил, поэтому в таблицах пока пример данных, без официального зачёта.
              </p>
              <Link href="/leaderboards" className={styles.panelLink}>
                Пример рейтинга
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </section>

            <section className={styles.panel} id="organizers" aria-labelledby="organizers-title">
              <h2 id="organizers-title" className={styles.panelTitle}>
                Для организаторов
              </h2>
              <p className={styles.panelText}>
                Предложите соревнование: заполните бриф и передайте его команде UniX. Контакт для
                онлайн-заявок будет объявлен позже.
              </p>
              <a href="/unix-organizer-brief.txt" download className={styles.panelLink}>
                <Download size={16} aria-hidden="true" />
                Скачать бриф (.txt)
              </a>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
