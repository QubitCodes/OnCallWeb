import { NextResponse } from 'next/server';

/** Retired maintenance endpoint: never mutate production data through a public GET. */
export async function GET() {
  return NextResponse.json({ status: false, message: 'This maintenance endpoint has been retired.' }, { status: 410 });
}
