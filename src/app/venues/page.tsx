'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { VenueFilterBar } from '@/components/venues/VenueFilterBar';
import { VenueCard } from '@/components/venues/VenueCard';
import { MapPin, Sparkles } from 'lucide-react';

function VenuesContent() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get('sport') || 'ALL';

  const { venues } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [selectedSurface, setSelectedSurface] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(300000);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSport('ALL');
    setSelectedSurface('ALL');
    setMaxPrice(300000);
    setOnlyFeatured(false);
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSport =
      selectedSport === 'ALL' || venue.sportTypes.includes(selectedSport as any);

    const matchesSurface =
      selectedSurface === 'ALL' || venue.surfaceType.toLowerCase().includes(selectedSurface.toLowerCase());

    const matchesPrice = venue.hourlyRate <= maxPrice;
    const matchesFeatured = !onlyFeatured || venue.isFeatured;

    return matchesSearch && matchesSport && matchesSurface && matchesPrice && matchesFeatured;
  });

  const featuredVenues = filteredVenues.filter((v) => v.isFeatured);
  const standardVenues = filteredVenues.filter((v) => !v.isFeatured);

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            Каталог Площадок &amp; Хабов Ташкента
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Арены, Коворкинги &amp; Научные Хабы
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Бронируйте слоты для футбола, матбоев, хакатонов и кейс-чемпионатов по ставке до 300 000 сум/час с гарантией защиты брони.
          </p>
        </div>

        {/* Filter Bar */}
        <VenueFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
          selectedSurface={selectedSurface}
          setSelectedSurface={setSelectedSurface}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onlyFeatured={onlyFeatured}
          setOnlyFeatured={setOnlyFeatured}
          onReset={resetFilters}
        />

        {/* Priority Featured Placement Section */}
        {featuredVenues.length > 0 && !onlyFeatured && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Featured Партнеры (Приоритетное Размещение)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVenues.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </div>
        )}

        {/* Standard Venues Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {onlyFeatured
                ? `Найдено партнеров: ${featuredVenues.length}`
                : `Все доступные локации (${standardVenues.length})`}
            </h2>
          </div>

          {(onlyFeatured ? featuredVenues : standardVenues).length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800">
              <p className="text-sm text-neutral-400">Площадок по вашим критериям не найдено.</p>
              <button
                onClick={resetFilters}
                className="mt-3 text-xs text-amber-400 font-bold hover:underline"
              >
                Сбросить параметры фильтра
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(onlyFeatured ? featuredVenues : standardVenues).map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VenuesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 p-12 text-white">Загрузка площадок...</div>}>
      <VenuesContent />
    </Suspense>
  );
}
