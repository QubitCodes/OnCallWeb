"use client";
import React, { useState, useEffect, useRef } from "react";
import TableThree, { Column } from "@/components/Tables/TableThree";
import TableSkeletonLoader from "@/components/skeletonLoader/TableSkeletonLoader";
import axios from "@/lib/api";
import { API_URL } from "@/config/api";

/**
 * LocationSearchSection Component
 * 
 * This component provides location-based search functionality for service providers.
 * Key features:
 * - Autocomplete location search using custom AdonisJS backend API
 * - Real-time suggestions with debounced search (300ms delay)
 * - Location-based provider search with filtering options
 * - Fallback to mock data if API is unavailable
 * 
 * API Endpoints used:
 * - GET /locations/search - for location suggestions
 * - GET /providers/location - for providers in selected location
 */

interface LocationData {
  id: string;
  name: string; 
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceType: string;
  availability: string;
  contactNumber: string;
}

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  displayName?: string; // Added displayName property
}

// Mock data - replace with actual API call
const mockLocationData: LocationData[] = [
  {
    id: "1",
    name: "Downtown Care Center",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    serviceType: "Home Care",
    availability: "Available",
    contactNumber: "+1-555-0123",
  },
  {
    id: "2",
    name: "Uptown Health Services",
    address: "456 Oak Ave",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    serviceType: "Specialist Care",
    availability: "Busy",
    contactNumber: "+1-555-0124",
  },
  {
    id: "3",
    name: "Riverside Care Unit",
    address: "789 River Rd",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    serviceType: "Home Care",
    availability: "Available",
    contactNumber: "+1-555-0125",
  },
  {
    id: "4",
    name: "Central Medical Hub",
    address: "321 Central Blvd",
    city: "Queens",
    state: "NY",
    zipCode: "11368",
    serviceType: "Specialist Care",
    availability: "Available",
    contactNumber: "+1-555-0126",
  },
];

const locationColumns: Column[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { 
    header: "Address", 
    accessorKey: "address",
    cell: ({ row }) => (
      <span>{`${row.address}, ${row.city}, ${row.state} ${row.zipCode}`}</span>
    ),
  },
  { header: "Service Type", accessorKey: "serviceType" },
  {
    header: "Availability",
    accessorKey: "availability",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.availability === 'Available' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {row.availability}
      </span>
    ),
  },
  { header: "Contact", accessorKey: "contactNumber" },
];

type LocationSearchSectionProps = Record<string, never>;

