import { NextResponse } from 'next/server';
import { MOCK_MATCHES } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const sport = searchParams.get('sport');

  let list = [...MOCK_MATCHES];

  if (status && status !== 'ALL') {
    list = list.filter((m) => m.status === status);
  }

  if (sport && sport !== 'ALL') {
    list = list.filter((m) => m.sportType === sport);
  }

  return NextResponse.json({
    success: true,
    count: list.length,
    data: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sportType, challengerTeamId, venueId, slotId, description } = body;

    if (!sportType || !challengerTeamId || !venueId || !slotId) {
      return NextResponse.json(
        { success: false, error: 'Missing required match parameters' },
        { status: 400 }
      );
    }

    const newMatch = {
      id: `match-${Date.now()}`,
      sportType,
      challengerTeamId,
      venueId,
      slotId,
      status: 'OPEN',
      description: description || 'Open challenge waiting for rival',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, message: 'Challenge broadcasted successfully', data: newMatch },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
