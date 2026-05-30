'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, ContactFormValues } from '@/schemas/contact.schema';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import axios from 'axios';

export default function Contact() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState('');
	const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('');

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			fname: '',
			lname: '',
			phone: '',
			email: '',
			message: '',
		},
	});

	const onSubmit = async (data: ContactFormValues) => {
		setIsSubmitting(true);
		setSubmitMessage('');
		setSubmitStatus('');

		const contactData = {
			name: `${data.fname} ${data.lname || ''}`.trim(),
			phone: data.phone || null,
			email: data.email || null,
			message: data.message,
			serviceType: 'General Inquiry',
		};

		try {
			const response = await axios.post('/api/v1/contacts', contactData);

			if (response.status === 201 || response.status === 200) {
				setSubmitStatus('success');
				setSubmitMessage('Thank you for your message! We will get back to you soon.');
				reset();
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
                <form id='contactForm' onSubmit={handleSubmit(onSubmit)} method='POST'>
                  <div className='row'>
                    <div className='form-group col-md-6 mb-4'>
                      <input
                        type='text'
                        {...register('fname')}
                        className={`form-control ${errors.fname ? 'is-invalid border-danger' : ''}`}
                        id='fname'
                        placeholder='First Name'
                        disabled={isSubmitting}
                      />
                      {errors.fname && (
                        <div className='invalid-feedback d-block text-danger mt-1 text-sm font-medium'>
                          {errors.fname.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group col-md-6 mb-4'>
                      <input
                        type='text'
                        {...register('lname')}
                        className={`form-control ${errors.lname ? 'is-invalid border-danger' : ''}`}
                        id='lname'
                        placeholder='Last Name'
                        disabled={isSubmitting}
                      />
                      {errors.lname && (
                        <div className='invalid-feedback d-block text-danger mt-1 text-sm font-medium'>
                          {errors.lname.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group col-md-6 mb-4'>
                      <div className={`phone-input-wrapper ${errors.phone ? 'is-invalid' : ''}`}>
                        <Controller
                          name='phone'
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <PhoneInput
                              defaultCountry='gb'
                              preferredCountries={['gb', 'in', 'ie', 'fr', 'de', 'es', 'it']}
                              value={value}
                              onChange={onChange}
                              disabled={isSubmitting}
                            />
                          )}
                        />
                      </div>
                      {errors.phone && (
                        <div className='invalid-feedback d-block text-danger mt-1 text-sm font-medium'>
                          {errors.phone.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group col-md-6 mb-4'>
                      <input
                        type='email'
                        {...register('email')}
                        className={`form-control ${errors.email ? 'is-invalid border-danger' : ''}`}
                        id='email'
                        placeholder='E-mail'
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <div className='invalid-feedback d-block text-danger mt-1 text-sm font-medium'>
                          {errors.email.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group col-md-12 mb-5'>
                      <textarea
                        {...register('message')}
                        className={`form-control ${errors.message ? 'is-invalid border-danger' : ''}`}
                        id='message'
                        rows={4}
                        placeholder='Write Message...'
                        disabled={isSubmitting}
                      ></textarea>
                      {errors.message && (
                        <div className='invalid-feedback d-block text-danger mt-1 text-sm font-medium'>
                          {errors.message.message}
                        </div>
                      )}
                    </div>
                    <div className='col-md-12'>
                      <button type='submit' className='btn-default' disabled={isSubmitting}>
                        <span>{isSubmitting ? 'Sending...' : 'Submit Message'}</span>
                      </button>
                      {submitMessage && (
                        <div
                          id='msgSubmit'
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
