import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { AdminAuthController } from '@controllers/AdminAuthController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestHelper = await RequestHelper.parse(req);
  return AdminAuthController.me(requestHelper);
}
