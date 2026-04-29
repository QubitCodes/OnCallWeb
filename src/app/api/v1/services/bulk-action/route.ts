import { NextRequest } from 'next/server';
import { ServiceController } from '@controllers/ServiceController';
import { RequestHelper } from '@utils/requestHelper';

export async function POST(request: NextRequest) {
  const reqHelper = await RequestHelper.parse(request);
  return ServiceController.bulkAction(reqHelper);
}
