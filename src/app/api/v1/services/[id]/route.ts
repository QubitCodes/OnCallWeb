import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { ServiceController } from '@controllers/ServiceController';

export const dynamic = 'force-dynamic';

/** GET /api/v1/services/:id — Show a specific service */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const requestHelper = await RequestHelper.parse(req);
	const unwrappedParams = await params;
	return ServiceController.show(requestHelper, unwrappedParams.id);
}

/** PUT /api/v1/services/:id — Update a service */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const requestHelper = await RequestHelper.parse(req);
	const unwrappedParams = await params;
	return ServiceController.update(requestHelper, unwrappedParams.id);
}

/** DELETE /api/v1/services/:id — Soft delete a service */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const requestHelper = await RequestHelper.parse(req);
	const unwrappedParams = await params;
	return ServiceController.destroy(requestHelper, unwrappedParams.id);
}
