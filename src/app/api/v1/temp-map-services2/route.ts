import { NextResponse } from 'next/server';
import { db } from '@db/index';
import { serviceCategories, services } from '@db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const allServices = await db.select().from(services);
		
		const cat1 = 1; // Specialist
		const cat2 = 2; // Home Care
		const homeCareKeywords = ['companionship', 'daytime', 'live-in', 'night', 'visiting'];
		
		let updated = 0;
		for (const svc of allServices) {
			if (!svc.slug) continue;
			const isHomeCare = homeCareKeywords.some(kw => svc.slug?.includes(kw));
			const categoryId = isHomeCare ? cat2 : cat1;
			
			await db.update(services).set({ category: categoryId }).where(eq(services.id, svc.id));
			updated++;
		}

		return NextResponse.json({ status: true, message: `Mapped ${updated} out of ${allServices.length} services in DB.` });
	} catch (error: any) {
		return NextResponse.json({ status: false, message: error.message }, { status: 500 });
	}
}
