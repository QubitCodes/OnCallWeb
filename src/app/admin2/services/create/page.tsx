import ServiceForm from '@/components/admin2/services/ServiceForm';

export default function CreateServicePage() {
  return (
    <div className="p-6">
      <ServiceForm isEdit={false} />
    </div>
  );
}
