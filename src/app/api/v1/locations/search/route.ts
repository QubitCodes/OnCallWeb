import { NextRequest } from 'next/server';
import { LocationController } from '@controllers/LocationController';
import { RequestHelper } from '@utils/requestHelper';

export async function GET(request: NextRequest) {
  const reqHelper = await RequestHelper.parse(request);
  return LocationController.searchNominatim(reqHelper);
}
