import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HowItWorkSection = () => {
  const workSteps = [
    {
      id: 1,
      icon: '/images/icon-work-step-1.svg',
      number: '01',
      title: 'Free Consultation & Assessment',
      description: 'We carefully match you with a caregiver or nurse who fits',
      delay: '0s',
      active: false
    },
    {
      id: 2,
      icon: '/images/icon-work-step-2.svg',
      number: '02',
      title: 'Caregiver Matching & Introduction',
      description: 'We carefully match you with a caregiver or nurse who fits',
      delay: '0.2s',
      active: false
    },
    {
      id: 3,
      icon: '/images/icon-work-step-3.svg',
      number: '03',
      title: 'Ongoing Support & Adjustments',
      description: 'We carefully match you with a caregiver or nurse who fits',
      delay: '0.4s',
      active: false
    },
    {
      id: 4,
      icon: '/images/icon-work-step-4.svg',
      number: '04',
      title: 'Free Consultation & Assessment',
      description: 'We carefully match you with a caregiver or nurse who fits',
      delay: '0.6s',
      active: false
    }
  ];

  return (
    <div className="how-it-work bg-section dark-section parallaxie">
      <div className="container">
        <div className="row section-row">
          <div className="col-lg-12">
            {/* Section Title Start */}
            <div className="section-title section-title-center">
              <h3 className="wow fadeInUp">How it work</h3>
              <h2 className="text-anime-style-2" data-cursor="-opaque">
                Your trusted partner in home <span>health and wellness</span>
              </h2>
            </div>
            {/* Section Title End */}
          </div>
        </div>

        <div className="row work-steps-list">
          {workSteps.map((step) => (
            <div key={step.id} className="col-lg-3 col-md-6">
              {/* How Steps Item Start */}
              <div className={`work-steps-item ${step.active ? 'active' : ''} wow fadeInUp`} data-wow-delay={step.delay}>
                <div className="icon-box">
                  <Image src={step.icon} alt="" width={60} height={60} />
                </div>
                <div className="work-step-no">
                  <h3>{step.number}</h3>
                </div>
                <div className="work-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="work-step-btn">
                  <a href="#" className="readmore-btn">learn more</a>
                </div>
              </div>
              {/* How Steps Item End */}
            </div>
          ))}

          <div className="col-lg-12">
            {/* Section Footer Text Start*/}
            <div className="section-footer-text wow fadeInUp" data-wow-delay="0.8s">
              <p>
                Compassionate care to enhance daily living. <Link href="/contact">Contact us today!</Link>
              </p>
            </div>
            {/* Section Footer Text End*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorkSection;
