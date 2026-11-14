'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { UserRole } from '@/types';
import {
  Trophy,
  MapPin,
  Swords,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Flame,
  LayoutDashboard,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, switchUserRole, theme, toggleTheme } = useAppState();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/venues', label: 'Площадки & Хабы', icon: MapPin },
    { href: '/challenges', label: 'Доска Вызовов', icon: Swords },
    { href: '/leaderboards', label: 'Турнирная Таблица', icon: BarChart3 },
    { href: '/profile', label: 'Моя Команда', icon: Trophy },
    ...(currentUser.role === 'SUPER_ADMIN'
      ? [{ href: '/admin', label: 'Панель Админа', icon: LayoutDashboard }]
      : []),
  ];

  const roles: { role: UserRole; label: string; desc: string; icon: any }[] = [
    {
      role: 'STUDENT_CAPTAIN',
      label: 'Студент-Капитан',
      desc: 'Сардор (TEAM University)',
      icon: Trophy,
    },
    {
      role: 'VENUE_MANAGER',
      label: 'Менеджер площадок',
      desc: 'Джамшид (Динамо & TEAM Hub)',
      icon: MapPin,
    },
    {
      role: 'SUPER_ADMIN',
      label: 'Супер-Администратор',
      desc: 'Дильноза (Комиссар Лиги)',
      icon: ShieldCheck,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-neutral-950/90 border-b border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                UNISPORT
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                League
              </span>
            </div>
            <div className="text-[9px] text-neutral-400 font-medium">
              Межуниверситетская Лига Ташкента
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
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
        <div className="hidden sm:flex items-center gap-2.5">
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

          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/80 hover:border-amber-500/50 text-xs font-medium text-neutral-300 hover:text-white transition-all shadow-inner"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-400">Роль:</span>
              <span className="text-amber-400 font-bold">
                {currentUser.role === 'STUDENT_CAPTAIN'
                  ? 'Капитан'
                  : currentUser.role === 'VENUE_MANAGER'
                  ? 'Менеджер'
                  : 'Админ'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase border-b border-neutral-800 mb-1">
                  Переключить Роль
                </div>
                {roles.map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchUserRole(item.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-amber-500/10 border border-amber-500/30 text-white'
                          : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          {item.label}
                          {isSelected && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
                        </div>
                        <div className="text-[11px] text-neutral-400">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Profile Mini Badge */}
          <Link
            href="/profile"
            className="flex items-center gap-2 pl-2 py-1 pr-1 rounded-xl hover:bg-neutral-900 transition-colors"
          >
            <div className="text-right hidden lg:block">
              <div className="text-xs font-bold text-white leading-tight">{currentUser.fullName}</div>
              <div className="text-[10px] text-amber-400 font-semibold leading-tight">
                {currentUser.universityName || 'Администрация Лиги'}
              </div>
            </div>
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.fullName}
              className="w-8 h-8 rounded-xl object-cover border border-amber-500/40"
            />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle & Theme */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
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
          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-2">
            <span className="text-xs text-neutral-400">Роль:</span>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchUserRole(r.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs py-2 px-1 rounded-xl text-center font-bold border ${
                    currentUser.role === r.role
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'border-neutral-800 text-neutral-400'
                  }`}
                >
                  {r.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
