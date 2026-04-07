'use client';

import Image from 'next/image';
import { useState } from 'react';
import axios from '@/lib/api';
import { API_URL } from '@/config/api';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitStatus('');

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('fname') as string;
    const lastName = formData.get('lname') as string;

    const contactData = {
      name: `${firstName} ${lastName}`.trim(),
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      serviceType: 'General Inquiry', // Default service type, can be customized
    };

    try {
      const response = await axios.post(`${API_URL}/contact`, contactData);

      if (response.status === 201 || response.status === 200) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        // Reset form
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      {/* Page Header Start */}
      <div className="page-header bg-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="page-header-box">
                <h1 className="text-anime-style-2" data-cursor="-opaque">Contact <span>us</span></h1>
                <nav className="wow fadeInUp">
                  <ol className="breadcrumb">
                    {/* <li className="breadcrumb-item">
          <Link href="/">home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Contact us
                    </li> */}
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Page Contact Us Start */}
      <div className="page-contact-us">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5">
              {/* Contact Us Content Start */}
              <div className="contact-us-content">
                {/* Section Title Start */}
                <div className="section-title">
                  <h3 className="wow fadeInUp">Reach out</h3>
                  <h2 className="text-anime-style-2" data-cursor="-opaque">Have questions? we&apos;re just <span>a message away</span></h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">
                    Fill out the form below and our team will get back to you shortly with the care and answers you need.
                  </p>
                </div>
                {/* Section Title End */}

                {/* Opening Hours Box Start */}
                <div className="opening-hours-box wow fadeInUp" data-wow-delay="0.4s">
                  <div className="opening-hours-header">
                    <div className="icon-box">
                      <Image src="/images/icon-clock.svg" alt="" width={40} height={40} />
                    </div>
                    <div className="opening-hour-title">
                      <h3>Opening hours</h3>
                    </div>
                  </div>
                  <div className="opening-hours-body">
                    <ul>
                      <li>
                        Monday - Friday <span>9:00 AM - 5:00 PM</span>
                      </li>
                      <li>
                        Saturday - Sunday <span>Closed</span>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Opening Hours Box End */}
              </div>
              {/* Contact Us Content End */}
            </div>

            <div className="col-lg-7">
              {/* Book Contact Form Start */}
              <div className="contact-form wow fadeInUp" data-wow-delay="0.2s">
                <form id="contactForm" onSubmit={handleSubmit} method="POST">
                  <div className="row">
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        name="fname"
                        className="form-control"
                        id="fname"
                        placeholder="First Name"
                        required
                        disabled={isSubmitting}
                      />
                      <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        name="lname"
                        className="form-control"
                        id="lname"
                        placeholder="Last Name"
                        required
                        disabled={isSubmitting}
                      />
                      <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        id="phone"
                        placeholder="Phone No."
                        required
                        disabled={isSubmitting}
                      />
                      <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group col-md-6 mb-4">
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        id="email"
                        placeholder="E-mail"
                        required
                        disabled={isSubmitting}
                      />
                      <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group col-md-12 mb-5">
                      <textarea
                        name="message"
                        className="form-control"
                        id="message"
                        rows={4}
                        placeholder="Write Message..."
                        disabled={isSubmitting}
                      ></textarea>
                      <div className="help-block with-errors"></div>
                    </div>
                    <div className="col-md-12">
                      <button type="submit" className="btn-default" disabled={isSubmitting}>
                        <span>{isSubmitting ? 'Sending...' : 'Submit Message'}</span>
                      </button>
                      {submitMessage && (
                        <div
                          id="msgSubmit"
                          className={`h5 mt-3 ${submitStatus === 'success' ? 'text-success' : 'text-danger'}`}
                        >
                          {submitMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              {/* Book Contact Form End */}
            </div>
          </div>
        </div>
      </div>
      {/* Page Contact Us End */}

      {/* Contact map Info Start */}
      <div className="contact-map-info">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-1 order-2">
              {/* Google Map IFrame Start */}
              <div className="google-map">
                <iframe
                  src="https://maps.google.com/maps?q=51.5074,-0.1278&z=12&output=embed"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              {/* Google Map IFrame End */}
            </div>

            <div className="col-lg-6 order-lg-2 order-1">
              {/* Contact Info Content Start */}
              <div className="contact-info-content">
                <div className="section-title">
                  <h3 className="wow fadeInUp">Contact us</h3>
                  <h2 className="text-anime-style-2" data-cursor="-opaque">We&apos;re here to listen <span>, help and support</span></h2>
                </div>

                <div className="contact-info-list">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 50, alignItems: 'flex-start' }}>
                    <div className="contact-info-item wow fadeInUp" data-wow-delay="0.4s" style={{ minWidth: 280 }}>
                      <div className="icon-box">
                        <Image src="/images/icon-service-1.svg" alt="" width={40} height={40} />
                      </div>
                      <div className="contact-item-content">
                        <h3>Homecare</h3>
                        <p style={{ marginBottom: '8px' }}>
                          <a href="mailto:homecare@oncallcareservice.co.uk">homecare@oncallcareservice.co.uk</a>
                        </p>
                        <p>
                          <a href="tel:01413841372">0141 3841372</a> / <a href="tel:07912295558">07912295558</a>
                        </p>
                      </div>
                    </div>

                    <div className="contact-info-item wow fadeInUp" data-wow-delay="0.6s" style={{ minWidth: 200 }}>
                      <div className="icon-box">
                        <Image src="/images/icon-user.svg" alt="" width={40} height={40} />
                      </div>
                      <div className="contact-item-content">
                        <h3>HR</h3>
                        <p style={{ marginBottom: '8px' }}>
                          <a href="mailto:hr@oncallcareservice.co.uk">hr@oncallcareservice.co.uk</a>
                        </p>
                        <p>
                          <a href="tel:07512316043">07512316043</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Contact Info Content End */}
            </div>
          </div>
        </div>
      </div>
      {/* Contact map Info End */}
    </>
  );
}
