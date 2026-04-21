import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { ContactController } from '@controllers/ContactController';

export const dynamic = 'force-dynamic';

/** GET /api/v1/contacts — List all contacts */
export async function GET(req: NextRequest) {
	const requestHelper = await RequestHelper.parse(req);
	return ContactController.list(requestHelper);
}

/** POST /api/v1/contacts — Create a new contact inquiry (Public) */
export async function POST(req: NextRequest) {
	const requestHelper = await RequestHelper.parse(req);
	return ContactController.create(requestHelper);
}
