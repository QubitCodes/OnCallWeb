import { redirect } from 'next/navigation';

export default function AdminIndex() {
  // Redirect the root /admin path to the dashboard
  redirect('/admin/dashboard');
}

