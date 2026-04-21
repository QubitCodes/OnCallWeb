import { NextResponse } from 'next/server';
import { db } from '@db/index';
import { services } from '@db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		await db.update(services).set({ category: null as any });
		return NextResponse.json({ status: true, message: 'Cleared categories' });
	} catch (error: any) {
		return NextResponse.json({ status: false, message: error.message }, { status: 500 });
	}
}
