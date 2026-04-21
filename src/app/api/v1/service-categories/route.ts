import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { ServiceCategoryController } from '@controllers/ServiceCategoryController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const requestHelper = await RequestHelper.parse(req);
	return ServiceCategoryController.list(requestHelper);
}
