'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import servicesData from '@/data/services.json';

interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  fullDescription: string;
  detailedDescription: string;
  whatIs: string;
  typicalVisit: string;
  services: string[];
  benefits: string;
  benefitsExtended: string;
  gettingStarted: string;
  gettingStartedPoints: string[];
  image: string;
  icon: string;
  stats: Array<{
    number: string;
    suffix: string;
    label: string;
    icon: string;
  }>;
  active: boolean;
}

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const resolvedParams = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all services from JSON
    const services = servicesData.services as Service[];
    setAllServices(services);
        console.log('Fetched services:', resolvedParams.slug);

    // Find the specific service by slug
    const foundService = services.find(s => s.slug == resolvedParams.slug);
        console.log('Fetched services:');
    setService(foundService || null);
    setLoading(false);
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <div style={{ padding: '120px 0' }}>
                <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
                <p className="mt-3">Loading service details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <div style={{ padding: '120px 0' }}>
                <i className="fas fa-exclamation-triangle fa-3x text-warning"></i>
                <h2 className="mt-3">Service Not Found</h2>
                <p>The service you're looking for doesn't exist.</p>
                <Link href="/services" className="btn btn-primary">
                  Back to Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Page Header Start */}
      <div className="page-header bg-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              {/* Page Header Box Start */}
              <div className="page-header-box">
                <h1 className="text-anime-style-2" data-cursor="-opaque">
                  {service.name.split(' ').map((word, index) => 
                    index === service.name.split(' ').length - 1 ? (
                      <span key={index}>{word}</span>
                    ) : (
                      word + ' '
                    )
                  )}
                </h1>
                <nav>
                  <ol className="breadcrumb">
                    {/* <li className="breadcrumb-item"><Link href="/">home</Link></li>
                    <li className="breadcrumb-item"><Link href="/services">services</Link></li> */}
                    {/* <li className="breadcrumb-item active" aria-current="page">{service.name}</li> */}
                  </ol>
                </nav>
              </div>
              {/* Page Header Box End */}
            </div>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Page Service Single Start */}
      <div className="page-service-single">
        <div className="container">
          <div className="row">
            {/* Sidebar Start */}
            <div className="col-lg-4 order-2 order-lg-1">
              <div className="page-single-sidebar">
                {/* Page Category List Start */}
                <div className="page-catagory-list wow fadeInUp">
                  <h3>Explore Our Services</h3>
                  <ul>
                    {allServices.filter(s => s.active).map((svc) => (
                      <li key={svc.id}>
                        <Link 
                          href={`/services/${svc.slug}`}
                          className={svc.slug === service.slug ? 'active' : ''}
                        >
                          {svc.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Page Category List End */}

                {/* Sidebar Cta Box Start */}
                <div className="sidebar-cta-box wow fadeInUp" data-wow-delay="0.2s">


                  {/* Sidebar CTA Content Start */}
                  <div className="sidebar-cta-content">
                    {/* Icon Box Start */}
                    <div className="icon-box">
                      <Image src="/images/icon-hours.svg" alt="Opening Hours" width={48} height={48} />
                    </div>
                    {/* Icon Box End */}

                    <div className="cta-item-content">
                      <h3>Opening Hours</h3>
                      <p>Monday - Friday (8am to 5pm)</p>
                      <p>Sunday - Closed</p>
                    </div>
                  </div>
                  {/* Sidebar CTA Content End */}

                  {/* Sidebar CTA Contact Start */}
                  <div className="sidebar-cta-contact">
                    <a href="tel:01413841372">
                      <Image src="/images/icon-phone.svg" alt="Phone" width={24} height={24} />
                      0141 3841372
                    </a>
                    <a href="tel:07912295558" style={{ marginTop: '10px' }}>
                      <Image src="/images/icon-phone.svg" alt="Phone" width={24} height={24} />
                      07912295558
                    </a>
                  </div>
                  {/* Sidebar CTA Contact End */}
                </div>
                {/* Sidebar Cta Box End */}
              </div>
            </div>
            {/* Sidebar End */}

            {/* Main Content Start */}
            <div className="col-lg-8 order-1 order-lg-2">
              <div className="service-single-content">


                {/* Service Entry Start */}
                <div className="service-entry">
                  <h2 className="text-anime-style-2">
                    Trusted and Caring <span>{service.name} Services</span>
                  </h2>
                  <p className="wow fadeInUp">
                    {service.fullDescription}
                  </p>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">
                    {service.detailedDescription}
                  </p>

                  {/* What is Service Section Start */}
                  <div className="compassionate-box">
                    <h2 className="text-anime-style-2">What is <span>{service.name}?</span></h2>
                    <p className="wow fadeInUp">
                      {service.whatIs}
                    </p>
                  </div>
                  {/* What is Service Section End */}

                  {/* Typical Visit Box Start */}
                  <div className="compassionate-box">
                    <h2 className="text-anime-style-2">A Typical <span>{service.name} Visit</span></h2>
                    <p className="wow fadeInUp">
                      {service.typicalVisit}
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">
                      Here are some of the things our highly trained Care Experts are often asked to do:
                    </p>

                    {/* Care Services List Start */}
                    <div className="service-support-list wow fadeInUp" data-wow-delay="0.4s">
                      <ul>
                        {service.services.map((serviceItem, index) => (
                          <li key={index}>{serviceItem}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Care Services List End */}
                  </div>
                  {/* Typical Visit Box End */}

                  {/* Benefits Box Start */}
                  <div className="compassionate-box">
                    <h2 className="text-anime-style-2">The Benefits of <span>{service.name}</span></h2>
                    <p className="wow fadeInUp">
                      {service.benefits}
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">
                      {service.benefitsExtended}
                    </p>

                    <div className="compassionate-body-box">
                      <div className="compassionate-item-list">
                        {/* Approach Body Item 1 */}
                        <div className="approach-body-item wow fadeInUp" data-wow-delay="0.2s">
                          <div className="icon-box">
                            <Image src="/images/icon-approach-body-1.svg" alt="" width={56} height={56} />
                          </div>
                          <div className="approach-body-item-content">
                            <h3>Dedicated one-to-one support tailored to individual needs</h3>
                          </div>
                        </div>

                        {/* Approach Body Item 2 */}
                        <div className="approach-body-item wow fadeInUp" data-wow-delay="0.4s">
                          <div className="icon-box">
                            <Image src="/images/icon-approach-body-2.svg" alt="" width={56} height={56} />
                          </div>
                          <div className="approach-body-item-content">
                            <h3>Safe, familiar environment with personalized care routines</h3>
                          </div>
                        </div>
                      </div>

                      {/* Service Content Box */}
                      <div className="compassionate-content-box wow fadeInUp" data-wow-delay="0.6s">
                        <div className="icon-box">
                          <Image src={service.icon} alt="" width={56} height={56} />
                        </div>
                        <div className="compassionate-content">
                          <h3>Professional {service.name}</h3>
                          <p>{service.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Benefits Box End */}

                  {/* Service Support Box Start */}
                  <div className="service-support-box">
                    <h2 className="text-anime-style-2">Getting <span>Started</span></h2>
                    <p className="wow fadeInUp">
                      {service.gettingStarted}
                    </p>

                    <div className="service-support-body">
                      {/* Bullet list */}
                      <div className="service-support-list wow fadeInUp" data-wow-delay="0.2s">
                        <ul>
                          {service.gettingStartedPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Stats */}
                      <div className="service-support-item-list">
                        {service.stats.map((stat, index) => (
                          <div key={index} className="service-support-item">
                            <div className="icon-box">
                              <Image src={stat.icon} alt="" width={56} height={56} />
                            </div>
                            <div className="service-support-item-content">
                              <h3><span className="counter">{stat.number}</span>{stat.suffix}</h3>
                              <p>{stat.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>


                  </div>
                  {/* Service Support Box End */}
                </div>
                {/* Service Entry End */}
              </div>
            </div>
            {/* Main Content End */}
          </div>
        </div>
      </div>
      {/* Page Service Single End */}
    </div>
  );
}
