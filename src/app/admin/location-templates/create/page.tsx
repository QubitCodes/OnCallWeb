'use client';

import LocationTemplateForm from '@/components/admin2/location-templates/LocationTemplateForm';

export default function CreateLocationTemplatePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-text-dark dark:text-secondary-100 mb-6">Create Location Template</h1>
      <LocationTemplateForm />
    </div>
  );
}
