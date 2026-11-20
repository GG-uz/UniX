import type { Metadata } from 'next';
import Link from 'next/link';
import { Scenario } from './Scenario';
import styles from './scenario.module.css';

export const metadata: Metadata = { title: 'Демо университетских вызовов' };

export default function UniversityChallengesDemo() {
  return (
    <div className={styles.page}>
      <div className={styles.banner}><div className={styles.shell}>
        <strong>ДЕМО · данные вымышлены</strong><span>Симулятор UniX</span>
      </div></div>
      <div className={styles.shell}>
        <header className={styles.intro}>
          <p className={styles.kicker}>Практикум / университетские соревнования</p>
          <h1>От вызова до соперника</h1>
          <p>Пройдите путь заявки за два вымышленных вуза: предложите соревнование,
            опубликуйте вызов и подтвердите одного соперника. Вход не нужен.</p>
        </header>
        <Scenario />
        <nav aria-label="Другие разделы соревнований" className={styles.links}>
          <Link href="/demo/teams" prefetch={false}>Демо-команды и составы →</Link>
          <Link href="/demo/challenges" prefetch={false}>Демо-доска матчей и бронирований →</Link>
          <Link href="/challenges" prefetch={false}>Реальный каталог вызовов →</Link>
        </nav>
      </div>
    </div>
  );
}
