'use client';

import { use } from 'react';
import LocationTemplateForm from '@/components/admin2/location-templates/LocationTemplateForm';

export default function EditLocationTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-text-dark dark:text-secondary-100 mb-6">Edit Location Template</h1>
      <LocationTemplateForm templateId={unwrappedParams.id} />
    </div>
  );
}
