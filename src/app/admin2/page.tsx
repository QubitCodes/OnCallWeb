import { redirect } from 'next/navigation';

export default function Admin2Index() {
  // Redirect the root /admin2 path to the dashboard
  redirect('/admin2/dashboard');
}
