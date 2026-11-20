'use client';

import React, { useEffect,useRef,useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { officialEvent } from '@/lib/officialEvent';
import { NotificationPanel } from '@/components/demo-notifications/Inbox';
import { useDemoInbox } from '@/components/demo-notifications/Store';
import {
  Trophy,
  Swords,
  BarChart3,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  return <Navigation key={pathname} pathname={pathname}/>;
};
function Navigation({pathname}:{pathname:string}){
  const { theme, toggleTheme } = useAppState();
  const [panel,setPanel]=useState<'menu'|'inbox'|null>(null);
  const mobileMenuOpen=panel==='menu', inboxOpen=panel==='inbox';
  const demoInbox=pathname.startsWith('/demo/');
  const header=useRef<HTMLElement>(null),menu=useRef<HTMLButtonElement>(null),bell=useRef<HTMLButtonElement>(null);
  const {list}=useDemoInbox();
  const unread=list.filter(n=>!n.readAt).length;
  useEffect(()=>{
    if(!panel)return;
    const outside=(e:PointerEvent)=>{if(!header.current?.contains(e.target as Node))setPanel(null);};
    const resize=()=>{if(panel==='menu'&&window.matchMedia('(min-width:80rem)').matches)setPanel(null);};
    document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);
    return ()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);};
  },[panel]);

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
    <header ref={header} onKeyDown={e=>{
      if(e.key==='Escape'&&panel){e.preventDefault();(inboxOpen?bell:menu).current?.focus();setPanel(null);}
    }} onBlur={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget))setPanel(null);}}
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/90 border-b border-neutral-800 transition-colors [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-2">
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
            <div className="hidden sm:block text-xs text-neutral-400 font-medium">
              Университетские соревнования
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Основная навигация" className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href+'/');
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname===link.href?'page':isActive?'location':undefined}
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
        <div className="flex items-center gap-2">
          {demoInbox&&<>
            <button ref={bell} aria-label={`Демоуведомления: ${unread} непрочитанных`} aria-expanded={inboxOpen} aria-controls={inboxOpen?'demo-inbox-panel':undefined}
              className="min-h-11 min-w-11 flex items-center justify-center gap-1 rounded-xl border border-neutral-700"
              onClick={()=>setPanel(inboxOpen?null:'inbox')}>
              <Bell size={19}/>{unread>0&&<span aria-hidden className="text-xs font-bold">{unread>99?'99+':unread}</span>}
            </button>
            {inboxOpen&&<NotificationPanel close={()=>{bell.current?.focus();setPanel(null);}}/>}
          </>}
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
            className="hidden xl:grid min-h-11 min-w-11 place-items-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          <button
            ref={menu} onClick={() => setPanel(mobileMenuOpen?null:'menu')}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen?'mobile-navigation':undefined}
            className="xl:hidden min-h-11 min-w-11 grid place-items-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Мобильная навигация" className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-neutral-800 bg-neutral-950 px-4 pt-2 pb-6 space-y-2">
          <button className="min-h-11 px-3 underline" onClick={toggleTheme}>{theme==='dark'?'Включить светлую тему':'Включить тёмную тему'}</button>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href+'/');
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname===link.href?'page':isActive?'location':undefined}
                onClick={() => setPanel(null)}
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
        <strong className="text-amber-400">{demoInbox?'ДЕМО · данные вымышлены.':'Демонстрационные данные.'}</strong>{' '}
        Команды, результаты, отзывы, партнёрские отметки и слоты — примеры. Реальных бронирований, платежей и возвратов нет.{' '}
        <Link href={officialEvent.href} className="font-bold underline">К согласованному матчу</Link>
        {' · '}<Link href="/demo/profile" className="underline">Демо-профиль команды</Link>
      </aside>
    )}
    </>
  );
};
