'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, Marker, Tooltip, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for leaflet marker icons in next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createPinIcon = (color: string) => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white" stroke="none"></circle></svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    tooltipAnchor: [0, -32]
  });
};

interface Area {
  name?: string;
  locationId?: string | null;
  boundary?: any;
  type: 'include' | 'exclude';
}

export default function MapComponent({ areas, onAreasChange, drawMode = 'exclude', focusedArea = null, readOnly = false }: { areas: Area[], onAreasChange: (areas: Area[]) => void, drawMode?: 'include' | 'exclude', focusedArea?: { index: number, ts: number } | null, readOnly?: boolean }) {
  const mapRef = useRef<L.Map>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Auto-center map based on included areas
  useEffect(() => {
    if (mapRef.current && areas.length > 0) {
      const allLatlngs: L.LatLngExpression[] = [];
      areas.forEach(a => {
        if (a.boundary && a.boundary.type === 'Point') {
           allLatlngs.push([a.boundary.coordinates[1], a.boundary.coordinates[0]]);
        } else if (a.boundary && a.boundary.type === 'Polygon') {
           a.boundary.coordinates.forEach((ring: any) => {
              ring.forEach((coord: number[]) => {
                 allLatlngs.push([coord[1], coord[0]]); // GeoJSON is [lng, lat], Leaflet is [lat, lng]
              });
           });
        } else if (a.boundary && a.boundary.type === 'MultiPolygon') {
           a.boundary.coordinates.forEach((poly: any) => {
              poly.forEach((ring: any) => {
                 ring.forEach((coord: number[]) => {
                    allLatlngs.push([coord[1], coord[0]]);
                 });
              });
           });
        }
      });
      if (allLatlngs.length > 0) {
        const bounds = L.latLngBounds(allLatlngs);
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [areas.length]);

  // Focus map on specific area when requested
  useEffect(() => {
    if (mapRef.current && focusedArea !== null && areas[focusedArea.index]) {
      const a = areas[focusedArea.index];
      const allLatlngs: L.LatLngExpression[] = [];
      if (a.boundary && a.boundary.type === 'Point') {
         allLatlngs.push([a.boundary.coordinates[1], a.boundary.coordinates[0]]);
      } else if (a.boundary && a.boundary.type === 'Polygon') {
         a.boundary.coordinates.forEach((ring: any) => {
            ring.forEach((coord: number[]) => allLatlngs.push([coord[1], coord[0]]));
         });
      } else if (a.boundary && a.boundary.type === 'MultiPolygon') {
         a.boundary.coordinates.forEach((poly: any) => {
            poly.forEach((ring: any) => {
               ring.forEach((coord: number[]) => allLatlngs.push([coord[1], coord[0]]));
            });
         });
      }
      if (allLatlngs.length > 0) {
        const bounds = L.latLngBounds(allLatlngs);
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [focusedArea]);

  const _onCreated = async (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    
    const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    let locationContext = '';

    try {
      let lat = 0;
      let lon = 0;
      
      if (geojson.geometry.type === 'Point') {
        lon = geojson.geometry.coordinates[0];
        lat = geojson.geometry.coordinates[1];
      } else if (geojson.geometry.type === 'Polygon') {
        lon = geojson.geometry.coordinates[0][0][0];
        lat = geojson.geometry.coordinates[0][0][1];
      }
      
      if (lat !== 0 && lon !== 0) {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { 'User-Agent': 'OnCallWeb/1.0' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.address) {
             const contextParts = [];
             if (data.address.city || data.address.town || data.address.village) {
               contextParts.push(data.address.city || data.address.town || data.address.village);
             }
             if (data.address.county || data.address.state) {
               contextParts.push(data.address.county || data.address.state);
             }
             if (data.address.country) {
               contextParts.push(data.address.country);
             }
             if (contextParts.length > 0) {
               locationContext = ` - ${contextParts.join(', ')}`;
             }
          }
        }
      }
    } catch (err) {
      console.error('Reverse geocoding failed', err);
    }
    
    const newArea: Area = {
      name: `Custom Zone ${shortCode}${locationContext}`,
      boundary: geojson.geometry,
      type: drawMode
    };
    onAreasChange([...areas, newArea]);
    
    if (featureGroupRef.current) {
       featureGroupRef.current.removeLayer(layer);
    }
  };

  if (!isMounted) {
    return <div className="h-[500px] w-full rounded-xl bg-secondary-100 dark:bg-primary-700 animate-pulse flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-secondary-600/20 z-0">
      <MapContainer 
        key="map-container"
        center={[51.505, -0.09]} 
        zoom={6} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <style>{`
          .leaflet-draw-toolbar { display: none !important; }
        `}</style>
        
        <FeatureGroup ref={featureGroupRef}>
          {!readOnly && (
            <EditControl
              key={`edit-control-${drawMode}`}
            position="topright"
            onCreated={_onCreated}
            edit={{ edit: false, remove: false }}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: { color: '#e1e100', message: '<strong>Oh snap!<strong> you can\'t draw that!' },
                shapeOptions: { color: drawMode === 'exclude' ? '#ef4444' : '#3b82f6' }
              }
            }}
          />
          )}
        </FeatureGroup>

        {areas.map((area, idx) => {
          if (!area.boundary) return null;
          
          const isExclude = area.type === 'exclude';
          const color = isExclude ? '#ef4444' : '#3b82f6';
          
          // GeoJSON to LatLng for Polygon rendering
          let positions: any[] = [];
          let centerLatLng: [number, number];

          if (area.boundary.type === 'Point') {
             centerLatLng = [area.boundary.coordinates[1], area.boundary.coordinates[0]];
          } else {
            if (area.boundary.type === 'Polygon') {
               positions = area.boundary.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
            } else if (area.boundary.type === 'MultiPolygon') {
               positions = area.boundary.coordinates.map((poly: any) => 
                 poly[0].map((coord: number[]) => [coord[1], coord[0]])
               );
            }

            if (positions.length === 0) return null;

            // Calculate simple bounding box center for the marker
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            const processCoord = (p: number[]) => {
              if (p[0] < minLat) minLat = p[0];
              if (p[0] > maxLat) maxLat = p[0];
              if (p[1] < minLng) minLng = p[1];
              if (p[1] > maxLng) maxLng = p[1];
            };
            
            if (area.boundary.type === 'Polygon') {
              positions.forEach(processCoord);
            } else {
              positions.forEach(poly => poly.forEach(processCoord));
            }
            centerLatLng = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
          }

          return (
            <FeatureGroup key={idx}>
              {positions.length > 0 && (
                <Polygon 
                  positions={positions} 
                  pathOptions={{ 
                    color, 
                    fillColor: color, 
                    fillOpacity: 0.2,
                    weight: 2
                  }} 
                />
              )}
              <Marker position={centerLatLng} icon={createPinIcon(color)}>
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <span className="font-semibold">{area.name || `Custom ${isExclude ? 'Exclude' : 'Include'} Zone`}</span>
                </Tooltip>
                <Popup autoPan={false}>
                  <div className="text-center p-1 w-48">
                    <p className="font-semibold text-text-dark mb-3 text-sm leading-tight">
                      {area.name || `Custom ${isExclude ? 'Exclude' : 'Include'} Zone`}
                    </p>
                    {!readOnly && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newAreas = [...areas];
                          newAreas.splice(idx, 1);
                          onAreasChange(newAreas);
                        }}
                        className="w-full px-3 py-1.5 bg-error/10 text-error font-bold text-xs rounded-md border border-error/20 hover:bg-error hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                      >
                        Delete Zone
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </FeatureGroup>
          );
        })}
      </MapContainer>
    </div>
  );
}