const LocationSearchSection: React.FC<LocationSearchSectionProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [filteredData, setFilteredData] = useState<LocationData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search state
  const [searchLocation, setSearchLocation] = useState("");
  
  // Location search suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Add location state
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [addLocationMessage, setAddLocationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Debounce timer for search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search locations from backend API
  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsSearching(true);
      
      // Call your AdonisJS backend API for location suggestions
      const response = await axios.get(`${API_URL}/locations/search`, {
        params: {
          q: query,
          limit: 10 // Limit suggestions to 10 results
        }
      });

      const suggestions = response.data.data || response.data || [];
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location search input change with debouncing
  const handleLocationSearchChange = (value: string) => {
    setSearchLocation(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300); // 300ms debounce delay
  };

  // Handle location suggestion selection
  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setSelectedLocation(suggestion);
    setSearchLocation(suggestion.displayName || suggestion.name || `${suggestion.city}, ${suggestion.state}`);
    setShowSuggestions(false);

    // Trigger search for providers in this location
    searchProvidersInLocation(suggestion);
  };

  // Search for service providers in selected location
  const searchProvidersInLocation = async (location: LocationSuggestion) => {
    try {
      setIsLoading(true);

      const response = await axios.get(`${API_URL}/providers/location`, {
        params: {
          city: location.city,
          state: location.state,
          zipCode: location.zipCode,
          lat: location.lat,
          lng: location.lng,
          page: currentPage,
          per_page: perPage
        }
      });

      const providers = response.data.data || [];
      const pagination = response.data.meta || response.data.pagination || {};
      
      setLocationData(providers);
      setFilteredData(providers);
      setTotalPages(pagination.totalPages || Math.ceil(providers.length / perPage));
      setTotalItems(pagination.total || providers.length);
    } catch (error) {
      console.error('Error fetching providers in location:', error);
      // Fallback to mock data if API fails
      setLocationData(mockLocationData);
      setFilteredData(mockLocationData);
      setTotalPages(Math.ceil(mockLocationData.length / perPage));
      setTotalItems(mockLocationData.length);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Simulate data loading
  useEffect(() => {
    const loadLocationData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLocationData(mockLocationData);
      setFilteredData(mockLocationData);
      setTotalPages(Math.ceil(mockLocationData.length / perPage));
      setTotalItems(mockLocationData.length);
      setIsLoading(false);
    };

    loadLocationData();
  }, [perPage]);

  // Handle filtering and searching
  useEffect(() => {
    let filtered = locationData;

    // Location search filter
    if (searchLocation.trim()) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
        location.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
        location.address.toLowerCase().includes(searchLocation.toLowerCase()) ||
        location.zipCode.includes(searchLocation)
      );
    }

    // Pagination
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setFilteredData(paginatedData);
    setTotalPages(Math.ceil(filtered.length / perPage));
    setTotalItems(filtered.length);

    // Reset to first page if current page is beyond available pages
    if (currentPage > Math.ceil(filtered.length / perPage) && Math.ceil(filtered.length / perPage) > 0) {
      setCurrentPage(1);
    }
  }, [locationData, searchLocation, currentPage, perPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLocationSearch = (value: string) => {
    // Use the new handleLocationSearchChange function instead
    handleLocationSearchChange(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearFilters = () => {
    setSearchLocation("");
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setCurrentPage(1);
    
    // Reset to initial mock data
    setLocationData(mockLocationData);
    setFilteredData(mockLocationData);
    setTotalPages(Math.ceil(mockLocationData.length / perPage));
    setTotalItems(mockLocationData.length);
  };

  const handleAddLocation = async () => {
    try {
      setIsAddingLocation(true);
      setAddLocationMessage(null);
      console.log('Adding location:', selectedLocation);

      // Validate that we have a selected location
      if (!selectedLocation) {
        setAddLocationMessage({
          type: 'error',
          text: 'Please select a location from the suggestions.'
        });
        return;
      }

      // Prepare location data for the API
      const locationData = {
        name: selectedLocation.name,
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        zipCode: selectedLocation.zipCode,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        // Include any other fields required by your API
      };

      // Call the POST codes API to add the location
      const response = await axios.post(`${API_URL}/locations`, locationData);

      if (response.data) {
        setAddLocationMessage({
          type: 'success',
          text: `Location "${locationData.name}" added successfully!`
        });
        
        // Clear the form after successful addition
        setSearchLocation("");
        setSelectedLocation(null);
        setLocationSuggestions([]);
        setShowSuggestions(false);

        // Clear the success message after 3 seconds
        setTimeout(() => {
          setAddLocationMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding location:', error);
      setAddLocationMessage({
        type: 'error',
        text: 'Failed to add location to the system. Please try again.'
      });
    } finally {
      setIsAddingLocation(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h4 className="p-3 text-xl font-semibold text-black">
          Location Search & Service Providers
        </h4>
        <p className="px-3 text-sm text-gray-600 mt-1">
          Search for service providers by location using our map-based search. Start typing a city, address, or ZIP code to see suggestions.
        </p>
        {!selectedLocation && (
          <div className="px-3 mt-2">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>How to use:</strong> Type at least 2 characters to see location suggestions, select a location from the dropdown, then click &quot;Add Location&quot; to save it to the system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Location Search */}
            <div className="flex flex-col relative md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black">
                Search Location
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Enter city, address, or ZIP code"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                  value={searchLocation}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                
                {/* Loading indicator */}
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}

                {/* Search suggestions dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-stroke rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id || index}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-start"
                      >
                        <div 
                          className="cursor-pointer flex-1"
                          onClick={() => handleLocationSelect(suggestion)}
                        >
                          <div className="font-medium text-black">
                            {suggestion.displayName || suggestion.name || `${suggestion.city}, ${suggestion.state}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {suggestion.address}
                            {suggestion.zipCode && `, ${suggestion.zipCode}`}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocationSelect(suggestion);
                            // Add a slight delay before submitting to allow the selection to be visibly updated
                            setTimeout(() => handleAddLocation(), 100);
                          }}
                          className="ml-2 px-3 py-1 bg-primary text-black text-sm rounded hover:bg-primary/90 transition-colors"
                          title="Add this location to the system"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!selectedLocation && searchLocation.trim().length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Select a location from suggestions to continue.
                </p>
              )}
            </div>

            {/* Clear Button */}
            <div className="flex flex-col justify-end">
              <button
                onClick={clearFilters}
                className="rounded bg-gray-600 px-4 py-3 text-white hover:bg-gray-700 transition-colors"
                title="Clear search and reset"
              >
                Clear Search
              </button>
            </div>
          </div>

          {/* Add Location Status Message */}
          {addLocationMessage && (
            <div className={`mt-4 p-3 rounded-lg ${
              addLocationMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {addLocationMessage.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{addLocationMessage.text}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setAddLocationMessage(null)}
                    className="inline-flex text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

              {/* Results Summary */}
              {!isLoading && (
                <div className="flex flex-col space-y-2">
                  {/* Selected location indicator */}
                  {selectedLocation && (
                    <div className="flex items-center justify-between text-sm bg-blue-50 px-3 py-2 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-primary">
                          Selected: {selectedLocation.name || `${selectedLocation.city}, ${selectedLocation.state}`}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedLocation(null);
                            clearFilters();
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="Clear location"
                        >
                          ×
                        </button>
                      </div>
                      <button
                        onClick={handleAddLocation}
                        disabled={isAddingLocation}
                        className="px-3 py-1 bg-primary text-black text-sm rounded hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                      >
                        {isAddingLocation ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Adding...
                          </>
                        ) : (
                          "Add This Location"
                        )}
                      </button>
                    </div>
                  )}              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredData.length} of {totalItems} results
                </span>
                {selectedLocation && (
                  <span className="text-primary">
                    Location search active
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-6 md:px-6 xl:px-7.5">
        {isLoading ? (
          <TableSkeletonLoader columns={locationColumns.length} rows={5} />
        ) : (
          <TableThree
            columns={locationColumns}
            data={filteredData}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              perPage,
            }}
            onPageChange={handlePageChange}
            // No onAddClick, onEditClick, or onDeleteClick - read-only table
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default LocationSearchSection;
