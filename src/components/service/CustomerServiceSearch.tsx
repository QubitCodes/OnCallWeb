"use client";
import React, { useState } from "react";
import axios from "@/lib/api";
import { API_URL } from "@/config/api";

interface ServiceResult {
  id: string;
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  location: {
    name: string;
    county: string;
  };
  postcode: string;
}

interface SearchResults {
  available: boolean;
  postcode: string;
  matchType: 'exact' | 'nearby';
  searchRadius?: string;
  data: ServiceResult[];
}

const CustomerServiceSearch: React.FC = () => {
  const [postcode, setPostcode] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!postcode.trim()) {
      setError('Please enter a postcode');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API_URL}/check-availability`, {
        postcode: postcode.trim().toUpperCase(),
        includeNearby: true
      });

      setResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search for services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stroke shadow-default p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-black mb-2">
          Find Services by Postcode
        </h3>
        <p className="text-sm text-gray-600">
          Enter your postcode to find available services in your area.
        </p>
      </div>

      {/* Search Form */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your postcode (e.g., M1 1AA)"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !postcode.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading || !postcode.trim() ? '#9CA3AF' : '#3b82f6',
            color: '#000',
            fontWeight: 600,
            borderRadius: '0.5rem',
            border: 'none',
            cursor: loading || !postcode.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          {loading ? 'Searching...' : 'Find Services'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {results.available ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-1">
                  {results.matchType === 'exact' 
                    ? `Services available in ${results.postcode}` 
                    : `Services available in nearby areas (${results.searchRadius || 'within'} postcodes)`
                  }
                </h4>
                <p className="text-green-700 text-sm">
                  Found {results.data.length} service(s)
                </p>
              </div>

              <div className="grid gap-4">
                {results.data.map((result) => (
                  <div key={`${result.id}-${result.postcode}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-black">{result.name}</h5>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{result.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      {/* <div> */}
                        {/* <span className="font-medium">Area:</span> {result.location.name}
                        {result.location.county && `, ${result.location.county}`}
                      </div> */}
                      <div>
                        <span className="font-medium">Postcode:</span> {result.zipcodes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-1">
                We haven't started here yet
              </h4>
              <p className="text-yellow-700 text-sm mb-4">
                We are currently expanding! We don't have services in {results.postcode} right now. Contact us to let us know you're interested!
              </p>
              <a
                href="/contact"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition"
              >
                Contact Us
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerServiceSearch;