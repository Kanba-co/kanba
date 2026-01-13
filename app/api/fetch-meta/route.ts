import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Stripe is disabled' },
    { status: 503 }
  )
}
