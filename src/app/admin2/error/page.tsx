"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || '500';
  const message = searchParams.get('message') || 'Unknown error occurred';

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-boxdark-2">
      <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-boxdark dark:text-bodydark">
        <h1 className="mb-4 text-4xl font-bold text-red-600">Error {status}</h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-bodydark">{message}</p>
        <Link
          href="/"
          className="rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}