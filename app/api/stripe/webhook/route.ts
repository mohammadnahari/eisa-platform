import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Implement Stripe webhook handler
  // 1. Verify stripe signature: stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
  // 2. Handle checkout.session.completed → update orders table
  // 3. Handle payment_intent.payment_failed → notify client + coach
  const body = await request.text()
  console.log('Stripe webhook received:', body.substring(0, 100))
  return NextResponse.json({ received: true })
}
