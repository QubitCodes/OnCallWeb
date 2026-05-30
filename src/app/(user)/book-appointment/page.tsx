import Link from 'next/link';
import Image from 'next/image';
import HowItWorkSection from '@/components/home/HowItWorkSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import CTASection from '@/components/home/CTASection';
import FAQSection from '@/components/home/FAQSection';

export default function BookAppointment() {
  return (
    <>
      {/* Page Header Start */}
      <div className="page-header bg-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              {/* Page Header Box Start */}
              <div className="page-header-box">
                <h1 className="text-anime-style-2" data-cursor="-opaque">
                  Book <span>appointment</span>
                </h1>
                <nav className="wow fadeInUp">
                  <ol className="breadcrumb">
                    {/* <li className="breadcrumb-item">
                      <Link href="/">home</Link>
                    </li> */}
                  </ol>
                </nav>
              </div>
              {/* Page Header Box End */}
            </div>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Page Book appointment Start */}
      <div className="page-book-appointment">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              {/* Book Appointment Content Start */}
              <div className="book-appointment-content">
                {/* Section Title Start */}
                <div className="section-title">
                  <h3 className="wow fadeInUp">Book appointment</h3>
                  <h2 className="text-anime-style-2" data-cursor="-opaque">
                    Schedule compassionate <span>care with ease</span>
                  </h2>
                </div>
                {/* Section Title End */}

                {/* Contact Info Body Start */}
                <div className="appointment-info-body">
                  {/* Contact Info Item Start */}
                  <div className="contact-info-item wow fadeInUp" data-wow-delay="0.2s">
                    {/* Icon Box Start */}
                    <div className="icon-box">
                      <Image src="/images/icon-mail.svg" alt="" width={40} height={40} />
                    </div>
                    {/* Icon Box End */}

                    {/* Contact Item Content Start */}
                    <div className="contact-item-content">
                      <h3>Quick contact</h3>
                      <p>
                        <a href="tel:+001232548963">+00-123-2548-963</a>
                      </p>
                      <p>
                        <a href="mailto:info@domainname.com">info@domainname.com</a>
                      </p>
                    </div>
                    {/* Contact Item Content End */}
                  </div>
                  {/* Contact Info Item End */}

                  {/* Contact Info Item Start */}
                  <div className="contact-info-item wow fadeInUp" data-wow-delay="0.4s">
                    {/* Icon Box Start */}
                    <div className="icon-box">
                      <Image src="/images/icon-schedule.svg" alt="" width={40} height={40} />
                    </div>
                    {/* Icon Box End */}

                    {/* Contact Item Content Start */}
                    <div className="contact-item-content">
                      <h3>Schedule</h3>
                      <p>Mon - Fri 8:00 AM - 8:00 PM</p>
                      <p>Saturday - Sunday : Close</p>
                    </div>
                    {/* Contact Item Content End */}
                  </div>
                  {/* Contact Info Item End */}

                  {/* Contact Info Item Start */}
                  <div className="contact-info-item location-item wow fadeInUp" data-wow-delay="0.6s">
                    {/* Icon Box Start */}
                    <div className="icon-box">
                      <Image src="/images/icon-location.svg" alt="" width={40} height={40} />
                    </div>
                    {/* Icon Box End */}

                    {/* Contact Item Content Start */}
                    <div className="contact-item-content">
                      <h3>location</h3>
                      <p>
                        121 Moffat Street Glasgow G5 0ND
                      </p>
                    </div>
                    {/* Contact Item Content End */}
                  </div>
                  {/* Contact Info Item End */}
                </div>
                {/* Contact Info Body End */}
              </div>
              {/* Book Appointment Content End */}
            </div>

            <div className="col-lg-6">
              {/* Book Appointment Form Start */}
              <div className="contact-form wow fadeInUp" data-wow-delay="0.2s">
                <form id="appointmentForm" action="#" method="POST" data-toggle="validator">
                  <div className="row">
                    <div className="form-group col-md-6 mb-4">
                      <input type="text" name="fname" className="form-control" id="fname" placeholder="First Name" required />
                      <div className="help-block with-errors"></div>
                    </div>

                    <div className="form-group col-md-6 mb-4">
                      <input type="text" name="lname" className="form-control" id="lname" placeholder="Last Name" required />
                      <div className="help-block with-errors"></div>
                    </div>

                    <div className="form-group col-md-6 mb-4">
                      <input type="text" name="phone" className="form-control" id="phone" placeholder="Phone No." required />
                      <div className="help-block with-errors"></div>
                    </div>

                    <div className="form-group col-md-6 mb-4">
                      <input type="email" name="email" className="form-control" id="email" placeholder="E-mail" required />
                      <div className="help-block with-errors"></div>
                    </div>

                    <div className="form-group col-md-6 mb-4">
                      <select name="services" className="form-control form-select" id="services" defaultValue="" required>
                        <option value="" disabled>
                          Services
                        </option>
                        <option value="social_&_recreational_activities">Social & Recreational Activities</option>
                        <option value="memory_&_dementia_care">Memory & Dementia Care</option>
                        <option value="healthy_meals_&_nutrition_plans">Healthy Meals & Nutrition Plans</option>
                        <option value="24/7_skilled_nursing_care">24/7 Skilled Nursing Care</option>
                        <option value="assisted_living_support">Assisted Living Support</option>
                        <option value="respite_care_for_families">Respite Care for Families</option>
                      </select>
                      <div className="help-block with-errors"></div>
                    </div>

                    <div className="form-group col-md-6 mb-4">
                      <input type="date" name="date" className="form-control" id="date" required />
                      <div className="help-block with-errors"></div>
                    </div>

                    <div className="form-group col-md-12 mb-5">
                      <textarea name="message" className="form-control" id="message" rows={4} placeholder="Write Message..."></textarea>
                      <div className="help-block with-errors"></div>
                    </div>

                    <div className="col-md-12">
                      <button type="submit" className="btn-default">
                        <span>Submit Message</span>
                      </button>
                      <div id="msgSubmit" className="h3 hidden"></div>
                    </div>
                  </div>
                </form>
              </div>
              {/* Book Appointment Form End */}
            </div>
          </div>
        </div>
      </div>
      {/* Page Book appointment End */}

      {/* How It Work Section Start */}
      <HowItWorkSection />
      {/* How It Work Section End */}

      {/* Why Choose Us Section Start */}
      <WhyChooseSection />
      {/* Why Choose Us Section End */}

      {/* CTA Box Section Start */}
      <CTASection />
      {/* CTA Box Section End */}

      {/* Our FAQs Section Start */}
      <FAQSection />
      {/* Our FAQs Section End */}
    </>
  );
}
