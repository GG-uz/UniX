import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'USD', description, metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // Generate mock Stripe Checkout session
    const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const mockPaymentIntentId = `pi_test_${Math.random().toString(36).substring(2, 15)}`;

    return NextResponse.json({
      success: true,
      sessionId: mockSessionId,
      paymentIntentId: mockPaymentIntentId,
      amount,
      currency,
      status: 'succeeded',
      receiptUrl: `https://stripe.com/mock-receipts/${mockSessionId}`,
      metadata: {
        ...metadata,
        cancellationPolicy: 'Strict 48-Hour Guarantee: Cancellations <48h forfeit deposit to venue.',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Payment processing error' }, { status: 500 });
  }
}
