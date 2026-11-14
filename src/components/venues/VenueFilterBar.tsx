'use client';

import React from 'react';
import { SportType } from '@/types';
import { Search, Filter, Sparkles, X } from 'lucide-react';

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
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue name, address or district..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Sport Dropdown */}
        <div className="md:col-span-2">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Sports</option>
            <option value="FOOTBALL">Football ⚽</option>
            <option value="BASKETBALL">Basketball 🏀</option>
            <option value="VOLLEYBALL">Volleyball 🏐</option>
          </select>
        </div>

        {/* Surface Dropdown */}
        <div className="md:col-span-2">
          <select
            value={selectedSurface}
            onChange={(e) => setSelectedSurface(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Surfaces</option>
            <option value="Turf">Synthetic Turf</option>
            <option value="Hardwood">Hardwood / Parquet</option>
            <option value="Taraflex">Taraflex</option>
          </select>
        </div>

        {/* Max Price Slider */}
        <div className="md:col-span-2 flex flex-col justify-center">
          <div className="flex justify-between text-[11px] font-semibold text-neutral-400 mb-1">
            <span>Max Rate:</span>
            <span className="text-amber-400">${maxPrice}/hr</span>
          </div>
          <input
            type="range"
            min="50"
            max="180"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Featured Toggle & Reset */}
        <div className="md:col-span-2 flex items-center justify-between sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => setOnlyFeatured(!onlyFeatured)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              onlyFeatured
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Featured
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
