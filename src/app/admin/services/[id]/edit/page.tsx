'use client';

import ServiceForm from '@/components/admin2/services/ServiceForm';
import { use } from 'react';

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15, route params are Promises that must be unwrapped using React.use()
  const unwrappedParams = use(params);

  return (
    <div className="p-6">
      <ServiceForm isEdit={true} editId={unwrappedParams.id} />
    </div>
  );
}
