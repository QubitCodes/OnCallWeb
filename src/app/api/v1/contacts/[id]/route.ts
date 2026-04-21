import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { ContactController } from '@controllers/ContactController';

export const dynamic = 'force-dynamic';

/** GET /api/v1/contacts/:id — Show a specific contact */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const requestHelper = await RequestHelper.parse(req);
	const unwrappedParams = await params;
	return ContactController.show(requestHelper, unwrappedParams.id);
}

/** PUT /api/v1/contacts/:id — Update a contact */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const requestHelper = await RequestHelper.parse(req);
	const unwrappedParams = await params;
	return ContactController.update(requestHelper, unwrappedParams.id);
}

/** DELETE /api/v1/contacts/:id — Soft delete a contact */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const requestHelper = await RequestHelper.parse(req);
	const unwrappedParams = await params;
	return ContactController.destroy(requestHelper, unwrappedParams.id);
}
