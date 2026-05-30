'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from '@/lib/api';
import { API_URL } from '@/config/api';

interface Service {
  id: string;
  name: string;
  description?: string;
  slug: string;
  category: 'home-care' | 'specialist-care';
  icon?: string;
}

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

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

	const suggestionsRef = useRef<HTMLDivElement>(null);
	const modalSuggestionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const clickOutside = (e: MouseEvent) => {
			const isInsideMain = suggestionsRef.current && suggestionsRef.current.contains(e.target as Node);
			const isInsideModal = modalSuggestionsRef.current && modalSuggestionsRef.current.contains(e.target as Node);
			if (!isInsideMain && !isInsideModal) {
				setSuggestions([]);
			}
		};
		document.addEventListener('mousedown', clickOutside);
		return () => document.removeEventListener('mousedown', clickOutside);
	}, []);

  useEffect(() => {
    if (showResults) {
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    } else {
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
    }
    return () => {
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
    };
  }, [showResults]);

  useEffect(() => {
    if (selectedLocation) return;
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        let data: any[] = [];
        const postcodeMatch = query.match(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i);

        if (postcodeMatch) {
          const cleanQuery = query.replace(/\s+/g, '');
          const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanQuery)}`);
          const pcData = await pcRes.json();

          if (pcData.status === 200 && pcData.result) {
            data.push({
              place_id: `pc_${pcData.result.postcode}`,
              lat: pcData.result.latitude.toString(),
              lon: pcData.result.longitude.toString(),
              display_name: `${pcData.result.postcode}, ${pcData.result.admin_district || ''}, UK`
            });
          } else if (pcData.status === 404 && pcData.terminated) {
            data.push({
              place_id: `pc_${pcData.terminated.postcode}`,
              lat: pcData.terminated.latitude.toString(),
              lon: pcData.terminated.longitude.toString(),
              display_name: `${pcData.terminated.postcode} (Terminated Postcode), UK`
            });
          }
        }

				if (data.length === 0) {
					const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&countrycodes=gb`);
					const results = await response.json();
					data = (results || [])
						.filter((r: any) => r.display_name.toLowerCase().includes('united kingdom') || r.display_name.toLowerCase().includes(', uk'))
						.slice(0, 5);
				}

        setSuggestions(data || []);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedLocation]);

  const triggerAvailabilitySearch = async (lat: string | number, lon: string | number, name: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const response = await fetch(`/api/v1/services/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: parseFloat(lat.toString()),
          lng: parseFloat(lon.toString())
        })
      });

      const resData = await response.json();

      if (response.ok && resData && resData.status) {
        setSearchResults({
          postcode: name,
          data: resData.data.map((srv: any) => ({
            id: srv.id,
            name: srv.name,
            description: srv.description,
            slug: srv.slug,
            image: srv.image || '/images/icon-care-1.svg'
          })),
          nearby: []
        });
        setShowResults(true);
      } else {
        // Fallback: Open popup showing "We haven't started here yet"
        setSearchResults({
          postcode: name,
          data: [],
          nearby: []
        });
        setShowResults(true);
      }
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback: Open popup showing "We haven't started here yet"
      setSearchResults({
        postcode: name,
        data: [],
        nearby: []
      });
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setSelectedLocation(suggestion);
    setSearchQuery(suggestion.display_name.split(',')[0]);
    setSuggestions([]);
    triggerAvailabilitySearch(suggestion.lat, suggestion.lon, suggestion.display_name);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a location');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      if (selectedLocation && searchQuery.trim() === selectedLocation.display_name.split(',')[0]) {
        await triggerAvailabilitySearch(selectedLocation.lat, selectedLocation.lon, selectedLocation.display_name);
        return;
      }

      let data: any[] = [];
      const postcodeMatch = searchQuery.trim().match(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i);

      if (postcodeMatch) {
        const cleanQuery = searchQuery.trim().replace(/\s+/g, '');
        const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanQuery)}`);
        const pcData = await pcRes.json();

        if (pcData.status === 200 && pcData.result) {
          data.push({
            lat: pcData.result.latitude,
            lon: pcData.result.longitude,
            display_name: `${pcData.result.postcode}, UK`
          });
        }
      }

			if (data.length === 0) {
				const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=gb`);
				const results = await response.json();
				data = (results || [])
					.filter((r: any) => r.display_name.toLowerCase().includes('united kingdom') || r.display_name.toLowerCase().includes(', uk'))
					.slice(0, 1);
			}

      if (data && data.length > 0) {
        const match = data[0];
        setSelectedLocation(match);
        await triggerAvailabilitySearch(match.lat, match.lon, match.display_name);
      } else {
        // Fallback: Open popup showing "We haven't started here yet"
        setSearchResults({
          postcode: searchQuery.trim(),
          data: [],
          nearby: []
        });
        setShowResults(true);
      }
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback: Open popup showing "We haven't started here yet"
      setSearchResults({
        postcode: searchQuery.trim(),
        data: [],
        nearby: []
      });
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Detect small screens to switch to stacked (vertical) layout for the search box
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = () => window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    const update = () => setIsMobile(mq());

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // computed styles to switch layout on small screens
  const searchBoxInnerStyle: React.CSSProperties = isMobile
    ? {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '0',
      backgroundColor: 'transparent',
      borderRadius: '0',
      backdropFilter: 'none',
      border: 'none'
    }
    : {
      display: 'flex',
      gap: '10px',
      padding: '0',
      backgroundColor: 'transparent',
      borderRadius: '0',
      backdropFilter: 'none',
      border: 'none'
    };

  const inputStyle: React.CSSProperties = isMobile
    ? {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '10px',
      fontSize: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: '#333',
      outline: 'none'
    }
    : {
      flex: 1,
      padding: '12px 16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '10px',
      fontSize: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: '#333',
      outline: 'none'
    };

  const buttonStyle: React.CSSProperties = isMobile
    ? {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#46bdec',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: isSearching ? 'not-allowed' : 'pointer',
      opacity: isSearching ? 0.7 : 1,
      transition: 'all 0.3s ease'
    }
    : {
      padding: '12px 24px',
      backgroundColor: '#46bdec',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: isSearching ? 'not-allowed' : 'pointer',
      opacity: isSearching ? 0.7 : 1,
      transition: 'all 0.3s ease'
    };

  const closeResults = () => {
    setShowResults(false);
    setSearchResults(null);
    setSearchError(null);
  };
  return (
    <div className="hero bg-section dark-section" style={{ position: 'relative', zIndex: 50 }}>
      <div className="container-fluid">
        <div className="row no-gutters">
          <div className="col-lg-12">
            {/* Hero Section Start */}
            <div className="hero-section">
              {/* Hero Content Start */}
              <div className="hero-content">
                {/* Hero Content Box Start */}
                <div className="hero-content-box" style={{ position: 'relative', zIndex: 10 }}>
                  {/* Section Title Start */}
                  <div className="section-title">
                    {/* <h3 className="wow fadeInUp">Discover the power of premium</h3> */}
                    <h1 className="text-anime-style-2" data-cursor="-opaque">
                      Oncall
                      <br />
                      <span style={{ display: "block", color: "white", fontSize: '28px', fontWeight: "500", marginTop: "6px" }}>We care for you</span>
                      <span style={{ display: "block", color: "white", fontSize: "22px", fontWeight: "400", marginTop: "10px" }}>Home Care And Housing Support Service</span>
                    </h1>
                    <h5 className="text-anime-style-2"></h5>
                  </div>
                  {/* Section Title End */}

                  {/* Hero Content Circle Start */}
                  <div className="hero-content-circle">
                    <p className="wow fadeInUp" data-wow-delay="0.2s">
                      Delivering compassionate, memorable care in the comfort of your own home — because your home is your life.
                    </p>

                    {/* Search Box Start */}
                    <div className="search-box-container wow fadeInUp" data-wow-delay="0.3s" style={{ marginBottom: '20px' }}>
                      <div className="search-box" style={searchBoxInnerStyle} ref={suggestionsRef}>
                        <div style={{ position: 'relative', flex: isMobile ? 'none' : 1, width: isMobile ? '100%' : 'auto' }}>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setSelectedLocation(null);
                              setSearchError(null);
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter city or town..."
                            style={{ ...inputStyle, width: '100%' }}
                          />
                          {suggestions.length > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: '5px',
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }}
                            >
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition: 'background 0.2s',
                                    color: '#333'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <div style={{ fontWeight: '500', fontSize: '14px' }}>{suggestion.display_name.split(',')[0]}</div>
                                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px', lineHeight: '1.4' }}>{suggestion.display_name}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={handleSearch} disabled={isSearching} style={buttonStyle}>
                          {isSearching ? 'Searching...' : 'Search Services'}
                        </button>
                      </div>

                      {/* Search Error */}
                      {searchError && (
                        <div style={{
                          marginTop: '10px',
                          padding: '10px',
                          backgroundColor: 'rgba(255, 0, 0, 0.1)',
                          border: '1px solid rgba(255, 0, 0, 0.3)',
                          borderRadius: '8px',
                          color: '#d63384'
                        }}>
                          {searchError}
                        </div>
                      )}
                    </div>
                    {/* Search Box End */}

                    <Link href="/book-appointment" className="book-appointment-circle">
                      <Image src="/images/book-appointment-circle.svg" alt="Book Appointment" width={120} height={120} />
                    </Link>
                  </div>
                  {/* Hero Content Circle End */}
                </div>
                {/* Hero Content Box End */}

                {/* Working Hours Box Start */}
                <div className="working-hours-box">
                  {/* Working Hour Image Start */}
                  <div className="working-hour-image">
                    <figure className="image-anime">
                      <Image src="/images/hero2.png" alt="Hero Content" width={400} height={300} />
                    </figure>
                  </div>
                  {/* Working Hour Image End */}

                  {/* Working Hours Item Start */}
                  <div className="working-hour-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 'calc(45% - 15px)' }}>

                    {/* Rating Section */}
                    <div
                      className="wow fadeInUp"
                      data-wow-delay="0.4s"
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '25px',
                        color: '#333',
                        border: '2px solid #e0e0e0',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {/* homecare.co.uk logo and branding */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <Image
                            src="https://www.homecare.co.uk/assets/images/theme/logo.svg"
                            alt="homecare.co.uk"
                            width={220}
                            height={40}
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#888',
                          fontWeight: '400'
                        }}>
                          the leading home care review website <br />
                        </p>
                      </div>

                      {/* <hr style={{ 
                      border: 'none', 
                      borderTop: '1px solid #e0e0e0', 
                      margin: '5px 0' 
                    }} /> */}

                      {/* Review section */}
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          color: '#333'
                        }}>
                          Review Oncall Care Service Ltd
                        </h3>
                      </div>

                      {/* Write a Review button */}
                      <a
                        href="https://www.homecare.co.uk/review-submit/65432243659"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#46bdec',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(125, 211, 192, 0.3)',
                          textDecoration: 'none'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#46bdec';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#46bdec';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Write a Review
                      </a>
                    </div>

                    {/* Working Hours Section */}
                    <div
                      className="wow fadeInUp"
                      data-wow-delay="0.6s"
                      style={{
                        backgroundColor: '#46bdec',
                        borderRadius: '15px',
                        padding: '25px',
                        color: 'white'
                      }}
                    >
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        color: 'white'
                      }}>
                        Working Hours
                      </h3>
                      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Monday - Friday</span>
                          <span>9:00 AM - 5:00 PM</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Saturday - Sunday</span>
                          <span>Closed</span>
                        </div>
                      </div>
                    </div>

                  </div>
                  {/* Working Hours Item End */}
                </div>
                {/* Working Hours Box End */}
              </div>

              {/* Hero Image Start */}
              <div className="hero-image">
                <figure className="image-anime">
                  <Image src="/images/hero1.png" alt="Hero" width={600} height={700} priority />
                </figure>
              </div>
              {/* Hero Image End */}
            </div>
            {/* Hero Section End */}

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
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
                onClick={closeResults}
              >
				<div
					className="search-results-modal"
					style={{
						backgroundColor: 'white',
						borderRadius: '20px',
						maxWidth: '800px',
						width: '100%',
						maxHeight: '85vh',
						display: 'flex',
						flexDirection: 'column',
						position: 'relative',
						overflow: 'hidden',
						boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Top Accent Gradient Bar */}
					<div style={{ height: '4px', background: 'linear-gradient(90deg, #46bdec, #00d2ff)', width: '100%', flexShrink: 0 }} />

					{/* STICKY HEADER AREA */}
					<div style={{
						padding: '25px 30px',
						borderBottom: '1px solid #e5e7eb',
						backgroundColor: '#fff',
						zIndex: 10,
						flexShrink: 0,
						display: 'flex',
						flexDirection: 'column',
						gap: '15px'
					}}>
						{/* Top Row: Title & Close Button */}
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<div>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
									<span style={{ fontSize: '11px', fontWeight: 'bold', color: '#46bdec', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
										📍 Service Coverage Check
									</span>
								</div>
								<h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '4px 0 8px 0', fontFamily: 'Satoshi, Inter, sans-serif' }}>
									Available Services
								</h2>
								{((searchResults?.data?.length || 0) + (searchResults?.nearby?.length || 0)) > 0 && (
									<div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
										<p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
											{(searchResults?.data?.length || 0) + (searchResults?.nearby?.length || 0)} care services found near
										</p>
										<span style={{
											display: 'inline-flex',
											alignItems: 'center',
											padding: '2px 10px',
											borderRadius: '9999px',
											backgroundColor: '#e0f2fe',
											color: '#0369a1',
											fontSize: '13px',
											fontWeight: '600',
											border: '1px solid #bae6fd'
										}}>
											{searchResults?.postcode}
										</span>
									</div>
								)}
							</div>
							<button
								onClick={closeResults}
								style={{
									background: '#f3f4f6',
									border: 'none',
									fontSize: '18px',
									cursor: 'pointer',
									color: '#4b5563',
									width: '36px',
									height: '36px',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transition: 'all 0.2s ease',
									flexShrink: 0
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = '#e5e7eb';
									e.currentTarget.style.color = '#111827';
									e.currentTarget.style.transform = 'scale(1.05) rotate(90deg)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = '#f3f4f6';
									e.currentTarget.style.color = '#4b5563';
									e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
								}}
							>
								✕
							</button>
						</div>

						{/* Inline Search Bar */}
						<div ref={modalSuggestionsRef} style={{ display: 'flex', gap: '10px', position: 'relative', width: '100%', marginTop: '5px' }}>
							<div style={{ flex: 1, position: 'relative' }}>
								{/* Search Icon inside Input */}
								<div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<circle cx="11" cy="11" r="8"></circle>
										<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
									</svg>
								</div>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setSelectedLocation(null);
										setSearchError(null);
									}}
									onKeyPress={handleKeyPress}
									placeholder="Change search location..."
									style={{
										width: '100%',
										padding: '12px 16px 12px 42px',
										border: '1px solid #e5e7eb',
										borderRadius: '12px',
										fontSize: '15px',
										fontWeight: '500',
										outline: 'none',
										color: '#111827',
										backgroundColor: '#f9fafb',
										transition: 'all 0.2s ease',
										boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
									}}
									onFocus={(e) => {
										e.currentTarget.style.borderColor = '#46bdec';
										e.currentTarget.style.backgroundColor = '#fff';
										e.currentTarget.style.boxShadow = '0 0 0 3px rgba(70, 189, 236, 0.15), inset 0 1px 2px rgba(0,0,0,0.05)';
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = '#e5e7eb';
										e.currentTarget.style.backgroundColor = '#f9fafb';
										e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
									}}
								/>
								{suggestions.length > 0 && (
									<div
										style={{
											position: 'absolute',
											top: '100%',
											left: 0,
											right: 0,
											marginTop: '8px',
											backgroundColor: 'white',
											border: '1px solid #e5e7eb',
											borderRadius: '12px',
											boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
											zIndex: 10000,
											maxHeight: '220px',
											overflowY: 'auto',
											padding: '6px'
										}}
									>
										{suggestions.map((suggestion, idx) => (
											<button
												key={idx}
												type="button"
												onClick={() => handleSelectSuggestion(suggestion)}
												style={{
													width: '100%',
													textAlign: 'left',
													padding: '10px 12px',
													backgroundColor: 'transparent',
													border: 'none',
													borderRadius: '8px',
													cursor: 'pointer',
													outline: 'none',
													transition: 'all 0.15s ease',
													color: '#1f2937',
													display: 'flex',
													alignItems: 'flex-start',
													gap: '10px',
													marginBottom: idx === suggestions.length - 1 ? 0 : '2px'
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor = '#f0f9ff';
													e.currentTarget.style.color = '#0284c7';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = 'transparent';
													e.currentTarget.style.color = '#1f2937';
												}}
											>
												<span style={{ fontSize: '16px', marginTop: '2px', flexShrink: 0 }}>📍</span>
												<div style={{ flex: 1, minWidth: 0 }}>
													<div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
														{suggestion.display_name.split(',')[0]}
													</div>
													<div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
														{suggestion.display_name}
													</div>
												</div>
											</button>
										))}
									</div>
								)}
							</div>
							<button
								onClick={handleSearch}
								disabled={isSearching}
								style={{
									padding: '12px 24px',
									backgroundColor: '#46bdec',
									color: 'white',
									border: 'none',
									borderRadius: '12px',
									fontSize: '15px',
									fontWeight: '600',
									cursor: isSearching ? 'not-allowed' : 'pointer',
									opacity: isSearching ? 0.7 : 1,
									whiteSpace: 'nowrap',
									boxShadow: '0 4px 6px -1px rgba(70, 189, 236, 0.2), 0 2px 4px -1px rgba(70, 189, 236, 0.1)',
									transition: 'all 0.2s ease',
									display: 'flex',
									alignItems: 'center',
									gap: '6px'
								}}
								onMouseEnter={(e) => {
									if (!isSearching) {
										e.currentTarget.style.backgroundColor = '#37aedc';
										e.currentTarget.style.transform = 'translateY(-1px)';
										e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(70, 189, 236, 0.3), 0 4px 6px -1px rgba(70, 189, 236, 0.15)';
									}
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = '#46bdec';
									e.currentTarget.style.transform = 'translateY(0)';
									e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(70, 189, 236, 0.2), 0 2px 4px -1px rgba(70, 189, 236, 0.1)';
								}}
							>
								{isSearching ? (
									<>
										<span style={{
											display: 'inline-block',
											width: '14px',
											height: '14px',
											border: '2px solid rgba(255,255,255,0.3)',
											borderTopColor: '#fff',
											borderRadius: '50%',
											animation: 'spin 1s linear infinite'
										}} />
										<style jsx>{`
											@keyframes spin {
												to { transform: rotate(360deg); }
											}
										`}</style>
										<span>Checking...</span>
									</>
								) : 'Check Area'}
							</button>
						</div>

						{/* Search Error inside modal */}
						{searchError && (
							<div style={{ color: '#d63384', fontSize: '14px', marginTop: '-5px' }}>
								{searchError}
							</div>
						)}
					</div>

                  {/* SCROLLABLE CONTENT AREA */}
                  <div style={{
                    padding: '25px 30px',
                    overflowY: 'auto',
                    flex: 1,
                    backgroundColor: '#fafafa'
                  }}>
                    {/* Direct Services */}
                    {(searchResults?.data?.length ?? 0) > 0 && (
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                          Direct Services in Your Area
                        </h3>
                        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                          {searchResults?.data?.map((result: any, index: number) => (
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
                                {result?.image && (
                                  <Image
                                    src={result?.image}
                                    alt=""
                                    width={50}
                                    height={70}
                                    style={{ borderRadius: '8px' }}
                                  />
                                )}
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                    {result?.name}
                                  </h4>
                                  {result?.description && (
                                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                                      {result?.description}
                                    </p>
                                  )}
                                  <Link
                                    href={`/services/${result?.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                        <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                          Nearby Services
                        </h3>
                        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
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
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                    {((!searchResults?.data || searchResults.data.length === 0) && (!searchResults?.nearby || searchResults.nearby.length === 0)) && (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
                          We haven't started here yet
                        </h3>
                        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px', lineHeight: '1.5' }}>
                          We are currently expanding! We don't have services in {searchResults.postcode ? searchResults.postcode : 'your area'} right now. <br /> Contact us to let us know you're interested!
                        </p>
                        <Link
                          href="/contact"
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
              </div>
            )}
            {/* Search Results Modal/Overlay End */}
          </div>

          <div className="col-lg-12">
            {/* Client Logos Slider Start */}
            <div className="client-logos-container" style={{ overflow: 'hidden', padding: '40px 0' }}>
              <style jsx>{`
                @keyframes infiniteSlide {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                
                .logos-track {
                  display: flex;
                  gap: 60px;
                  animation: infiniteSlide 30s linear infinite;
                  width: fit-content;
                }
                
                .logos-track:hover {
                  animation-play-state: paused;
                }
                
                .logo-item {
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 20px 30px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 12px;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  transition: all 0.3s ease;
                  min-width: 180px;
                  height: 100px;
                }
                
                .logo-item:hover {
                  transform: translateY(-5px);
                  background: rgba(255, 255, 255, 0.15);
                  border-color: rgba(70, 189, 236, 0.5);
                }
                
                .logo-item img {
                  max-width: 150px;
                  max-height: 60px;
                  object-fit: cover;
                  filter: brightness(0) invert(1);
                  opacity: 0.8;
                  transition: opacity 0.3s ease;
                }
                
                .logo-item:hover img {
                  opacity: 1;
                }
              `}</style>

              <div className="logos-track">
                {/* First set of logos */}
                <div className="logo-item">
                  <Image src="/images/client/care-inspectorate.jpg" alt="Care Inspectorate Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/disclosure-white-background.png" alt="Disclosure Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/nursing-and-midwifery-council.jpg" alt="Nursing And Midwifery Council Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/renfrewshire-council.png" alt="Renfrewshire Council Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/slc.png" alt="SLC Logo" width={120} height={60} />
                </div>

                {/* Duplicate set for seamless infinite loop */}
                <div className="logo-item">
                  <Image src="/images/client/care-inspectorate.jpg" alt="Care Inspectorate Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/disclosure-white-background.png" alt="Disclosure Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/nursing-and-midwifery-council.jpg" alt="Nursing And Midwifery Council Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/renfrewshire-council.png" alt="Renfrewshire Council Logo" width={120} height={60} />
                </div>
                <div className="logo-item">
                  <Image src="/images/client/slc.png" alt="SLC Logo" width={120} height={60} />
                </div>
              </div>
            </div>
            {/* Client Logos Slider End */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
