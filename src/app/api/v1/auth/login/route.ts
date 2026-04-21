import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { AdminAuthController } from '@controllers/AdminAuthController';

export async function POST(req: NextRequest) {
  const requestHelper = await RequestHelper.parse(req);
  return AdminAuthController.login(requestHelper);
}
