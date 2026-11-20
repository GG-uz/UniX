'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { officialEvent } from '@/lib/officialEvent';
import {
  Trophy,
  Swords,
  BarChart3,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDemo = pathname === '/admin' || ['/leaderboards', '/demo', '/venues'].some(
    base => pathname === base || pathname.startsWith(`${base}/`)
  );
  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/challenges', label: 'Соревнования', icon: Swords },
    { href: '/universities', label: 'Университеты' },
    { href: '/leaderboards', label: 'Рейтинги', icon: BarChart3 },
    { href: officialEvent.href, label: 'Официальный матч' },
    { href: '/profile', label: 'Профиль', icon: Trophy },
  ];

  return (
    <>
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/90 border-b border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                UniX
              </span>
            </div>
            <div className="text-[9px] text-neutral-400 font-medium">
              Университетские соревнования
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Основная навигация" className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle, Role Selector & User Profile */}
        <div className="hidden xl:flex items-center gap-2.5">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-400 transition-all shadow-inner"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

        </div>

        {/* Mobile Hamburger Toggle & Theme */}
        <div className="flex xl:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav aria-label="Мобильная навигация" className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-neutral-800 bg-neutral-950 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
    {isDemo && (
      <aside className="border-b border-amber-500/30 bg-neutral-900 px-4 py-3 text-center text-sm text-neutral-300">
        <strong className="text-amber-400">Демонстрационные данные.</strong>{' '}
        Команды, результаты, отзывы, партнёрские отметки и слоты — примеры. Реальных бронирований, платежей и возвратов нет.{' '}
        <Link href={officialEvent.href} className="font-bold underline">К согласованному матчу</Link>
        {' · '}<Link href="/demo/profile" className="underline">Демо-профиль команды</Link>
      </aside>
    )}
    </>
  );
};
