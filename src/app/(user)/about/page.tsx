import Link from 'next/link';
import Image from 'next/image';
import CTASection from '@/components/home/CTASection';
import HowItWorkSection from '@/components/home/HowItWorkSection';
import OurFactsSection from '@/components/home/OurFactsSection';
import OurFeatureSection from '@/components/home/OurFeatureSection';

export default function AboutPage() {
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
                  About <span>Us</span>
                </h1>
                <nav>
                  <ol className="breadcrumb">
                    {/* <li className="breadcrumb-item">
                      <Link href="/">home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      about
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

      {/* Our Team Section Start */}
      <div className="our-team">
        <div className="container">
          <div className="row section-row">
            <div className="col-lg-12">
              <div className="section-title section-title-center">
                <h3 className="wow fadeInUp">Expert team member</h3>
                <h2 className="text-anime-style-2" data-cursor="-opaque">Meet the compassionate hearts <span>behind our care</span></h2>
              </div>
            </div>
          </div>

          <div className="row">
            {[
              { img: '/images/team_members/nisha_soman_managing_director.jpg', name: 'Nisha Soman', role: 'Managing Director', delay: '0s' },
              { img: '/images/team_members/lancy_nalinakshan_deputy_manager.jpg', name: 'Lancy Nalinakshan', role: 'Deputy Manager', delay: '0.2s' },
              { img: '/images/team_members/teena_thomas_office_manager.jpg', name: 'Teena Thomas', role: 'Office Manager', delay: '0.4s' },
              { img: '/images/team_members/arun_suresh_care_coordinator.jpg', name: 'Arun Suresh', role: 'Care Coordinator', delay: '0.6s' },
              { img: '/images/team_members/bency_eldho_care_coordinator.jpg', name: 'Bency Eldho', role: 'Care Coordinator', delay: '0.8s' },
              { img: '/images/team_members/harikrishnan_madhukumar_care_coordinator.jpg', name: 'Harikrishnan Madhukumar', role: 'Care Coordinator', delay: '1.0s' },
            ].map((t, i) => (
              <div className="col-lg-4 col-md-6 mb-4" key={i}>
                <div className="team-item wow fadeInUp" data-wow-delay={t.delay}>
                  <div className="team-image">
                    {/* <Link href="/team-single" data-cursor-text="View"> */}
                    <figure>
                      <Image 
                        src={t.img} 
                        alt={t.name} 
                        width={400} 
                        height={460} 
                        style={{ width: '100%', height: '100%', aspectRatio: '1 / 1.153', objectFit: 'cover', objectPosition: 'top' }} 
                      />
                    </figure>
                    {/* </Link> */}
                    {/* <div className="team-social-icon">
                      <ul>
                        <li><a href="#"><i className="fa-brands fa-x-twitter"></i></a></li>
                        <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                        <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                        <li><a href="#"><i className="fa-brands fa-dribbble"></i></a></li>
                      </ul>
                    </div> */}
                  </div>
                  <div className="team-content">
                    <h3>{t.name}</h3>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Our Team Section End */}

      {/* Our Story & Values Section Start */}
      <div className="our-approach bg-section">
        <div className="container">
          <div className="row section-row">
            <div className="col-lg-12">
              <div className="section-title section-title-center">
                <h3 className="wow fadeInUp">Our story &amp; values</h3>
                <h2 className="text-anime-style-2" data-cursor="-opaque">
                  What guides our care <span>every day</span>
                </h2>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Value 1 */}
            <div className="col-lg-4 col-md-6">
              <div className="approach-body-item wow fadeInUp" data-wow-delay="0.2s">
                <div className="icon-box">
                  <Image src="/images/icon-approach-body-1.svg" alt="" width={60} height={60} />
                </div>
                <div className="approach-body-item-content">
                  <h3>1. Person‑centred</h3>
                  <p>Care starts with listening. We shape support around what matters most to each person, not the other way around.</p>
                </div>
              </div>
            </div>

            {/* Value 2 */}
            <div className="col-lg-4 col-md-6">
              <div className="approach-body-item wow fadeInUp" data-wow-delay="0.4s">
                <div className="icon-box">
                  <Image src="/images/icon-approach-body-2.svg" alt="" width={60} height={60} />
                </div>
                <div className="approach-body-item-content">
                  <h3>2. Professional excellence</h3>
                  <p>Our teams are trained, supervised and continually developed to deliver safe, consistent and compassionate care.</p>
                </div>
              </div>
            </div>

            {/* Value 3 */}
            <div className="col-lg-4 col-md-6">
              <div className="approach-body-item wow fadeInUp" data-wow-delay="0.6s">
                <div className="icon-box">
                  <Image src="/images/icon-feature-1.svg" alt="" width={60} height={60} />
                </div>
                <div className="approach-body-item-content">
                  <h3>3. Respect &amp; dignity</h3>
                  <p>We protect privacy, promote independence and always treat people with kindness and respect.</p>
                </div>
              </div>
            </div>

            {/* Value 4 */}
            <div className="col-lg-4 col-md-6">
              <div className="approach-body-item wow fadeInUp" data-wow-delay="0.8s">
                <div className="icon-box">
                  <Image src="/images/icon-feature-2.svg" alt="" width={60} height={60} />
                </div>
                <div className="approach-body-item-content">
                  <h3>4. Reliability</h3>
                  <p>Families count on us. We show up, communicate clearly and adapt when needs change.</p>
                </div>
              </div>
            </div>

            {/* Value 5 */}
            <div className="col-lg-4 col-md-6">
              <div className="approach-body-item wow fadeInUp" data-wow-delay="1.0s">
                <div className="icon-box">
                  <Image src="/images/icon-feature-3.svg" alt="" width={60} height={60} />
                </div>
                <div className="approach-body-item-content">
                  <h3>5. Whole‑person wellbeing</h3>
                  <p>Support spans daily living, social connection and confidence — not just tasks on a list.</p>
                </div>
              </div>
            </div>

            {/* Value 6 */}
            <div className="col-lg-4 col-md-6">
              <div className="approach-body-item wow fadeInUp" data-wow-delay="1.2s">
                <div className="icon-box">
                  <Image src="/images/icon-care-1.svg" alt="" width={60} height={60} />
                </div>
                <div className="approach-body-item-content">
                  <h3>6. Partnership with families</h3>
                  <p>We involve loved ones, keep you informed and make decisions together.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Our Story & Values Section End */}

      {/* About Us Section Start (images + intro) */}
      <div className="about-us">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              {/* About Us Images Start */}
              <div className="about-us-images">
                {/* About Us Image Start */}
                <div className="about-image-1">
                  <figure className="image-anime reveal">
                    <Image src="/images/about-us-image-1.jpg" alt="about 1" width={520} height={600} />
                  </figure>
                </div>
                {/* About Us Image End */}

                {/* About Us Image Start */}
                <div className="about-image-2">
                  <figure className="image-anime reveal">
                    <Image src="/images/about-us-image-2.jpg" alt="about 2" width={420} height={520} />
                  </figure>
                </div>
                {/* About Us Image End */}
              </div>
              {/* About Us Images End */}
            </div>

            <div className="col-lg-6">
              {/* About Us Content Start */}
              <div className="about-us-content">
                {/* Section Title Start */}
                <div className="section-title">
                  <h3 className="wow fadeInUp">About On Call</h3>
                  <h2 className="text-anime-style-2" data-cursor="-opaque">
                    Care at <span>home</span> with dignity and independence
                  </h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">
                    We&apos;re a team of care professionals dedicated to helping people live well at home. From everyday support to specialised assistance, we build relationships, earn trust, and tailor care around each person&apos;s goals and routine.
                  </p>
                </div>
                {/* Section Title End */}

                {/* About Us List Start */}
                <div className="about-us-list wow fadeInUp" data-wow-delay="0.4s">
                  <ul>
                    <li>Our mission: person‑centred care that respects choice</li>
                    <li>Vetted, trained and supported care professionals</li>
                    <li>Personalised plans shaped around daily life</li>
                    <li>Reliable, responsive support for families</li>
                  </ul>
                </div>
                {/* About Us List End */}
              </div>
              {/* About Us Content End */}
            </div>
          </div>
        </div>
      </div>
      {/* About Us Section End */}

      {/* How It Work Section */}
      <HowItWorkSection />

      {/* Our Facts Section */}
      {/* <OurFactsSection /> */}

      {/* Our Care Section Start */}
      <div className="our-care">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              {/* Care Images Start */}
              <div className="about-us-images">
                {/* About Us Image Start */}
                <div className="about-image-1">
                  <figure className="image-anime reveal">
                    <Image src="/images/about-us-image-1.jpg" alt="about 1" width={520} height={600} />
                  </figure>
                </div>
                {/* About Us Image End */}

                {/* About Us Image Start */}
                <div className="about-image-2">
                  <figure className="image-anime reveal">
                    <Image src="/images/about-us-image-2.jpg" alt="about 2" width={420} height={520} />
                  </figure>
                </div>
                {/* About Us Image End */}
              </div>
              {/* Care Images End */}
            </div>

            <div className="col-lg-6">
              <div className="our-care-content">
                <div className="section-title">
                  <h3 className="wow fadeInUp">Care at home</h3>
                  <h2 className="text-anime-style-2" data-cursor="-opaque">Comfort, confidence &amp; community <span>in familiar surroundings</span></h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">We deliver quality care where life happens — at home. From morning routines to meaningful moments, our support fits naturally into daily life.</p>
                </div>

                <div className="care-body-list">
                  <div className="care-body-item wow fadeInUp" data-wow-delay="0.4s">
                    <div className="care-body-header">
                      <div className="icon-box">
                        <Image src="/images/icon-care-1.svg" alt="" width={48} height={48} />
                      </div>
                      <div className="care-body-title">
                        <h3>Warm, consistent relationships</h3>
                      </div>
                    </div>
                    <div className="care-body-content">
                      <p>Familiar faces build trust and confidence — reducing loneliness and boosting wellbeing.</p>
                    </div>
                  </div>

                  <div className="care-body-item wow fadeInUp" data-wow-delay="0.6s">
                    <div className="care-body-header">
                      <div className="icon-box">
                        <Image src="/images/icon-care-2.svg" alt="" width={48} height={48} />
                      </div>
                      <div className="care-body-title">
                        <h3>Bringing people together</h3>
                      </div>
                    </div>
                    <div className="care-body-content">
                      <p>We encourage connection — with loved ones, communities and the activities that make life meaningful.</p>
                    </div>
                  </div>
                </div>

                {/* <div className="our-care-btn wow fadeInUp" data-wow-delay="0.8s">
                  <Link href="/contact" className="btn-default">Discover more</Link>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Our Care Section End */}

      {/* CTA Section */}
      <CTASection />

      {/* Family Trust Us Section Start */}
      <div className="family-trust-us">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 order-lg-2 order-2">
              <div className="family-trust-image">
                <figure className="image-anime reveal">
                  <Image src="/images/family-trust-image-1.jpg" alt="family 1" width={520} height={620} />
                </figure>
                <div className="contact-us-circle">
                  <Link href="/contact">
                    <Image src="/images/contact-us-circle.svg" alt="contact" width={110} height={110} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-8 order-lg-2 order-1">
              <div className="family-trust-content">
                <div className="section-title">
                  <h3 className="wow fadeInUp">Families trust us</h3>
                  <h2 className="text-anime-style-2" data-cursor="-opaque">Where compassion meets confidence <span>and family trust</span></h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">We believe that aging should be embraced with dignity right level of care. That&apos;s why we provide more assistance we offer welcoming environment.</p>
                </div>

                <div className="family-trust-list wow fadeInUp" data-wow-delay="0.4s">
                  <div className="family-trust-item">
                    <div className="icon-box">
                      <Image src="/images/icon-family-trust-1.svg" alt="" width={60} height={60} />
                    </div>
                    <div className="family-trust-item-title">
                      <h3>Compassionate &amp; Experienced</h3>
                    </div>
                  </div>
                  <div className="family-trust-item">
                    <div className="icon-box">
                      <Image src="/images/icon-family-trust-2.svg" alt="" width={60} height={60} />
                    </div>
                    <div className="family-trust-item-title">
                      <h3>Caring Hand Trusted Experience</h3>
                    </div>
                  </div>
                </div>

                <div className="family-trust-body">
                  <div className="family-trust-body-image">
                    <figure className="image-anime reveal">
                      <Image src="/images/family-trust-image-2.jpg" alt="family 2" width={520} height={320} />
                    </figure>
                  </div>
                  <div className="family-trust-body-content">
                    <div className="family-trust-body-item wow fadeInUp" data-wow-delay="0.6s">
                      <h3>Memory &amp; Dementia Care</h3>
                      <p>Nutritious, chef-prepared meals tailored to individual dietary needs. Nutritious, chef-prepared meals tailored.</p>
                    </div>
                    <div className="family-trust-body-item wow fadeInUp" data-wow-delay="0.8s">
                      <h3>Cognitive Health Services</h3>
                      <p>Nutritious, chef-prepared meals tailored to individual dietary needs. Nutritious, chef-prepared meals tailored.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Family Trust Us Section End */}


      {/* Our Testimonials Section */}
      {/* <div className="our-testimonials bg-section dark-section parallaxie">
        <OurTestimonialsSection />
      </div> */}

      {/* FAQs Section */}
      {/* <FAQSection /> */}
    </div>
  );
}
