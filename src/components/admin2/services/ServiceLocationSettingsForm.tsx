'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm, useWatch } from 'react-hook-form';
import { Loader2, Save, MapPin, Search, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { verifyPointInAreas } from '@/utils/locationVerification';

const MapComponent = dynamic(() => import('@/components/admin2/location-templates/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-secondary-100 dark:bg-primary-700 animate-pulse rounded-xl flex items-center justify-center">Loading map...</div>
});

interface LocationSettingsProps {
  serviceId: string;
  initialData: {
    locationTemplateId?: string | null;
  };
}

// Lightweight Read-Only Area Column
const ReadOnlyAreaColumn = ({ type, title, areas, onFocus }: { type: 'include'|'exclude', title: string, areas: any[], onFocus: (idx: number) => void }) => {
  const columnAreas = areas.filter((a: any) => a.type === type);
  return (
    <div className="bg-white dark:bg-[#1e1e48] p-4 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 flex flex-col h-[400px]">
      <h3 className="text-sm font-semibold text-text-dark dark:text-secondary-100 mb-3">{title}</h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {columnAreas.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-light dark:text-secondary-400 border-2 border-dashed border-secondary-600/20 dark:border-white/10 rounded-lg">
            No {type} zones in this template
          </div>
        ) : (
          columnAreas.map((area: any) => {
            const globalIdx = areas.indexOf(area);
            return (
              <div key={globalIdx} className={`p-3 rounded-lg flex items-center justify-between ${type === 'exclude' ? 'bg-error/10 border border-error/20' : 'bg-accent/10 border border-accent/20'}`}>
                <p className="text-sm font-medium text-text-dark dark:text-secondary-100" title={area.name}>
                  {area.name || `Custom ${type} Zone`}
                </p>
                <button type="button" onClick={() => onFocus(globalIdx)} className="text-accent hover:text-[#34a4cf] transition-colors ml-3" title="Show on Map">
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default function ServiceLocationSettingsForm({ serviceId, initialData }: LocationSettingsProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Verification Tool State
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [verificationSearchResults, setVerificationSearchResults] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{status: 'serviced'|'excluded'|'not_included'|'error', title: string, message: string} | null>(null);
  
  const [focusedArea, setFocusedArea] = useState<{index: number, ts: number} | null>(null);

  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      locationTemplateId: initialData.locationTemplateId || '',
    }
  });

  const selectedTemplateId = useWatch({ control, name: 'locationTemplateId' });
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const selectedAreas = selectedTemplate?.areas || [];

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = getCookie('token');
        const res = await axios.get('/api/v1/location-templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status) {
          setTemplates(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load templates');
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (verificationResult) return;
    const query = testSearchQuery.trim();
    if (query.length < 3) {
      if (verificationSearchResults.length > 0) setVerificationSearchResults([]);
      return;
    }
    const timer = setTimeout(() => searchVerificationLocation(), 600);
    return () => clearTimeout(timer);
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
        const response = await fetch(url);
        data = await response.json();
      }
      
      if (!data || data.length === 0) {
        setVerificationResult({
          status: 'error',
          title: 'Location not found',
          message: 'Could not find this address. Try being more specific.'
        });
      } else if (data.length === 1) {
        handleSelectVerificationResult(data[0]);
      } else {
        setVerificationSearchResults(data);
      }
    } catch (error) {
      setVerificationResult({
        status: 'error',
        title: 'Search Error',
        message: 'Failed to verify location. Please try again.'
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
    const result = verifyPointInAreas(point, selectedAreas);

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
        message: `The location [${res.display_name.split(',')[0]}] does not fall inside any of your Included Areas.`
      });
    }
  };

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const token = getCookie('token');
      const res = await axios.put(`/api/v1/services/${serviceId}/locations`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        toast.success('Location settings updated successfully!');
      } else {
        toast.error(res.data.message || 'Failed to update locations');
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingTemplates) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white dark:bg-[#1e1e48] p-6 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5">
        <h3 className="text-lg font-semibold text-text-dark dark:text-secondary-100 mb-4">Location Settings</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-dark dark:text-secondary-200 mb-2">Location Template</label>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <select
                {...register('locationTemplateId')}
                className="w-full px-4 py-2.5 bg-secondary-50 dark:bg-primary-900 border border-secondary-600/20 dark:border-primary-600/30 rounded-xl focus:ring-2 focus:ring-accent outline-none text-text-dark dark:text-secondary-100 transition-all"
              >
                <option value="">No Template Assigned</option>
                {templates.map((tpl: any) => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
              <p className="text-xs text-text-light mt-1">Select a template to inherit its serviced areas. Any customers inside these areas will be allowed to book this service.</p>
            </div>
            
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-6 py-2.5 bg-accent hover:bg-[#34a4cf] text-white font-semibold rounded-xl shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap h-[46px]"
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>

      {selectedTemplate && (
        <div className="space-y-6 animate-fade-in">
          {/* Map & Verification Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Verification */}
            <div className="lg:col-span-1 flex flex-col space-y-6">
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
                      placeholder="e.g., G67 1AA"
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
                  <div className={`p-3 rounded-lg flex items-start space-x-3 border ${
                    verificationResult.status === 'serviced' ? 'bg-success/10 border-success/20 text-success' : 
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

            {/* Right Column: Map Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#1e1e48] p-4 rounded-xl shadow-card border border-secondary-600/10 dark:border-white/5 relative z-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-text-dark dark:text-secondary-100">Template Map Preview</h3>
                  <span className="text-xs px-2 py-1 bg-secondary-100 dark:bg-primary-700 text-text-light rounded-md font-medium">Read Only</span>
                </div>
                <MapComponent 
                  areas={selectedAreas} 
                  onAreasChange={() => {}} 
                  focusedArea={focusedArea}
                  readOnly={true}
                />
              </div>
            </div>
          </div>

          {/* Kanban Boards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadOnlyAreaColumn 
              type="include" 
              title="Included Areas" 
              areas={selectedAreas} 
              onFocus={(idx: number) => setFocusedArea({ index: idx, ts: Date.now() })}
            />
            <ReadOnlyAreaColumn 
              type="exclude" 
              title="Excluded Areas" 
              areas={selectedAreas} 
              onFocus={(idx: number) => setFocusedArea({ index: idx, ts: Date.now() })}
            />
          </div>
        </div>
      )}
    </form>
  );
}
