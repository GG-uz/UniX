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
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Flame,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, switchUserRole } = useAppState();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/venues', label: 'Venues & Slots', icon: MapPin },
    { href: '/challenges', label: 'Challenge Board', icon: Swords },
    { href: '/leaderboards', label: 'Leaderboard', icon: BarChart3 },
    { href: '/profile', label: 'My Team', icon: Trophy },
    ...(currentUser.role === 'SUPER_ADMIN'
      ? [{ href: '/admin', label: 'Admin Panel', icon: LayoutDashboard }]
      : []),
  ];

  const roles: { role: UserRole; label: string; desc: string; icon: any }[] = [
    {
      role: 'STUDENT_CAPTAIN',
      label: 'Student Captain',
      desc: 'HSE Eagles FC Captain',
      icon: Trophy,
    },
    {
      role: 'VENUE_MANAGER',
      label: 'Venue Manager',
      desc: 'Dynamo Arena Admin',
      icon: MapPin,
    },
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin',
      desc: 'League Moderator',
      icon: ShieldCheck,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-neutral-950/90 border-b border-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              UNISPORT
            </span>
            <span className="ml-1 text-xs font-bold uppercase tracking-widest text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
              League
            </span>
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-800 text-amber-400 border border-neutral-700'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Role Selector & User Profile */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-700/80 hover:border-amber-500/50 text-xs font-medium text-neutral-300 hover:text-white transition-all shadow-inner"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-400">Role:</span>
              <span className="text-amber-400 font-semibold">
                {currentUser.role === 'STUDENT_CAPTAIN'
                  ? 'Captain'
                  : currentUser.role === 'VENUE_MANAGER'
                  ? 'Venue Mgr'
                  : 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase border-b border-neutral-800 mb-1">
                  Switch Active Role Persona
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
                      className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-amber-500/10 border border-amber-500/30 text-white'
                          : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-md ${
                          isSelected ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          {item.label}
                          {isSelected && <span className="text-[10px] text-amber-400 font-bold">Active</span>}
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
            className="flex items-center gap-2.5 pl-2 py-1 pr-1 rounded-full hover:bg-neutral-900 transition-colors"
          >
            <div className="text-right hidden lg:block">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser.fullName}</div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                {currentUser.universityName || 'League Host'}
              </div>
            </div>
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.fullName}
              className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
            />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-neutral-800 text-amber-400'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-2">
            <span className="text-xs text-neutral-400">Switch Persona:</span>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchUserRole(r.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs py-2 px-1 rounded text-center font-medium border ${
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
