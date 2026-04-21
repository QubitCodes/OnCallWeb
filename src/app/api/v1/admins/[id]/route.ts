import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { AdminController } from '@controllers/AdminController';

export const dynamic = 'force-dynamic';

/** GET /api/v1/admins/:id — Show a single admin */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const requestHelper = await RequestHelper.parse(req);
	return AdminController.show(requestHelper, id);
}

/** PUT /api/v1/admins/:id — Update an admin */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const requestHelper = await RequestHelper.parse(req);
	return AdminController.update(requestHelper, id);
}

/** DELETE /api/v1/admins/:id — Soft-delete an admin */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const requestHelper = await RequestHelper.parse(req);
	return AdminController.destroy(requestHelper, id);
}
