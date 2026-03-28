"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import apiClient from "@/lib/api";
import { API_URL } from "@/config/api";
import { toast } from "react-toastify";
import Modal from "@/components/FormElements/Modal";
import axios from "@/lib/api";
import styles from "./ServiceDetails.module.css";

// Define interfaces for data
interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  lat: number;
  lng: number;
  placeType?: string;
  category?: string;
}

interface PostcodeData {
  postcode: string;
  displayName: string;
}

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
  benefits: string;
  benefitsExtended: string;
  gettingStarted: string;
  image: string;
  icon: string;
  active: boolean;
  zipcodes?: string[];
}

const ServiceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const serviceId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("service"); // Edit Service, Locations
  const [isSaving, setIsSaving] = useState(false);

  // Location tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocationForModal, setSelectedLocationForModal] = useState<LocationSuggestion | null>(null);
  const [availablePostcodes, setAvailablePostcodes] = useState<PostcodeData[]>([]);
  const [isLoadingPostcodes, setIsLoadingPostcodes] = useState(false);

  // Service form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
    fullDescription: "",
    detailedDescription: "",
    whatIs: "",
    typicalVisit: "",
    benefits: "",
    benefitsExtended: "",
    gettingStarted: "",
    active: true,
  });

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/services/${serviceId}`);
        const serviceData = response.data.data;
        setService(serviceData);
        
        // Update form data
        setFormData({
          name: serviceData.name || "",
          slug: serviceData.slug || "",
          category: serviceData.category || "",
          description: serviceData.description || "",
          fullDescription: serviceData.fullDescription || "",
          detailedDescription: serviceData.detailedDescription || "",
          whatIs: serviceData.whatIs || "",
          typicalVisit: serviceData.typicalVisit || "",
          benefits: serviceData.benefits || "",
          benefitsExtended: serviceData.benefitsExtended || "",
          gettingStarted: serviceData.gettingStarted || "",
          active: serviceData.active ?? true,
        });
      } catch (err: unknown) {
        console.error("Failed to fetch service:", err);
        setError("Failed to load service details");
        toast.error("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // Location search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const response = await axios.get(`${API_URL}/locations/autocomplete`, {
            params: {
              q: searchQuery,
              country: 'gb',
              limit: 10
            }
          });
          
          const suggestions = response.data.data || [];
          setLocationSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        } catch (error) {
          console.error('Location search failed:', error);
          setLocationSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle location suggestion click
  const handleLocationClick = async (location: LocationSuggestion) => {
    setShowSuggestions(false);
    setIsLoadingPostcodes(true);
    setSelectedLocationForModal(location);

    try {
      const response = await axios.get(`${API_URL}/locations/postcodes/geonames`, {
        params: {
          placeName: location.name,
          countryCode: 'GB',
          maxRows: 50
        }
      });

      const postcodes = response.data.data || [];
      const validPostcodes = postcodes.filter((p: PostcodeData) => 
        p && p.postcode && 
        typeof p.postcode === 'string' && 
        p.postcode.trim() !== '' &&
        p.postcode !== 'null' && 
        p.postcode !== 'NULL'
      );

      // Extract outward codes using rigorous Regex and deduplicate
      const outwardMap = new Map<string, PostcodeData>();
      validPostcodes.forEach((p: PostcodeData) => {
        const normalized = p.postcode.replace(/\s+/g, '').toUpperCase();
        const fullMatch = normalized.match(/^([A-Z]{1,2}[0-9][A-Z0-9]?)\s*([0-9][A-Z]{2})$/);
        const outward = fullMatch ? fullMatch[1] : normalized;
        
        if (!outwardMap.has(outward)) {
           outwardMap.set(outward, { ...p, postcode: outward });
        }
      });
      const uniqueOutwardPostcodes = Array.from(outwardMap.values()).sort((a, b) => a.postcode.localeCompare(b.postcode));
      
      setAvailablePostcodes(uniqueOutwardPostcodes);
      setIsLocationModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch postcodes:', error);
      toast.error('Failed to fetch postcodes for this location');
      setAvailablePostcodes([]);
    } finally {
      setIsLoadingPostcodes(false);
    }
  };

  // Handle confirm location and save zipcodes
  const handleConfirmLocation = async () => {
    if (!selectedLocationForModal || !service) return;

    try {
      setIsSaving(true);
      // Remove all spaces from zipcodes and convert to uppercase
      const zipcodes = availablePostcodes.map(p => p.postcode.trim().replace(/\s/g, '').toUpperCase());
      console.log(zipcodes)
      
      const response = await axios.post(`${API_URL}/services/${serviceId}/zipcodes`, {
        zipcodes: zipcodes
      });

      if (response.status==200) {
        toast.success('Location zipcodes saved successfully!');
        // Update local service state
        setService({ ...service, zipcodes: zipcodes });
        // Close the modal and reset state
        setIsLocationModalOpen(false);
        setSelectedLocationForModal(null);
        setAvailablePostcodes([]);
        setSearchQuery("");
      }
    } catch (error) {
      console.error('Failed to save zipcodes:', error);
      toast.error('Failed to save zipcodes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle service form update
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const response = await axios.put(`${API_URL}/services/${serviceId}`, formData);

      if (response.data.success) {
        toast.success('Service updated successfully!');
        setService({ ...service!, ...formData });
      }
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle delete zipcode
  const handleDeleteZipcode = async (zipcodeToDelete: string) => {
    if (!service) return;

    if (!window.confirm(`Are you sure you want to delete zipcode "${zipcodeToDelete}"?`)) {
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await axios.delete(`${API_URL}/services/${serviceId}/zipcodes`, {
        data: {
          zipcode: zipcodeToDelete
        }
      });

      if (response.data.message === 'Zipcode removed successfully') {
        toast.success('Zipcode deleted successfully!');
        const updatedZipcodes = service.zipcodes?.filter(z => z !== zipcodeToDelete) || [];
        setService({ ...service, zipcodes: updatedZipcodes });
      }
    } catch (error) {
      console.error('Failed to delete zipcode:', error);
      toast.error('Failed to delete zipcode');
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return (
      <DefaultLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorMessage}>{error || "Service not found"}</p>
          <button
            onClick={() => router.push("/admin/service")}
            className={styles.btnPrimary}
          >
            Back to Services
          </button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="Service Details" />

        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/service")}
            className={styles.backButton}
          >
            <svg
              className={styles.backButtonIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Services
          </button>
        </div>

        {/* Tabs navigation */}
        <div className={styles.tabsContainer}>
          <nav className={styles.tabsNav}>
            <button
              onClick={() => setActiveTab("service")}
              className={`${styles.tabButton} ${activeTab === "service" ? styles.active : ""}`}
            >
              Edit Service
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`${styles.tabButton} ${activeTab === "locations" ? styles.active : ""}`}
            >
              Locations
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className={styles.tabContent}>
          {activeTab === "service" && (
            <div className={styles.tabPanel}>
              <div className={styles.tabPanelHeader}>
                <h4 className={styles.tabPanelTitle}>
                  Edit Service
                </h4>
              </div>
              
              <div className={styles.tabPanelBody}>
                <form onSubmit={handleUpdateService} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Service Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Slug <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Category <span className={styles.required}>*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className={styles.formSelect}
                    >
                      <option value="">Select category</option>
                      <option value="home-care">Home Care</option>
                      <option value="specialist-care">Specialist Care</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Full Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="fullDescription"
                      value={formData.fullDescription}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Detailed Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="detailedDescription"
                      value={formData.detailedDescription}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      What Is <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="whatIs"
                      value={formData.whatIs}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Typical Visit <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="typicalVisit"
                      value={formData.typicalVisit}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Benefits <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Benefits Extended <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="benefitsExtended"
                      value={formData.benefitsExtended}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Getting Started <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="gettingStarted"
                      value={formData.gettingStarted}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => router.push("/admin/service")}
                      className={styles.btnSecondary}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={styles.btnPrimary}
                    >
                      {isSaving ? "Saving..." : "Update Service"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "locations" && (
            <div className={styles.tabPanel}>
              <div className={styles.tabPanelHeader}>
                <h4 className={styles.tabPanelTitle}>
                  Service Location & Zipcodes
                </h4>
                <p className={styles.tabPanelSubtitle}>
                  Search for a location to add available zipcodes to this service
                </p>
              </div>
              
              <div className={styles.tabPanelBody}>
                {/* Location Search Input */}
                <div className={styles.locationSearchWrapper}>
                  <label className={styles.formLabel}>
                    Search Location
                  </label>
                  <div className={styles.searchInputWrapper}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type city, town, or area name..."
                      className={styles.formInput}
                    />
                    
                    {isSearching && (
                      <div className={styles.searchLoader}>
                        <div className={styles.spinner}></div>
                      </div>
                    )}

                    {/* Location Suggestions Dropdown */}
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div className={styles.suggestionsDropdown}>
                        {locationSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className={styles.suggestionItem}
                            onClick={() => handleLocationClick(suggestion)}
                          >
                            <div className={styles.suggestionName}>{suggestion.name}</div>
                            <div className={styles.suggestionAddress}>{suggestion.address}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {searchQuery.trim().length > 0 && searchQuery.length < 2 && (
                    <p className={styles.searchHint}>
                      Type at least 2 characters to see suggestions.
                    </p>
                  )}
                </div>

                {/* Current Zipcodes Display */}
                {service?.zipcodes && service.zipcodes.length > 0 && (
                  <div className={styles.zipcodesSection}>
                    <h5 className={styles.zipcodesTitle}>
                      Current Zipcodes ({service.zipcodes.length})
                    </h5>
                    <div className={styles.tableWrapper}>
                      <table className={styles.zipcodesTable}>
                        <thead>
                          <tr>
                            <th className={styles.tableHeader}>Zipcode</th>
                            <th className={styles.tableHeader}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {service.zipcodes.map((zipcode, index) => (
                            <tr key={index} className={styles.tableRow}>
                              <td className={styles.tableCell}>{zipcode}</td>
                              <td className={styles.tableCell}>
                                <button
                                  onClick={() => handleDeleteZipcode(zipcode)}
                                  className={styles.deleteZipcodeBtn}
                                  disabled={isSaving}
                                  title="Delete zipcode"
                                >
                                  <svg
                                    className={styles.deleteIcon}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Location Confirmation Modal */}
        <Modal
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            setSelectedLocationForModal(null);
            setAvailablePostcodes([]);
          }}
          title="Confirm Location & Zipcodes"
        >
          {isLoadingPostcodes ? (
            <div className={styles.modalLoadingState}>
              <div className={styles.modalSpinner}></div>
              <p className={styles.modalLoadingText}>Loading postcodes...</p>
            </div>
          ) : (
            <div>
              {selectedLocationForModal && (
                <div className={styles.modalLocationDetails}>
                  <h4 className={styles.modalLocationTitle}>Location Details</h4>
                  <div className={styles.modalLocationInfo}>
                    <p><strong>Name:</strong> {selectedLocationForModal.name}</p>
                    <p><strong>Address:</strong> {selectedLocationForModal.address}</p>
                    <p><strong>Coordinates:</strong> {selectedLocationForModal.lat}, {selectedLocationForModal.lng}</p>
                  </div>
                </div>
              )}

              {availablePostcodes.length > 0 ? (
                <div className={styles.modalPostcodesSection}>
                  <h4 className={styles.modalPostcodesTitle}>
                    Available Postcode Groups ({availablePostcodes.length})
                  </h4>
                  <div className={styles.modalPostcodesContainer}>
                    <div className={styles.modalPostcodesGrid}>
                      {availablePostcodes.map((postcode, index) => (
                        <span
                          key={index}
                          className={styles.modalPostcodeItem}
                        >
                          {postcode.postcode}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className={styles.modalPostcodesNote}>
                    These postcodes will be saved to the service when you confirm.
                  </p>
                </div>
              ) : (
                <div className={styles.modalEmptyState}>
                  <p className={styles.modalEmptyStateText}>No postcodes found for this location.</p>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setIsLocationModalOpen(false);
                    setSelectedLocationForModal(null);
                    setAvailablePostcodes([]);
                  }}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLocation}
                  disabled={isSaving || availablePostcodes.length === 0}
                  className={styles.btnPrimary}
                >
                  {isSaving ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DefaultLayout>
  );
};

export default ServiceDetailsPage;