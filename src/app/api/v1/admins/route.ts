import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { AdminController } from '@controllers/AdminController';

export const dynamic = 'force-dynamic';

/** GET /api/v1/admins — List all admins */
export async function GET(req: NextRequest) {
	const requestHelper = await RequestHelper.parse(req);
	return AdminController.list(requestHelper);
}

/** POST /api/v1/admins — Create a new admin */
export async function POST(req: NextRequest) {
	const requestHelper = await RequestHelper.parse(req);
	return AdminController.create(requestHelper);
}
