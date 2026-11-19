'use client';

import React from 'react';
import { DISCIPLINE_LIST } from '@/types';
import { Search, Sparkles, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VenueFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedSport: string;
  setSelectedSport: (s: string) => void;
  selectedSurface: string;
  setSelectedSurface: (s: string) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  onlyFeatured: boolean;
  setOnlyFeatured: (b: boolean) => void;
  onReset: () => void;
}

export const VenueFilterBar: React.FC<VenueFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedSport,
  setSelectedSport,
  selectedSurface,
  setSelectedSurface,
  maxPrice,
  setMaxPrice,
  onlyFeatured,
  setOnlyFeatured,
  onReset,
}) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl backdrop-blur-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию (TEAM Hub, Динамо...) или адресу..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Discipline Dropdown */}
        <div className="md:col-span-3">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full py-2.5 px-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Все дисциплины (Спорт, Наука, IT)</option>
            {DISCIPLINE_LIST.map((d) => (
              <option key={d.type} value={d.type}>
                {d.icon} {d.labelRu}
              </option>
            ))}
          </select>
        </div>

        {/* Surface Dropdown */}
        <div className="md:col-span-2">
          <select
            value={selectedSurface}
            onChange={(e) => setSelectedSurface(e.target.value)}
            className="w-full py-2.5 px-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Любой тип площадки</option>
            <option value="Газон">Газон (Футбол)</option>
            <option value="Коворкинг">Аудитории &amp; Коворкинг</option>
            <option value="Лаборатория">Лаборатория (Химия/Физика)</option>
            <option value="Киберспортивная">Кибер-сцена / IT-зал</option>
          </select>
        </div>

        {/* Max Price Slider (max 300 000 сум) */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-neutral-400">Лимит:</span>
            <span className="text-amber-400 font-bold">{formatCurrency(maxPrice)}/ч</span>
          </div>
          <input
            type="range"
            min={100000}
            max={300000}
            step={20000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="accent-amber-500 w-full h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Featured Toggle & Reset Filters */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyFeatured}
            onChange={(e) => setOnlyFeatured(e.target.checked)}
            className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
          />
          <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Только площадки из демо-подборки
          </span>
        </label>

        <button
          onClick={onReset}
          className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
        >
          <X className="w-3.5 h-3.5" />
          Сбросить все фильтры
        </button>
      </div>
    </div>
  );
};
