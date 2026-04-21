import { NextRequest } from 'next/server';
import { RequestHelper } from '@utils/requestHelper';
import { AdminAuthController } from '@controllers/AdminAuthController';

export async function PUT(req: NextRequest) {
  const requestHelper = await RequestHelper.parse(req);
  return AdminAuthController.updateProfile(requestHelper);
}
