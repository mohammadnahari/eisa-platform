import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  // Phase 2: Implement Stripe webhook
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  // Handle: checkout.session.completed → mark order paid
  // Handle: payment_intent.payment_failed → mark order failed

  console.log('Stripe webhook received')
  return NextResponse.json({ received: true })
}
