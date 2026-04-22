import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

export interface VerificationArea {
  type: 'include' | 'exclude';
  name?: string | null;
  boundary?: any;
}

export interface VerificationResult {
  status: 'serviced' | 'excluded' | 'not_included';
  matchedIncludeName: string;
  matchedExcludeName: string;
}

/**
 * Verifies if a given geographic point falls within a set of include/exclude areas.
 * Exclude zones always take precedence over Include zones.
 * 
 * @param point - A tuple of [longitude, latitude]
 * @param areas - An array of areas containing GeoJSON boundaries
 * @returns VerificationResult
 */
export function verifyPointInAreas(point: [number, number], areas: VerificationArea[]): VerificationResult {
  let isIncluded = false;
  let isExcluded = false;
  let matchedIncludeName = '';
  let matchedExcludeName = '';

  for (const area of areas) {
    if (!area.boundary) continue;
    
    let pointInArea = false;
    
    if (area.boundary.type === 'Point') {
        const alat = area.boundary.coordinates[1];
        const alon = area.boundary.coordinates[0];
        // ~5km proximity check for points
        if (Math.abs(alat - point[1]) < 0.05 && Math.abs(alon - point[0]) < 0.05) {
          pointInArea = true;
        }
    } else if (area.boundary.type === 'Polygon' || area.boundary.type === 'MultiPolygon') {
        try {
          pointInArea = booleanPointInPolygon(point, area.boundary);
        } catch(e) {
          console.error("Turf verification error:", e);
        }
    }

    if (pointInArea) {
      if (area.type === 'include') {
        isIncluded = true;
        matchedIncludeName = area.name || 'Custom Include Zone';
      } else if (area.type === 'exclude') {
        isExcluded = true;
        matchedExcludeName = area.name || 'Custom Exclude Zone';
      }
    }
  }

  if (isExcluded) {
    return { status: 'excluded', matchedIncludeName, matchedExcludeName };
  } else if (isIncluded) {
    return { status: 'serviced', matchedIncludeName, matchedExcludeName };
  } else {
    return { status: 'not_included', matchedIncludeName, matchedExcludeName };
  }
}
