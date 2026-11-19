import { NextResponse } from 'next/server';
import { MOCK_VENUES } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport');
  const featured = searchParams.get('featured');

  let venues = [...MOCK_VENUES];

  if (sport && sport !== 'ALL') {
    venues = venues.filter((v) => v.sportTypes.some(type => type === sport));
  }

  if (featured === 'true') {
    venues = venues.filter((v) => v.isFeatured);
  }

  return NextResponse.json({
    success: true,
    count: venues.length,
    data: venues,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, hourlyRate, sportTypes, surfaceType, managerId } = body;

    if (!name || !address || !hourlyRate || !sportTypes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newVenue = {
      id: `venue-${Date.now()}`,
      name,
      managerId: managerId || 'user-2',
      address,
      city: 'Moscow',
      hourlyRate: Number(hourlyRate),
      sportTypes,
      surfaceType: surfaceType || 'Standard Turf',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      rating: 5.0,
      reviewCount: 1,
      cancellationHours: 48,
      amenities: ['Locker Rooms', 'Lights', 'Showers'],
      slots: [],
    };

    return NextResponse.json(
      { success: true, message: 'Venue registered successfully', data: newVenue },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON payload' },
      { status: 500 }
    );
  }
}
