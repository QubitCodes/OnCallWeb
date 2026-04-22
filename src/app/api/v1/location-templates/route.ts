import { NextRequest } from 'next/server';
import { LocationTemplateController } from '@controllers/LocationTemplateController';
import { RequestHelper } from '@utils/requestHelper';

export async function GET(request: NextRequest) {
  const reqHelper = await RequestHelper.parse(request);
  return LocationTemplateController.list(reqHelper);
}

export async function POST(request: NextRequest) {
  const reqHelper = await RequestHelper.parse(request);
  return LocationTemplateController.create(reqHelper);
}
