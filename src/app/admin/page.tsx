import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminIndex() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
