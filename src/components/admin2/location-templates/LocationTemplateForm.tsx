'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationTemplateSchema } from '@/schemas/locationTemplate.schema';
import { toast } from 'react-toastify';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Search, Loader2, X, Plus, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { verifyPointInAreas, VerificationArea } from '@/utils/locationVerification';

// Dynamic import for Map to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-secondary-100 dark:bg-primary-700 animate-pulse rounded-xl flex items-center justify-center">Loading map...</div>
});

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return '';
};

// Kanban Column Component for Searching and Displaying Areas
function AreaColumn({ type, title, areas, onAdd, onRemove, onFocus }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const columnAreas = areas.filter((a: any) => a.type === type);

  const getIncludeViewbox = () => {
    const includeAreas = areas.filter((a: any) => a.type === 'include' && a.boundary);
    if (includeAreas.length === 0) return null;

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

    const processCoord = (p: number[]) => {
      if (p[1] < minLat) minLat = p[1];
      if (p[1] > maxLat) maxLat = p[1];
      if (p[0] < minLng) minLng = p[0];
      if (p[0] > maxLng) maxLng = p[0];
    };

    includeAreas.forEach((a: any) => {
      if (a.boundary.type === 'Point') {
        processCoord(a.boundary.coordinates);
      } else if (a.boundary.type === 'Polygon') {
        a.boundary.coordinates[0].forEach(processCoord);
      } else if (a.boundary.type === 'MultiPolygon') {
        a.boundary.coordinates.forEach((poly: any) => poly[0].forEach(processCoord));
      }
    });

    return `${minLng},${maxLat},${maxLng},${minLat}`;
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const token = getCookie('token');
          let url = `/api/v1/locations/search?q=${encodeURIComponent(searchQuery)}`;
          if (type === 'exclude') {
            const viewbox = getIncludeViewbox();
            if (viewbox) url += `&viewbox=${viewbox}`;
          }
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status) {
            const validResults = res.data.data.filter((r: any) =>
              r.geojson &&
              !areas.some((a: any) => a.place_id && a.place_id === r.place_id)
            );
            setSearchResults(validResults);
          }
        } catch (error) {
          console.error('Location search failed');
        } finally {
          setIsSearching(false);
        }
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery, areas]); // Re-run effect if global 'areas' changes so duplicates drop out

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSearchResults([]); // close dropdown
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchNominatim = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length <= 2) return;
    setIsSearching(true);
    try {
      const token = getCookie('token');
      let url = `/api/v1/locations/search?q=${encodeURIComponent(searchQuery)}`;
      if (type === 'exclude') {
        const viewbox = getIncludeViewbox();
        if (viewbox) url += `&viewbox=${viewbox}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        const validResults = res.data.data.filter((r: any) =>
          r.geojson &&
          !areas.some((a: any) => a.place_id && a.place_id === r.place_id)
        );
        setSearchResults(validResults);
      }
    } catch (error) {
      toast.error('Location search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (res: any) => {
    // 1. Immediately remove the clicked item from the dropdown
    setSearchResults(prev => prev.filter(item => item.place_id !== res.place_id));

    // 2. Clear search query if this was the very last item in the list
    if (searchResults.length <= 1) {
      setSearchQuery('');
    }

    // 3. Complete the remaining actions (adding to map and focusing)
    onAdd({
      name: res.display_name, // Store the full name here!
      boundary: res.geojson,
      type: type,
      place_id: res.place_id // Store place_id to deduplicate future searches
    });

    inputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-[#1e1e48] p-6 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-text-dark dark:text-secondary-100 mb-4">{title}</h2>

      {/* Search Input (Top) */}
      <div className="relative mb-6" ref={containerRef}>
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchNominatim())}
            placeholder={`Search to ${type}...`}
            className="w-full px-3 py-2 text-sm bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100"
          />
          <button type="button" onClick={searchNominatim} className="p-2 bg-accent text-white rounded-lg" disabled={isSearching}>
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-full mt-1 z-20 w-full bg-white dark:bg-[#1e1e48] border border-secondary-600/10 dark:border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((res: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleAdd(res)}
                className="p-3 hover:bg-secondary-50 dark:hover:bg-[#171738] flex justify-between items-center group border-b border-secondary-600/10 dark:border-white/5 last:border-0 cursor-pointer transition-colors"
              >
                <p className="text-sm text-text-dark dark:text-secondary-100 break-words whitespace-normal leading-tight pr-4" title={res.display_name}>{res.display_name}</p>
                <span className={`whitespace-nowrap text-xs font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity ${type === 'exclude' ? 'text-error' : 'text-accent'}`}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Added Areas List (Bottom) */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {columnAreas.length === 0 ? (
          <p className="text-sm text-text-light">No {type} areas added yet.</p>
        ) : (
          columnAreas.map((area: any) => {
            const globalIdx = areas.indexOf(area);
            return (
              <div key={globalIdx} className={`p-3 rounded-lg flex items-center justify-between ${type === 'exclude' ? 'bg-error/10 border border-error/20' : 'bg-accent/10 border border-accent/20'}`}>
                <p className="text-sm font-medium text-text-dark dark:text-secondary-100" title={area.name}>
                  {area.name || `Custom ${type} Zone`}
                </p>
                <div className="flex items-center">
                  <button type="button" onClick={() => onFocus(globalIdx)} className="text-accent hover:text-[#34a4cf] transition-colors ml-3" title="Show on Map">
                    <MapPin className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onRemove(globalIdx)} className="text-text-light hover:text-error transition-colors ml-3" title="Remove Area">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function LocationTemplateForm({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [drawMode, setDrawMode] = useState<'include' | 'exclude'>('include');
  const [focusedArea, setFocusedArea] = useState<{ index: number, ts: number } | null>(null);

  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSearchResults, setVerificationSearchResults] = useState<any[]>([]);
  const [verificationResult, setVerificationResult] = useState<{ status: 'serviced' | 'excluded' | 'not_included' | 'error', title: string, message: string } | null>(null);

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(locationTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      areas: [] as any[],
    }
  });

  const areas = watch('areas') || [];

  useEffect(() => {
    if (templateId) {
      const fetchTemplate = async () => {
        setIsLoading(true);
        try {
          const token = getCookie('token');
          const res = await axios.get(`/api/v1/location-templates/${templateId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status) {
            reset({
              name: res.data.data.name,
              description: res.data.data.description || '',
              isActive: res.data.data.isActive,
              areas: res.data.data.areas || [],
            });
          }
        } catch (error) {
          toast.error('Failed to load template details');
          router.push('/admin2/location-templates');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [templateId, reset, router]);

  const handleAddArea = (newArea: any) => {
    setValue('areas', [...(areas || []), newArea]);
  };

  const handleRemoveArea = (index: number) => {
    const newAreas = [...areas];
    newAreas.splice(index, 1);
    setValue('areas', newAreas);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-search if query > 2 chars, no results are currently shown, and we haven't already selected a result
      if (testSearchQuery.trim().length > 2 && !verificationResult && verificationSearchResults.length === 0) {
        searchVerificationLocation();
      } else if (testSearchQuery.trim().length === 0) {
        setVerificationSearchResults([]);
        setVerificationResult(null);
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testSearchQuery]);

  const searchVerificationLocation = async () => {
    if (!testSearchQuery.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setVerificationSearchResults([]);

    try {
      let data: any[] = [];
      const postcodeMatch = testSearchQuery.match(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i);

      if (postcodeMatch) {
        const cleanQuery = testSearchQuery.replace(/\s+/g, '');
        const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanQuery)}`);
        const pcData = await pcRes.json();

        if (pcData.status === 200 && pcData.result) {
          data.push({
            place_id: `pc_${pcData.result.postcode}`,
            lat: pcData.result.latitude.toString(),
            lon: pcData.result.longitude.toString(),
            display_name: `${pcData.result.postcode}, ${pcData.result.admin_district || ''}, UK`,
            geojson: { type: "Point", coordinates: [pcData.result.longitude, pcData.result.latitude] }
          });
        } else if (pcData.status === 404 && pcData.terminated) {
          data.push({
            place_id: `pc_${pcData.terminated.postcode}`,
            lat: pcData.terminated.latitude.toString(),
            lon: pcData.terminated.longitude.toString(),
            display_name: `${pcData.terminated.postcode} (Terminated Postcode), UK`,
            geojson: { type: "Point", coordinates: [pcData.terminated.longitude, pcData.terminated.latitude] }
          });
        }
      }

      if (data.length === 0) {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(testSearchQuery)}&format=json&limit=5`;

        const includeAreas = areas.filter((a: any) => a.type === 'include' && a.boundary);
        if (includeAreas.length > 0) {
          let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
          const processCoord = (p: number[]) => {
            if (p[1] < minLat) minLat = p[1];
            if (p[1] > maxLat) maxLat = p[1];
            if (p[0] < minLng) minLng = p[0];
            if (p[0] > maxLng) maxLng = p[0];
          };
          includeAreas.forEach((a: any) => {
            if (a.boundary.type === 'Point') {
              processCoord(a.boundary.coordinates);
            } else if (a.boundary.type === 'Polygon') {
              a.boundary.coordinates[0].forEach(processCoord);
            } else if (a.boundary.type === 'MultiPolygon') {
              a.boundary.coordinates.forEach((poly: any) => poly[0].forEach(processCoord));
            }
          });
          url += `&viewbox=${minLng},${maxLat},${maxLng},${minLat}`;
        }

        const response = await fetch(url, { headers: { 'User-Agent': 'OnCallWeb/1.0' } });
        data = await response.json();
      }

      if (!data || data.length === 0) {
        setVerificationResult({
          status: 'error',
          title: 'Location Not Found',
          message: 'Could not find any matches for the entered address.'
        });
      } else {
        setVerificationSearchResults(data);
      }
    } catch (error) {
      setVerificationResult({
        status: 'error',
        title: 'API Error',
        message: 'Failed to search location due to network error.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectVerificationResult = (res: any) => {
    setTestSearchQuery(res.display_name.split(',')[0]);
    setVerificationSearchResults([]);
    setVerificationResult(null);

    const point: [number, number] = [parseFloat(res.lon), parseFloat(res.lat)];

    const result = verifyPointInAreas(point, areas as VerificationArea[]);

    if (result.status === 'excluded') {
      setVerificationResult({
        status: 'excluded',
        title: 'Location is Excluded',
        message: `Falls within an excluded zone: ${result.matchedExcludeName}`
      });
    } else if (result.status === 'serviced') {
      setVerificationResult({
        status: 'serviced',
        title: 'Location is Serviced',
        message: `Matches included zone: ${result.matchedIncludeName}`
      });
    } else {
      setVerificationResult({
        status: 'not_included',
        title: 'Not Serviced',
        message: `The location [${res.display_name}] does not fall inside any of your Included Areas.`
      });
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const url = templateId ? `/api/v1/location-templates/${templateId}` : '/api/v1/location-templates';
      const method = templateId ? 'put' : 'post';

      const token = getCookie('token');
      const res = await axios[method](url, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status) {
        toast.success(`Template ${templateId ? 'updated' : 'created'} successfully`);
        if (!templateId && res.data.data?.id) {
          router.push(`/admin2/location-templates/${res.data.data.id}/edit`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ROW 1: Details & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Form Details & Verification */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div className="bg-white dark:bg-[#1e1e48] p-6 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 flex-1">
            <h2 className="text-lg font-semibold text-text-dark dark:text-secondary-100 mb-4">Template Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-1">Template Name *</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <input
                        {...field}
                        className="w-full px-4 py-2 bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100"
                        placeholder="e.g., North West Region"
                      />
                      {fieldState.error && <p className="text-error text-xs mt-1">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-1">Description</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      rows={6}
                      className="w-full px-4 py-2 bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100"
                      placeholder="Template description..."
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e48] p-6 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5">
            <h2 className="text-lg font-semibold text-text-dark dark:text-secondary-100 mb-2">Zone Verification Tool</h2>
            <p className="text-xs text-text-light dark:text-secondary-200 mb-4">Search an address to verify if it is actively serviced by this template.</p>
            <div className="relative mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testSearchQuery}
                  onChange={(e) => {
                    setTestSearchQuery(e.target.value);
                    if (verificationResult) setVerificationResult(null);
                    if (verificationSearchResults.length > 0) setVerificationSearchResults([]);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchVerificationLocation())}
                  placeholder="e.g., 10 Downing Street"
                  className="w-full px-3 py-2 text-sm bg-secondary-100 dark:bg-[#171738] border border-transparent focus:border-accent rounded-lg outline-none text-text-dark dark:text-secondary-100"
                />
                <button type="button" onClick={searchVerificationLocation} className="p-2 bg-accent text-white rounded-lg flex-shrink-0" disabled={isVerifying}>
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </div>

              {verificationSearchResults.length > 0 && (
                <div className="absolute top-full mt-1 z-20 w-full bg-white dark:bg-[#1e1e48] border border-secondary-600/10 dark:border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {verificationSearchResults.map((res: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectVerificationResult(res)}
                      className="p-3 hover:bg-secondary-50 dark:hover:bg-[#171738] flex flex-col group border-b border-secondary-600/10 dark:border-white/5 last:border-0 cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-semibold text-text-dark dark:text-secondary-100 break-words whitespace-normal leading-tight" title={res.display_name}>{res.display_name.split(',')[0]}</p>
                      <p className="text-xs text-text-light mt-0.5 break-words whitespace-normal leading-relaxed" title={res.display_name}>{res.display_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {verificationResult && (
              <div className={`p-3 rounded-lg flex items-start space-x-3 border ${verificationResult.status === 'serviced' ? 'bg-success/10 border-success/20 text-success' :
                  verificationResult.status === 'excluded' ? 'bg-error/10 border-error/20 text-error' :
                    verificationResult.status === 'not_included' ? 'bg-warning/10 border-warning/20 text-warning-700 dark:text-warning' :
                      'bg-secondary-100 border-secondary-200 text-text-dark'
                }`}>
                <div className="mt-0.5 flex-shrink-0">
                  {verificationResult.status === 'serviced' && <CheckCircle className="w-5 h-5" />}
                  {verificationResult.status === 'excluded' && <XCircle className="w-5 h-5" />}
                  {verificationResult.status === 'not_included' && <AlertTriangle className="w-5 h-5" />}
                  {verificationResult.status === 'error' && <X className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{verificationResult.title}</h4>
                  <p className="text-xs opacity-90 mt-0.5">{verificationResult.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1e1e48] p-4 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 relative z-0">

            {/* Map Toolbar */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-text-dark dark:text-secondary-100">Map Visualizer & Custom Drawing</h3>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setDrawMode('include');
                    setTimeout(() => {
                      const btn = document.querySelector('.leaflet-draw-draw-polygon') as HTMLElement;
                      if (btn) btn.click();
                    }, 50);
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-md transition-all bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/20 flex items-center shadow-sm hover:shadow"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5" /> Draw Include
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawMode('exclude');
                    setTimeout(() => {
                      const btn = document.querySelector('.leaflet-draw-draw-polygon') as HTMLElement;
                      if (btn) btn.click();
                    }, 50);
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-md transition-all bg-error/10 text-error hover:bg-error hover:text-white border border-error/20 flex items-center shadow-sm hover:shadow"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5" /> Draw Exclude
                </button>
              </div>
            </div>

            <MapComponent
              areas={(areas as any[]) || []}
              onAreasChange={(newAreas) => setValue('areas', newAreas)}
              drawMode={drawMode}
              focusedArea={focusedArea}
            />
          </div>
        </div>
      </div>

      {/* ROW 2: Kanban Boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AreaColumn
          type="include"
          title="Included Areas"
          areas={(areas as any[]) || []}
          onAdd={handleAddArea}
          onRemove={handleRemoveArea}
          onFocus={(idx: number) => setFocusedArea({ index: idx, ts: Date.now() })}
        />
        <AreaColumn
          type="exclude"
          title="Excluded Areas"
          areas={(areas as any[]) || []}
          onAdd={handleAddArea}
          onRemove={handleRemoveArea}
          onFocus={(idx: number) => setFocusedArea({ index: idx, ts: Date.now() })}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/admin2/location-templates')}
          className="px-6 py-2.5 rounded-lg font-semibold bg-secondary-100 dark:bg-primary-700 text-text-dark dark:text-secondary-100 hover:bg-secondary-200 dark:hover:bg-primary-600 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg font-semibold bg-accent text-white hover:bg-[#34a4cf] transition-all flex items-center shadow-lg hover:shadow-accent/30"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {templateId ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
}
