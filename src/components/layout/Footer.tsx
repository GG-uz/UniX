'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-sm mt-auto">
      {/* Top Banner: Rules & Guarantees */}
      <div className="border-b border-neutral-900/60 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Гарантия 48 часов</div>
              <div className="text-xs text-neutral-400">Отмена &gt;48ч — 100% возврат; при поздней отмене залог идет площадке</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Проверенные Арены &amp; Хабы</div>
              <div className="text-xs text-neutral-400">Кампусы вузов, научные лаборатории и сертифицированные стадионы</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Единый Студенческий Рейтинг</div>
              <div className="text-xs text-neutral-400">Автоматический подсчет очков: Спортивная и Академическая Лиги</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white tracking-tight">UNISPORT LEAGUE</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Единая межуниверситетская платформа Ташкента для спортивных матчей, матбоев, хакатонов и научных кейс-турниров.
          </p>
          <div className="text-xs text-neutral-400">
            Цены до 300 000 сум/час • Защита от срывов
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Направления Лиги</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/venues?sport=FOOTBALL" className="hover:text-amber-400 transition-colors">⚽ Футбол &amp; Баскетбол</Link></li>
            <li><Link href="/venues?sport=MATHEMATICS" className="hover:text-amber-400 transition-colors">📐 Математика &amp; Матбои</Link></li>
            <li><Link href="/venues?sport=PHYSICS" className="hover:text-amber-400 transition-colors">⚡ Физика &amp; Инженерия</Link></li>
            <li><Link href="/venues?sport=CHEMISTRY" className="hover:text-amber-400 transition-colors">🧪 Химия &amp; Лаб-хакатоны</Link></li>
            <li><Link href="/venues?sport=IT_HACKATHON" className="hover:text-amber-400 transition-colors">💻 IT Хакатоны &amp; Киберспорт</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Вузы-Участники</h4>
          <ul className="space-y-2 text-xs">
            <li><span className="text-amber-400 font-bold">TEAM University</span></li>
            <li><span className="hover:text-white transition-colors">WIUT (Westminster)</span></li>
            <li><span className="hover:text-white transition-colors">Inha University Tashkent</span></li>
            <li><span className="hover:text-white transition-colors">MDIST</span></li>
            <li><span className="hover:text-white transition-colors">Amity University Tashkent</span></li>
            <li><span className="hover:text-white transition-colors">TUIT (ТУИТ)</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Партнерам и Площадкам</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/venues" className="hover:text-amber-400 transition-colors">Разместить Арену / Хаб</Link></li>
            <li><span className="text-amber-400 font-medium">Статус «Featured» (Продвижение)</span></li>
            <li><Link href="/challenges" className="hover:text-amber-400 transition-colors">Доска открытых вызовов</Link></li>
            <li><span className="hover:text-white transition-colors">Оплата: Payme, Click, Uzum</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
        <div>&copy; 2026-2027 UniSport &amp; Project League Tashkent. Все права защищены.</div>
        <div className="flex items-center gap-6">
          <Link href="/venues" className="hover:underline">Политика отмены 48ч</Link>
          <Link href="/challenges" className="hover:underline">Кодекс Fair Play</Link>
          <Link href="/leaderboards" className="hover:underline">Регламент Турниров</Link>
        </div>
      </div>
    </footer>
  );
};
