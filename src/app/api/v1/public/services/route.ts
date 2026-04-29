import { NextRequest } from 'next/server';
import { ServiceController } from '@controllers/ServiceController';
import { RequestHelper } from '@utils/requestHelper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Public endpoint for frontend
  return ServiceController.publicList();
}
