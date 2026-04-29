'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from '@/lib/api';
import { Service } from '@/types/service';

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  delay?: number;
  active?: boolean;
  slug: string;
};

const ServicesContent = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Use native axios to hit the local Next.js API route instead of the Adonis base URL
        const response = await require('axios').default.get('/api/v1/public/services');
        const servicesData = response.data.data || response.data || [];
        
        // Ensure we have valid service objects
        const validServices = servicesData.filter((service: Partial<Service>) => 
          service && service.id && service.name && service.slug
        );
        
        setServices(validServices);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        // Set fallback services
        setServices(getFallbackServices());
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fallback services in case API is not available
  const getFallbackServices = (): Service[] => [
    // Home Care Services
    { id: 'f1', name: 'Domiciliary Care', slug: 'domiciliary-care', category: 'home-care', active: true, createdAt: '', updatedAt: '', description: 'Professional care services provided in the comfort and familiarity of your own home, maintaining your independence while receiving the support you need.' },
    { id: 'f2', name: 'Night Care', slug: 'night-care', category: 'home-care', active: true, createdAt: '', updatedAt: '', description: 'Overnight care services providing peace of mind for families while ensuring your loved one receives professional supervision and assistance during nighttime hours.' },
    { id: 'f3', name: 'Respite Care', slug: 'respite-care', category: 'home-care', active: true, createdAt: '', updatedAt: '', description: 'Temporary care services designed to give family caregivers a much-needed break while ensuring continuity of high-quality care for your loved one.' },
    { id: 'f4', name: 'Home Help and Housekeeping', slug: 'home-help', category: 'home-care', active: true, createdAt: '', updatedAt: '', description: 'Comprehensive home assistance including cleaning, organizing, meal preparation, and general housekeeping to maintain a safe and comfortable living environment.' },
    { id: 'f5', name: 'Companionship Care', slug: 'companionship', category: 'home-care', active: true, createdAt: '', updatedAt: '', description: 'Social companionship and emotional support to combat loneliness and isolation, including conversation, activities, and assistance with daily routines.' },
    { id: 'f6', name: 'Daytime Care', slug: 'daytime-care', category: 'home-care', active: true, createdAt: '', updatedAt: '', description: 'Daytime supervision and assistance with daily activities, personal care, and social engagement while family members are at work or need time away.' },
    { id: 'f7', name: 'Live in Care', slug: 'live-in-care', category: 'home-care', active: true, createdAt: '', updatedAt: '', description: 'Round-the-clock care with a dedicated caregiver living in your home, providing continuous support while allowing you to remain in familiar surroundings.' },
    
    // Specialist Care Services
    { id: 'fs1', name: 'Dementia Care', slug: 'dementia-care', category: 'specialist-care', active: true, createdAt: '', updatedAt: '', description: 'Specialized care for individuals with dementia and Alzheimer\'s disease, focusing on cognitive support, safety, and maintaining quality of life through personalized approaches.' },
    { id: 'fs2', name: 'Cancer Care', slug: 'cancer-care', category: 'specialist-care', active: true, createdAt: '', updatedAt: '', description: 'Compassionate support for cancer patients and their families, including symptom management, emotional support, and assistance with treatment-related needs.' },
    { id: 'fs3', name: 'Parkinson\'s Care', slug: 'parkinsons-care', category: 'specialist-care', active: true, createdAt: '', updatedAt: '', description: 'Specialized care for individuals with Parkinson\'s disease, focusing on mobility assistance, medication management, and maintaining independence through adaptive strategies.' },
    { id: 'fs4', name: 'Neurological Care', slug: 'neurological-care', category: 'specialist-care', active: true, createdAt: '', updatedAt: '', description: 'Expert care for individuals with neurological conditions, providing specialized support for complex needs and helping maintain optimal function and quality of life.' },
    { id: 'fs5', name: 'Palliative Care', slug: 'palliative-care', category: 'specialist-care', active: true, createdAt: '', updatedAt: '', description: 'Comfort-focused care for individuals with serious illnesses, emphasizing pain management, symptom relief, and emotional support for patients and families.' },
    { id: 'fs6', name: 'Arthritis and Mobility Care', slug: 'arthritis-mobility', category: 'specialist-care', active: true, createdAt: '', updatedAt: '', description: 'Specialized support for individuals with arthritis and mobility challenges, including pain management, physical assistance, and adaptive equipment guidance.' },
    { id: 'fs7', name: 'Diabetes Care', slug: 'diabetes-care', category: 'specialist-care', active: true, createdAt: '', updatedAt: '', description: 'Comprehensive diabetes management including blood sugar monitoring, medication administration, dietary guidance, and education to help maintain optimal health.' },
  ];

  // Helper functions to categorize services
  const getHomeCareServices = (): ServiceItem[] => {
    return services
      .filter(service => service.active && (service.category === 'home-care' || !service.category))
      .map((service, index) => ({
        id: service.id,
        title: service.name,
        description: service.description || 'Professional care service tailored to your needs.',
        icon: service.icon || `/images/icon-service-${(index % 6) + 1}.svg`,
        image: '/images/service-1.jpg',
        delay: index * 0.2,
        active: index === 0,
        slug: service.slug
      }));
  };

  const getSpecialistCareServices = (): ServiceItem[] => {
    return services
      .filter(service => service.active && service.category === 'specialist-care')
      .map((service, index) => ({
        id: service.id,
        title: service.name,
        description: service.description || 'Specialized care service for complex needs.',
        icon: service.icon || `/images/icon-service-${(index % 6) + 1}.svg`,
        image: '/images/service-1.jpg',
        delay: index * 0.2,
        active: false,
        slug: service.slug
      }));
  };

  if (loading) {
    return (
      <div className="page-services">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <div style={{ padding: '60px 0' }}>
                <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
                <p className="mt-3">Loading services...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="page-services">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <div style={{ padding: '60px 0' }}>
                <i className="fas fa-exclamation-triangle fa-3x text-warning"></i>
                <p className="mt-3">Unable to load services. Please try again later.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const homeCareServices = getHomeCareServices();
  const specialistCareServices = getSpecialistCareServices();

  return (
    <div className="page-services">
      <div className="container">
        {/* Home Care Section */}
        {homeCareServices.length > 0 && (
          <>
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <h2 className="text-anime-style-2 wow fadeInUp" data-cursor="-opaque">
                    Home Care
                  </h2>
                  <p className="wow fadeInUp">
                    Our home care services give you the flexibility to live each day with independence
                  </p>
                </div>
              </div>
            </div>

            <div className="row service-list">
              {homeCareServices.map((service) => (
                <div className="col-lg-4 col-md-6" key={service.id}>
                  {/* Service Item Start */}
                  <div
                    className={`service-item ${service.active ? "active" : ""} wow fadeInUp`}
                    data-wow-delay={service.delay}
                  >
                    {/* Service Image Start */}
                    <div className="service-image">
                      <Image src={service.image} alt={service.title} width={600} height={400} />
                    </div>
                    {/* Service Image End */}

                    {/* Service Body Start */}
                    <div className="service-body">
                      {/* Icon Box Start */}
                      <div className="icon-box">
                        <Image src={service.icon} alt="" width={60} height={60} />
                      </div>
                      {/* Icon Box End */}

                      {/* Service Content Start */}
                      <div className="service-content">
                        <h3>
                          <Link href={`/services/${service.slug}`}>{service.title}</Link>
                        </h3>
                        <p>{service.description}</p>
                      </div>
                      {/* Service Content End */}

                      {/* Service Readmore Button Start */}
                      <div className="service-readmore-btn">
                        <Link href={`/services/${service.slug}`} className="readmore-btn">
                          Learn more
                        </Link>
                      </div>
                      {/* Service Readmore Button End */}
                    </div>
                    {/* Service Body End */}
                  </div>
                  {/* Service Item End */}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Specialist & Complex Care Section */}
        {specialistCareServices.length > 0 && (
          <>
            <div className="row section-row" style={{ marginTop: 80 }}>
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <h2 className="text-anime-style-2 wow fadeInUp" data-cursor="-opaque">
                    Specialist & Complex Care
                  </h2>
                  <p className="wow fadeInUp">
                    Our Specialist & complex care services give you the flexibility to live each day with independence
                  </p>
                </div>
              </div>
            </div>

            <div className="row service-list">
              {specialistCareServices.map((service) => (
                <div className="col-lg-4 col-md-6" key={service.id}>
                  {/* Service Item Start */}
                  <div className={`service-item wow fadeInUp`} data-wow-delay={service.delay}>
                    {/* Service Image Start */}
                    <div className="service-image">
                      <Image src={service.image} alt={service.title} width={600} height={400} />
                    </div>
                    {/* Service Image End */}

                    {/* Service Body Start */}
                    <div className="service-body">
                      {/* Icon Box Start */}
                      <div className="icon-box">
                        <Image src={service.icon} alt="" width={60} height={60} />
                      </div>
                      {/* Icon Box End */}

                      {/* Service Content Start */}
                      <div className="service-content">
                        <h3>
                          <Link href={`/services/${service.slug}`}>{service.title}</Link>
                        </h3>
                        <p>{service.description}</p>
                      </div>
                      {/* Service Content End */}

                      {/* Service Readmore Button Start */}
                      <div className="service-readmore-btn">
                        <Link href={`/services/${service.slug}`} className="readmore-btn">
                          Learn more
                        </Link>
                      </div>
                      {/* Service Readmore Button End */}
                    </div>
                    {/* Service Body End */}
                  </div>
                  {/* Service Item End */}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {homeCareServices.length === 0 && specialistCareServices.length === 0 && !loading && (
          <div className="row">
            <div className="col-12 text-center">
              <div style={{ padding: '60px 0' }}>
                <i className="fas fa-info-circle fa-3x text-info"></i>
                <h3 className="mt-3">No Services Available</h3>
                <p>Services are currently being updated. Please check back soon.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesContent;
