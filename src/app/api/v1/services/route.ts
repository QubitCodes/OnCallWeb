import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { ServiceController } from '@controllers/ServiceController';

export const dynamic = 'force-dynamic';

/** GET /api/v1/services — List all services */
export async function GET(req: NextRequest) {
	const requestHelper = await RequestHelper.parse(req);
	return ServiceController.list(requestHelper);
}

/** POST /api/v1/services — Create a new service */
export async function POST(req: NextRequest) {
	const requestHelper = await RequestHelper.parse(req);
	return ServiceController.create(requestHelper);
}
