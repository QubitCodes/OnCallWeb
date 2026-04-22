import { NextRequest } from 'next/server';
import { AvailabilityController } from '@controllers/AvailabilityController';
import { RequestHelper } from '@utils/requestHelper';

export async function POST(request: NextRequest) {
  const reqHelper = await RequestHelper.parse(request);
  return AvailabilityController.checkAvailability(reqHelper);
}
