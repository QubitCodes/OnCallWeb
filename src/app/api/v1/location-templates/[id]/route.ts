import { NextRequest } from 'next/server';
import { LocationTemplateController } from '@controllers/LocationTemplateController';
import { RequestHelper } from '@utils/requestHelper';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const reqHelper = await RequestHelper.parse(request, { params });
  return LocationTemplateController.show(reqHelper, params.id);
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const reqHelper = await RequestHelper.parse(request, { params });
  return LocationTemplateController.update(reqHelper, params.id);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const reqHelper = await RequestHelper.parse(request, { params });
  return LocationTemplateController.destroy(reqHelper, params.id);
}
