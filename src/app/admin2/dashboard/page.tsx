'use client'; // Make it a client component for localStorage and useRouter

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useRouter } from 'next/navigation'; // Import useRouter
import { useEffect } from 'react'; // Import useEffect
import dynamic from "next/dynamic";

// Dynamically import ECommerce with SSR disabled
const ECommerce = dynamic(() => import("@/components/Dashboard/E-commerce"), {
  ssr: false, // Disable server-side rendering for this component
});

export default function Home() {
  const router = useRouter();


  return (
    <>
      <DefaultLayout>
        <ECommerce />
      </DefaultLayout>
    </>
  );
}