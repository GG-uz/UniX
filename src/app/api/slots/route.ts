import { NextResponse } from 'next/server';
import { MOCK_VENUES } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get('venueId');

  const venue = MOCK_VENUES.find((v) => v.id === venueId);
  if (!venue) {
    return NextResponse.json(
      { success: false, error: 'Venue not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: venue.slots,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venueId, slotId, userId, isSplitPayment } = body;

    const venue = MOCK_VENUES.find((v) => v.id === venueId);
    if (!venue) {
      return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
    }

    const slot = venue.slots.find((s) => s.id === slotId);
    if (!slot) {
      return NextResponse.json({ success: false, error: 'Slot not found' }, { status: 404 });
    }

    if (slot.isBooked) {
      return NextResponse.json({ success: false, error: 'Slot already booked' }, { status: 409 });
    }

    // Calculate strict 48-Hour cancellation deadline
    const slotStartTime = new Date(slot.startTime);
    const cancellationDeadline = new Date(slotStartTime.getTime() - 48 * 60 * 60 * 1000);

    const booking = {
      id: `bk-${Date.now()}`,
      venueId,
      slotId,
      userId,
      amountPaid: isSplitPayment ? slot.price / 2 : slot.price,
      isSplitPayment: Boolean(isSplitPayment),
      paymentStatus: isSplitPayment ? 'PAID_SPLIT' : 'PAID_FULL',
      cancellationDeadline: cancellationDeadline.toISOString(),
      cancellationPolicyNotice:
        'Cancellations made within 48 hours of slot start time will forfeit the full deposit to the venue manager.',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Slot booked and prepayment secured',
      data: booking,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
