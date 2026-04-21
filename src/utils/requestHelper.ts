import { NextRequest } from 'next/server';

export class RequestHelper {
  static async parse(req: NextRequest, { params }: { params?: Record<string, string | string[]> } = {}) {
    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    let body: any = {};
    const files: Record<string, File> = {};

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        body = await req.json();
      } catch (e) {
        // ignore JSON parse error or handle as empty body
      }
    } else if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            files[key] = value;
          } else {
            body[key] = value;
          }
        }
      } catch (e) {}
    }

    return {
      params: params || {},
      searchParams,
      body,
      files,
      all: () => ({ ...params, ...searchParams, ...body }),
      file: (name: string) => files[name] || null,
      header: (name: string) => req.headers.get(name),
    };
  }
}
