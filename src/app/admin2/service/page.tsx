
"use client";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServiceManagementSection from "@/components/service/ServiceManagementSection";

const ServicePage = () => {
  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="Services" />
        <div className="mt-6 space-y-6">
          <ServiceManagementSection />
          
          {/* Customer Search Demo Section */}
          {/* <div>
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-black">
                Customer Search Demo
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                This is how customers will search for services by postcode on your website.
              </p>
            </div>
            <CustomerServiceSearch />
          </div> */}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ServicePage;