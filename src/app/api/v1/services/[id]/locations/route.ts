import { NextRequest } from 'next/server';
import { ServiceController } from '@controllers/ServiceController';
import { RequestHelper } from '@utils/requestHelper';

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const reqHelper = await RequestHelper.parse(request, { params });
  return ServiceController.updateLocations(reqHelper, params.id);
}
