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
  const [maxPrice, setMaxPrice] = useState(180);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSport('ALL');
    setSelectedSurface('ALL');
    setMaxPrice(180);
    setOnlyFeatured(false);
  };

  const filteredVenues = venues.filter((venue) => {
    // Search query filter
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase());

    // Sport filter
    const matchesSport =
      selectedSport === 'ALL' || venue.sportTypes.includes(selectedSport as any);

    // Surface filter
    const matchesSurface =
      selectedSurface === 'ALL' || venue.surfaceType.toLowerCase().includes(selectedSurface.toLowerCase());

    // Price filter
    const matchesPrice = venue.hourlyRate <= maxPrice;

    // Featured filter
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            Arena Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Certified Sports Venues &amp; Slot Booking
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Book professional courts and pitches with verified amenities. All reservations protected by our mandatory prepayment and strict 48-hour cancellation policy.
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

        {/* Section 1: Featured Venues Priority Showcase */}
        {featuredVenues.length > 0 && !onlyFeatured && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                Priority Featured Venues (Sponsored Placements)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVenues.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Standard Venues Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              {onlyFeatured ? 'Featured Arenas' : 'All Available Venues'}{' '}
              <span className="text-neutral-500">({filteredVenues.length})</span>
            </h2>
          </div>

          {filteredVenues.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800">
              <p className="text-sm text-neutral-400">
                No venues match your current filter criteria.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
              >
                Reset All Filters
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
    <Suspense fallback={<div className="p-12 text-center text-white">Loading venues...</div>}>
      <VenuesContent />
    </Suspense>
  );
}
