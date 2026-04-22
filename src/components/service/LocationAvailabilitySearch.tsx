'use client';

import { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Loader2, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function LocationAvailabilitySearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleNominatimSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);
    
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      setSearchResults(res.data);
    } catch (error) {
      console.error('Failed to search location', error);
    } finally {
      setIsSearching(false);
    }
  };

  const checkAvailability = async (lat: string | number, lon: string | number) => {
    setIsSearching(true);
    setSearchResults([]);
    setHasSearched(false);
    
    try {
      const res = await axios.post('/api/v1/services/check-availability', {
        lat: parseFloat(lat.toString()),
        lng: parseFloat(lon.toString())
      });
      
      if (res.data.status) {
        setAvailableServices(res.data.data);
      }
    } catch (error) {
      console.error('Availability check failed', error);
      setAvailableServices([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        checkAvailability(position.coords.latitude, position.coords.longitude);
      },
      () => {
        alert("Unable to retrieve your location");
        setIsSearching(false);
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-primary-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-900 dark:text-white mb-2">
          Check Service Availability
        </h2>
        <p className="text-center text-gray-500 dark:text-secondary-300 mb-8">
          Enter your location or use your device's GPS to see which of our services are available in your area.
        </p>

        <form onSubmit={handleNominatimSearch} className="relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter city, postcode, or address..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-primary-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-accent outline-none text-gray-900 dark:text-white transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="px-4 py-3.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl transition-colors"
                title="Use my current location"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full z-10 bg-white dark:bg-primary-800 border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
              {searchResults.map((result: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => checkAvailability(result.lat, result.lon)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-primary-700 flex flex-col border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate w-full">{result.display_name.split(',')[0]}</span>
                  <span className="text-xs text-gray-500 dark:text-secondary-400 truncate w-full">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-gray-100 dark:border-white/10"
            >
              {availableServices.length > 0 ? (
                <div>
                  <div className="flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-semibold">Great news! We operate in your area.</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableServices.map((service) => (
                      <Link 
                        href={`/services/${service.slug}`} 
                        key={service.id}
                        className="p-4 bg-gray-50 dark:bg-primary-900 border border-gray-100 dark:border-white/5 rounded-xl hover:shadow-md hover:border-accent/50 transition-all group"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-accent transition-colors">{service.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-secondary-400 mt-1 line-clamp-2">{service.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    We're yet to arrive there.
                  </h3>
                  <p className="text-gray-500 dark:text-secondary-300 mb-6 max-w-md mx-auto">
                    We currently do not have active services listed for your specific location. However, we're always expanding. Contact us to see if we can make an exception!
                  </p>
                  <Link 
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 bg-accent hover:bg-[#34a4cf] text-white font-semibold rounded-xl transition-all shadow-lg shadow-accent/30 hover:shadow-accent/50"
                  >
                    <PhoneCall className="w-5 h-5 mr-2" />
                    Contact Us Anyway
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
