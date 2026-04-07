'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import axios from '@/lib/api';
import { Service } from '@/types/service';
import { API_URL } from '@/config/api';
import '@/styles/mobile-popup-menu.css';

interface SearchResults {
  postcode?: string;
  zipcode?: string;
  data?: Array<{
    id: string;
    name: string;
    description?: string;
    slug: string;
    image?: string;
  }>;
  services?: Array<{
    service: Service;
    location: {
      name: string;
      county?: string;
    };
    postcode: string;
  }>;
  nearby?: Array<{
    service: Service;
    location: {
      name: string;
      county?: string;
    };
    postcode: string;
  }>;
  length?: number;
}

/**
 * Header Component
 * 
 * Features:
 * - Dynamic service fetching from backend API (/all-services endpoint)
 * - Categorized mega menu for "Types of Care" (home-care vs specialist-care)
 * - Fallback services if API is unavailable
 * - Responsive design with mobile menu support
 * - Proper loading states and error handling
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isWhyUsDropdownOpen, setIsWhyUsDropdownOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement | null>(null);
  
  // Search functionality states
  const [zipcode, setZipcode] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Helpers
  const isDesktop = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 992px)').matches; // Bootstrap lg breakpoint
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsWhyUsDropdownOpen(false);
  }, [pathname]);

  // Sticky on scroll to match template header behavior
  useEffect(() => {
    const stickyEl = navRef.current;
    if (!stickyEl) return;
    const onScroll = () => {
      const shouldStick = window.scrollY > 10;
      stickyEl.classList.toggle('active', shouldStick);
      
      // Add additional styling for sticky header
      if (shouldStick) {
        stickyEl.style.position = 'fixed';
        stickyEl.style.width = '100%';
        stickyEl.style.zIndex = '1000';
        stickyEl.style.top = '0';
        stickyEl.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        stickyEl.style.backgroundColor = '#fff';
      } else {
        stickyEl.style.position = '';
        stickyEl.style.boxShadow = 'none';
        stickyEl.style.backgroundColor = '#fff';
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsMegaMenuOpen(false);
        setIsWhyUsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);
  
  // Add scrollable class to mega menu content when content exceeds container height
  useEffect(() => {
    if (!isMegaMenuOpen) return;
    
    const checkScrollable = () => {
      const megaMenuContent = document.querySelector('.mega-menu-content');
      if (!megaMenuContent) return;
      
      const isScrollable = megaMenuContent.scrollHeight > megaMenuContent.clientHeight;
      if (isScrollable) {
        megaMenuContent.classList.add('scrollable');
      } else {
        megaMenuContent.classList.remove('scrollable');
      }
    };
    
    // Check initially and on window resize
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, [isMegaMenuOpen]);

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        // Load data from local services.json instead of making an API call
        const servicesDataModule = await import('@/data/services.json');
        const servicesData = servicesDataModule.default || servicesDataModule || [];
        
        // Ensure we have valid service objects
        const validServices = Array.isArray(servicesData) ? servicesData.filter((service: Partial<Service>) => 
          service && service.id && service.name && service.slug
        ) : [];
        
        setServices(validServices as Service[]);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Use fallback services if API fails
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  const toggleMobileMenu = () => {
    // Toggle mobile menu and always collapse mega menu when opening
    setIsMenuOpen((open) => {
      const next = !open;
      if (next) {
        setIsMegaMenuOpen(false);
        setIsWhyUsDropdownOpen(false);
      }
      return next;
    });
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMenuOpen]);

  const handleMegaMenuClick = (e: React.MouseEvent) => {
    // Only prevent navigation when specifically clicking the dropdown icon
    // or when on mobile and interacting with the menu toggle
    if ((e.target as HTMLElement).closest('.dropdown-icon') || !isDesktop()) {
      e.preventDefault();
      
      // Close any other open dropdown
      if (!isMegaMenuOpen) {
        setIsWhyUsDropdownOpen(false);
      }
      
      setIsMegaMenuOpen((v) => !v);
    } else {
      // Follow the link; ensure hover state closes
      setIsMegaMenuOpen(false);
    }
  };

  // Keyboard support for toggle on mobile
  const handleMegaMenuKeyDown = (e: React.KeyboardEvent) => {
    // When pressing Enter or Space on the dropdown icon, toggle the menu
    if (e.key === 'Enter' || e.key === ' ') {
      // Check if the user is interacting with the dropdown icon
      if ((e.target as HTMLElement).closest('.dropdown-icon')) {
        e.preventDefault();
        
        // Close any other open dropdown
        if (!isMegaMenuOpen) {
          setIsWhyUsDropdownOpen(false);
        }
        
        setIsMegaMenuOpen((v) => !v);
      } else if (!isDesktop()) {
        // On mobile, if pressing Enter/Space on the link itself (not the dropdown icon)
        // Close the menu and allow navigation
        setIsMenuOpen(false);
      }
    }
  };

  const handleWhyUsDropdownClick = (e: React.MouseEvent) => {
    // On mobile, prevent navigation to allow expanding the dropdown
    if (!isDesktop()) {
      e.preventDefault();
      
      // Close any other open dropdown
      if (!isWhyUsDropdownOpen) {
        setIsMegaMenuOpen(false);
      }
      
      setIsWhyUsDropdownOpen((v) => !v);
    } else {
      // On desktop, follow the link; ensure hover state closes
      setIsWhyUsDropdownOpen(false);
    }
  };

  const handleWhyUsDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!isDesktop() && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      
      // Close any other open dropdown
      if (!isWhyUsDropdownOpen) {
        setIsMegaMenuOpen(false);
      }
      
      setIsWhyUsDropdownOpen((v) => !v);
    }
  };

  const isActiveLink = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  // Search handler
  const handleSearch = async () => {
    if (!zipcode.trim()) {
      setSearchError('Please enter a postcode');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);
    
    // Close mobile menu if open
    setIsMenuOpen(false);

    try {
      const response = await axios.post(`${API_URL}/check-availability`, {
        postcode: zipcode.trim().toUpperCase(),
        includeNearby: true
      });

      setSearchResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError('Unable to search services at this time. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const closeResults = () => {
    setShowResults(false);
    setSearchResults(null);
    setSearchError(null);
  };

  // Helper functions to categorize services
  const getHomeCareServices = () => {
    return services.filter(service => 
      service.active && (service.category === 'home-care' || !service.category)
    );
  };

  const getSpecialistCareServices = () => {
    return services.filter(service => 
      service.active && service.category === 'specialist-care'
    );
  };

  // Fallback services in case API is not available
  const fallbackHomeCareServices = [
    { id: 'fallback-1', name: 'Domiciliary Care', slug: 'domiciliary-care', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-2', name: 'Night Care', slug: 'night-care', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-3', name: 'Respite Care', slug: 'respite-care', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-4', name: 'Home Help and Housekeeping', slug: 'home-help-housekeeping', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-5', name: 'Companionship Care', slug: 'companionship-care', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-6', name: 'Daytime Care', slug: 'daytime-care', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-7', name: 'Live in Care', slug: 'live-in-care', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' },
    // { id: 'fallback-8', name: 'Health and Wellbeing Check', slug: 'health-wellbeing', category: 'home-care' as const, active: true, createdAt: '', updatedAt: '' }
  ];

  const fallbackSpecialistServices = [
    { id: 'fallback-s1', name: 'Dementia Care', slug: 'dementia-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-s2', name: 'Alzheimer\'s Care', slug: 'alzheimers-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-s3', name: 'Cancer Care', slug: 'cancer-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-s4', name: 'Parkinson\'s Care', slug: 'parkinsons-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-s5', name: 'Neurological Care', slug: 'neurological-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-s6', name: 'Palliative Care', slug: 'palliative-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-s7', name: 'Arthritis & Mobility Care', slug: 'arthritis-mobility-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' },
    { id: 'fallback-s8', name: 'Diabetes Care', slug: 'diabetes-care', category: 'specialist-care' as const, active: true, createdAt: '', updatedAt: '' }
  ];

  const displayHomeCareServices = services.length > 0 ? getHomeCareServices() : fallbackHomeCareServices;
  const displaySpecialistServices = services.length > 0 ? getSpecialistCareServices() : fallbackSpecialistServices;

  // Map service names to FontAwesome icons
  const getServiceIcon = (serviceName: string) => {
    const iconMap: { [key: string]: string } = {
      'domiciliary care': 'user-friends',
      'night care': 'moon',
      'respite care': 'clock',
      'home help': 'broom',
      'housekeeping': 'broom',
      'companionship': 'handshake',
      'companionship care': 'handshake',
      'daytime care': 'sun',
      'live in care': 'bed',
      'live-in care': 'bed',
      'health and wellbeing': 'heartbeat',
      'health wellbeing': 'heartbeat',
      'dementia care': 'head-side-virus',
      'cancer care': 'ribbon',
      'parkinsons care': 'hand-rock',
      'parkinson\'s care': 'hand-rock',
      'neurological care': 'brain',
      'palliative care': 'dove',
      'arthritis': 'bone',
      'mobility care': 'bone',
      'diabetes care': 'tint'
    };
    
    const lowerName = serviceName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    return 'heart'; // Default icon
  };

  return (
    <header className="main-header" style={{ backgroundColor: '#fff', width: '100%', maxWidth: '100%' }}>
      <div className="header-sticky" ref={navRef}>
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            {/* Logo Start - Left Side */}
            <Link className={`navbar-brand ${isMenuOpen ? 'd-none d-lg-block' : ''}`} href="/">
              <Image src="/images/logo.png" alt="On Call" width={150} height={50} priority />
            </Link>
            {/* Logo End */}

            {/* Main Menu Start - Desktop Only */}
            <div className="collapse navbar-collapse main-menu d-none d-lg-flex align-items-center justify-content-between">
              {/* Navigation links (left-aligned near the logo on desktop) */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginRight: 'auto', gap: '12px', alignItems: 'center' }}>
                <ul className="navbar-nav d-flex" id="menu" style={{ flexDirection: 'row', gap: '8px' }}>
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActiveLink('/') ? 'active' : ''}`} 
                      href="/"
                    >
                      Home
                    </Link>
                  </li>
                   <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActiveLink('/about') ? 'active' : ''}`} 
                      href="/about"
                    >
                      About Us
                    </Link>
                  </li>
                   <li
                    className={`nav-item submenu ${isWhyUsDropdownOpen ? 'show' : ''}`}
                    onMouseEnter={() => setIsWhyUsDropdownOpen(true)}
                    onMouseLeave={() => setIsWhyUsDropdownOpen(false)}
                  >
                    <Link 
                      className={`nav-link ${isActiveLink('/why-us') ? 'active' : ''}`} 
                      href="/why-us"
                      aria-haspopup="true"
                      aria-expanded={isWhyUsDropdownOpen}
                      role="button"
                    >
                      Why Oncall?
                      {/* <span className="dropdown-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span> */}
                    </Link>
                    {/* <ul style={{ display: isWhyUsDropdownOpen ? 'block' : 'none' }}>
                      <li className="nav-item">
                        <Link className="nav-link" href="/why-us#our-values">
                          <i className="fas fa-heart"></i> Our Values
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" href="/why-us#quality-care">
                          <i className="fas fa-certificate"></i> Quality Care
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" href="/why-us#experienced-team">
                          <i className="fas fa-users"></i> Experienced Team
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" href="/why-us#testimonials">
                          <i className="fas fa-comment-dots"></i> Testimonials
                        </Link>
                      </li>
                    </ul> */}
                  </li>
                  <li
                    className={`nav-item submenu mega-menu ${isMegaMenuOpen ? 'show' : ''}`}
                    onMouseEnter={() => setIsMegaMenuOpen(true)}
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                  >
                    <Link 
                      className={`nav-link ${isActiveLink('/services') ? 'active' : ''}`} 
                      href="/services"
                      onClick={(e) => {
                        // Only prevent default if the user is trying to open the mega menu
                        // Allow navigation when clicking the main part of the link
                        if (isDesktop() && (e.target as HTMLElement).closest('.dropdown-icon')) {
                          e.preventDefault();
                        }
                      }}
                      aria-haspopup="true"
                      aria-expanded={isMegaMenuOpen}
                      role="button"
                    >
                      Types Of Care
                      <span className="dropdown-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </Link>
                    <div
                      className="mega-menu-content"
                      style={{ display: isMegaMenuOpen ? 'block' : 'none' }}
                    >
                      <div className="mega-menu-columns">
                        <div className="mega-menu-column">
                          <h4 className="mega-menu-title">
                            <i className="fas fa-home"></i> Home Care
                          </h4>
                          {servicesLoading ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">
                                  <i className="fas fa-spinner fa-spin"></i> Loading services...
                                </span>
                              </li>
                            </ul>
                          ) : displayHomeCareServices.length === 0 ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">No services available</span>
                              </li>
                            </ul>
                          ) : (
                            <ul>
                              {displayHomeCareServices.slice(0, 8).map((service) => (
                                <li key={service.id} className="nav-item">
                                  <Link 
                                    className="nav-link" 
                                    href={`/services/${service.slug}`}
                                  >
                                    <i className={`fas fa-${getServiceIcon(service.name)}`}></i> {service.name}
                                  </Link>
                                </li>
                              ))}
                              <li className="nav-item explore-all-link">
                                <Link className="nav-link" href="/services">
                                  Explore all home care →
                                </Link>
                              </li>
                            </ul>
                          )}
                        </div>
                        <div className="mega-menu-column">
                          <h4 className="mega-menu-title">
                            <i className="fas fa-brain"></i> Specialist Care
                          </h4>
                          {servicesLoading ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">
                                  <i className="fas fa-spinner fa-spin"></i> Loading services...
                                </span>
                              </li>
                            </ul>
                          ) : displaySpecialistServices.length === 0 ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">No services available</span>
                              </li>
                            </ul>
                          ) : (
                            <ul>
                              {displaySpecialistServices.slice(0, 7).map((service) => (
                                <li key={service.id} className="nav-item">
                                  <Link className="nav-link" href={`/services/${service.slug}`}>
                                    <i className={`fas fa-${getServiceIcon(service.name)}`}></i> {service.name}
                                  </Link>
                                </li>
                              ))}
                              <li className="nav-item explore-all-link">
                                <Link className="nav-link" href="/services">
                                  Explore all specialized care →
                                </Link>
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                 
                 
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActiveLink('/contact') ? 'active' : ''}`} 
                      href="/contact"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Search and Contact Us on the right */}
              <div className="d-flex align-items-center">
                {/* Header Search Box - Desktop Only */}
                <div className="header-search-box d-flex align-items-center me-3" style={{ flex: '0 0 auto', maxWidth: '320px' }}>
                  <div className="search-input-wrapper" style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '25px',
                    padding: '6px 12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <input
                      type="text"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter postcode..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        backgroundColor: 'transparent',
                        color: '#333',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#46bdec',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSearching ? 'not-allowed' : 'pointer',
                        opacity: isSearching ? 0.7 : 1,
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '42px'
                      }}
                      aria-label="Search"
                    >
                      {isSearching ? (
                        <svg 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ animation: 'spin 1s linear infinite' }}
                        >
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                            strokeDasharray="32"
                            strokeDashoffset="8"
                            opacity="0.25"
                          />
                          <path 
                            d="M12 2a10 10 0 0 1 10 10" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle 
                            cx="11" 
                            cy="11" 
                            r="8" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          />
                          <path 
                            d="M21 21l-4.35-4.35" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {/* Header Search Box End */}

                {/* Header Btn Start */}
                {/* <div className="header-btn">
                  <Link href="/contact" className="btn-default">
                    Contact Us 
                  </Link>
                </div> */}
                <div className="header-btn" style={{marginLeft:"5px"}}>
                  <a href="https://www.homecare.co.uk/review-submit/65432243659" target="_blank" rel="noopener noreferrer" className="btn-default">
                    Rate Us
                  </a>
                </div>
                {/* Header Btn End */}
              </div>
            </div>
            {/* Main Menu End - Desktop */}
            
            {/* Mobile Menu Popup Overlay */}
            <div 
              className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}
              onClick={() => {
                setIsMenuOpen(false);
                setIsMegaMenuOpen(false);
                setIsWhyUsDropdownOpen(false);
              }}
            ></div>
            
            {/* Mobile Menu Popup Container */}
            <div className={`mobile-popup-menu ${isMenuOpen ? 'active' : ''}`}>
              {/* Mobile Popup Header */}
              <div className="mobile-popup-header">
                <Link className="navbar-brand m-0" href="/" onClick={() => { setIsMenuOpen(false); }}>
                  <Image src="/images/logo.png" alt="On Call" width={120} height={40} />
                </Link>
                <button
                  type="button"
                  className="mobile-close-btn"
                  aria-label="Close menu"
                  onClick={() => { setIsMenuOpen(false); }}
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M18 6L6 18M6 6L18 18" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Search Box */}
              <div className="mobile-search-wrapper">
                <div className="search-input-wrapper" style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '25px',
                  padding: '6px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <input
                    type="text"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter postcode..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '14px',
                      backgroundColor: 'transparent',
                      color: '#333',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#46bdec',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isSearching ? 'not-allowed' : 'pointer',
                      opacity: isSearching ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '48px'
                    }}
                    aria-label="Search"
                  >
                    {isSearching ? (
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ animation: 'spin 1s linear infinite' }}
                      >
                        <circle 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          strokeLinecap="round"
                          strokeDasharray="32"
                          strokeDashoffset="8"
                          opacity="0.25"
                        />
                        <path 
                          d="M12 2a10 10 0 0 1 10 10" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle 
                          cx="11" 
                          cy="11" 
                          r="8" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        />
                        <path 
                          d="M21 21l-4.35-4.35" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Nav Menu */}
              <div className="nav-menu-wrapper">
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActiveLink('/') ? 'active' : ''}`} 
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActiveLink('/about') ? 'active' : ''}`} 
                      href="/about"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                  </li>
                  <li
                    className={`nav-item submenu ${isWhyUsDropdownOpen ? 'show' : ''}`}
                  >
                    <Link 
                      className={`nav-link ${isActiveLink('/why-us') ? 'active' : ''}`} 
                      href="/why-us"
                      onClick={handleWhyUsDropdownClick}
                      onKeyDown={handleWhyUsDropdownKeyDown}
                      aria-haspopup="true"
                      aria-expanded={isWhyUsDropdownOpen}
                      role="button"
                    >
                      Why Oncall?
                      {/* <span className="dropdown-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span> */}
                    </Link>
                    {/* <ul style={{ display: isWhyUsDropdownOpen ? 'block' : 'none' }}>
                      <li className="nav-item">
                        <Link 
                          className="nav-link" 
                          href="/why-us#our-values"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="fas fa-heart"></i> Our Values
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link 
                          className="nav-link" 
                          href="/why-us#quality-care"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="fas fa-certificate"></i> Quality Care
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link 
                          className="nav-link" 
                          href="/why-us#experienced-team"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="fas fa-users"></i> Experienced Team
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link 
                          className="nav-link" 
                          href="/why-us#testimonials"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="fas fa-comment-dots"></i> Testimonials
                        </Link>
                      </li>
                    </ul> */}
                  </li>
                  <li
                    className={`nav-item submenu mega-menu ${isMegaMenuOpen ? 'show' : ''}`}
                    data-mobile-scrollable="true"
                  >
                    <Link 
                      className={`nav-link ${isActiveLink('/services') ? 'active' : ''}`} 
                      href="/services"
                      onClick={(e) => {
                        // If clicking on the dropdown icon, toggle the menu
                        // Otherwise allow navigation to services page
                        if ((e.target as HTMLElement).closest('.dropdown-icon')) {
                          handleMegaMenuClick(e);
                        } else if (!isDesktop()) {
                          // Close the menu and allow navigation
                          setIsMenuOpen(false);
                        }
                      }}
                      onKeyDown={handleMegaMenuKeyDown}
                      aria-haspopup="true"
                      aria-expanded={isMegaMenuOpen}
                      role="button"
                    >
                      Types Of Care
                      <span className="dropdown-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </Link>
                    <div
                      className="mega-menu-content"
                      hidden={!isMegaMenuOpen}
                      style={{ 
                        display: isMegaMenuOpen ? 'block' : 'none',
                        WebkitOverflowScrolling: 'touch' // Enable smooth scrolling on iOS
                      }}
                    >
                      <div className="mega-menu-columns">
                        {/* Home Care Section - Full Width */}
                        <div className="mega-menu-column">
                          <h4 className="mega-menu-title">
                            <i className="fas fa-home"></i> Home Care
                          </h4>
                          {servicesLoading ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">
                                  <i className="fas fa-spinner fa-spin"></i> Loading services...
                                </span>
                              </li>
                            </ul>
                          ) : displayHomeCareServices.length === 0 ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">No services available</span>
                              </li>
                            </ul>
                          ) : (
                            <ul>
                              {displayHomeCareServices.slice(0, 8).map((service) => (
                                <li key={service.id} className="nav-item">
                                  <Link 
                                    className="nav-link" 
                                    href={`/services/${service.slug}`}
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    <i className={`fas fa-${getServiceIcon(service.name)}`}></i> {service.name}
                                  </Link>
                                </li>
                              ))}
                              <li className="nav-item explore-all-link">
                                <Link 
                                  className="nav-link" 
                                  href="/services"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  Explore all home care →
                                </Link>
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Specialist Care Section - Full Width */}
                      <div className="mega-menu-columns">
                        <div className="mega-menu-column">
                          <h4 className="mega-menu-title">
                            <i className="fas fa-brain"></i> Specialist Care
                          </h4>
                          {servicesLoading ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">
                                  <i className="fas fa-spinner fa-spin"></i> Loading services...
                                </span>
                              </li>
                            </ul>
                          ) : displaySpecialistServices.length === 0 ? (
                            <ul>
                              <li className="nav-item">
                                <span className="nav-link">No services available</span>
                              </li>
                            </ul>
                          ) : (
                            <ul>
                              {displaySpecialistServices.slice(0, 7).map((service) => (
                                <li key={service.id} className="nav-item">
                                  <Link 
                                    className="nav-link" 
                                    href={`/services/${service.slug}`}
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    <i className={`fas fa-${getServiceIcon(service.name)}`}></i> {service.name}
                                  </Link>
                                </li>
                              ))}
                              <li className="nav-item explore-all-link">
                                <Link 
                                  className="nav-link" 
                                  href="/services"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  Explore all specialized care →
                                </Link>
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActiveLink('/contact') ? 'active' : ''}`} 
                      href="/contact"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                  </li>
                  {/* <li className="nav-item"> 
                    <Link 
                      className="nav-link" 
                      href="/contact"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact Us 
                    </Link>
                  </li> */}
                <ul className="navbar-nav mr-auto" id="mobile-menu">
                  
                </ul>
              </div>
              {/* Mobile footer button — placed outside the scrollable nav so it remains visible */}
              <div className="header-btn mobile-footer" style={{ padding: '12px 0' }}>
                <a
                  href="https://www.homecare.co.uk/review-submit/65432243659"
                  className="btn-default"
                  target='_blank'
                  onClick={() => setIsMenuOpen(false)}
                >
Rate Us                </a>
              </div>
            </div>
            {/* Mobile Popup Menu End */}

            {/* Mobile Menu Toggle */}
            <button
              className={`navbar-toggler ${isMenuOpen ? 'active' : ''}`}
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </nav>
        <div className="responsive-menu"></div>
      </div>

      {/* Search Results Modal/Overlay Start */}
      {showResults && searchResults && (
        <div 
          className="search-results-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            overflowY: 'auto'
          }}
          onClick={closeResults}
        >
          <div 
            className="search-results-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '20px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeResults}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#666',
                zIndex: 1,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            {/* Results Header */}
            <div style={{ marginBottom: '20px', paddingRight: '40px' }}>
              <h2 style={{ 
                fontSize: 'clamp(20px, 5vw, 28px)', 
                fontWeight: 'bold', 
                color: '#333', 
                marginBottom: '10px',
                wordBreak: 'break-word'
              }}>
                Available Services for {searchResults?.zipcode || searchResults?.postcode}
              </h2>
              <p style={{ color: '#666', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                {(searchResults?.data?.length || 0) + (searchResults?.services?.length || 0) + (searchResults?.nearby?.length || 0)} services found in your area
              </p>
            </div>

            {/* Direct Services */}
            {searchResults?.data && searchResults.data.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 4vw, 22px)', 
                  fontWeight: '600', 
                  color: '#333', 
                  marginBottom: '15px' 
                }}>
                  Direct Services in Your Area
                </h3>
                <div className="services-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: '15px' 
                }}>
                  {searchResults.data.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        border: '2px solid #46bdec',
                        borderRadius: '15px',
                        padding: '15px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                        {result?.image && (
                          <Image
                            src={result.image}
                            alt=""
                            width={50}
                            height={70}
                            style={{ borderRadius: '8px', flexShrink: 0 }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: '150px' }}>
                          <h4 style={{ 
                            fontSize: 'clamp(16px, 3vw, 18px)', 
                            fontWeight: '600', 
                            color: '#333', 
                            marginBottom: '8px',
                            wordBreak: 'break-word'
                          }}>
                            {result.name}
                          </h4>
                          {result?.description && (
                            <p style={{ 
                              color: '#666', 
                              fontSize: 'clamp(13px, 2.5vw, 14px)', 
                              marginBottom: '12px', 
                              lineHeight: '1.4' 
                            }}>
                              {result.description}
                            </p>
                          )}
                          <Link
                            href={`/services/${result.slug}`}
                            onClick={closeResults}
                            style={{
                              display: 'inline-block',
                              marginTop: '12px',
                              padding: '8px 16px',
                              backgroundColor: '#46bdec',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: 'clamp(13px, 2.5vw, 14px)',
                              fontWeight: '500'
                            }}
                          >
                            Learn More
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services from main API format */}
            {searchResults?.services && searchResults.services.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 4vw, 22px)', 
                  fontWeight: '600', 
                  color: '#333', 
                  marginBottom: '15px' 
                }}>
                  Services in Your Area
                </h3>
                <div className="services-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: '15px' 
                }}>
                  {searchResults.services.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        border: '2px solid #46bdec',
                        borderRadius: '15px',
                        padding: '20px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        {result.service.icon && (
                          <Image
                            src={result.service.icon}
                            alt=""
                            width={50}
                            height={50}
                            style={{ borderRadius: '8px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                            {result.service.name}
                          </h4>
                          {result.service.description && (
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                              {result.service.description}
                            </p>
                          )}
                          <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                            <div><strong>Location:</strong> {result.location.name}</div>
                            {result.location.county && (
                              <div><strong>County:</strong> {result.location.county}</div>
                            )}
                          </div>
                          <Link
                            href={`/services/${result.service.slug}`}
                            onClick={closeResults}
                            style={{
                              display: 'inline-block',
                              marginTop: '12px',
                              padding: '8px 16px',
                              backgroundColor: '#46bdec',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Learn More
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Services */}
            {searchResults.nearby && searchResults.nearby.length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 4vw, 22px)', 
                  fontWeight: '600', 
                  color: '#333', 
                  marginBottom: '15px' 
                }}>
                  Nearby Services
                </h3>
                <div className="services-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: '15px' 
                }}>
                  {searchResults.nearby.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '15px',
                        padding: '20px',
                        backgroundColor: '#f8f9fa'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        {result.service.icon && (
                          <Image 
                            src={result.service.icon} 
                            alt="" 
                            width={50} 
                            height={50}
                            style={{ borderRadius: '8px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                            {result.service.name}
                          </h4>
                          {result.service.description && (
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                              {result.service.description}
                            </p>
                          )}
                          <div style={{ fontSize: '13px', color: '#888' }}>
                            <div><strong>Area:</strong> {result.location.name}</div>
                            {result.location.county && (
                              <div><strong>County:</strong> {result.location.county}</div>
                            )}
                            <div><strong>Postcode:</strong> {result.postcode}</div>
                          </div>
                          <Link 
                            href={`/services/${result.service.slug}`}
                            onClick={closeResults}
                            style={{
                              display: 'inline-block',
                              marginTop: '12px',
                              padding: '8px 16px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Learn More
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Services Found */}
            {(!searchResults?.data || searchResults.data.length === 0) && 
             (!searchResults?.services || searchResults.services.length === 0) && 
             (!searchResults?.nearby || searchResults.nearby.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
                  No services available
                </h3>
                <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
                  No services are currently available for postcode {searchResults?.zipcode || searchResults?.postcode}.
                </p>
                <Link 
                  href="/contact"
                  onClick={closeResults}
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#46bdec',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Contact Us
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Search Results Modal/Overlay End */}

      {/* Search Error Toast */}
      {searchError && (
        <div 
          style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            zIndex: 100000,
            backgroundColor: '#fff',
            border: '2px solid #dc3545',
            borderRadius: '10px',
            padding: '15px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ color: '#dc3545', fontWeight: '500' }}>{searchError}</span>
            <button
              onClick={() => setSearchError(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                padding: '0 5px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
