import { ResponseHandler, INTERNAL_CODES, HTTP_STATUS } from '@utils/responseHandler';
import { JwtHelper } from '@utils/jwtHelper';

export class LocationController {
	private static async authenticate(requestHelper: any) {
		const token = JwtHelper.extractFromHeader(requestHelper.header('authorization'));
		if (!token) return { error: ResponseHandler.error('Unauthorized', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		const payload = JwtHelper.verify(token);
		if (!payload) return { error: ResponseHandler.error('Invalid or expired token', INTERNAL_CODES.AUTHENTICATION_ERROR, HTTP_STATUS.UNAUTHORIZED) };

		return { payload };
	}

  static async searchNominatim(requestHelper: any) {
    const auth = await LocationController.authenticate(requestHelper);
		if (auth.error) return auth.error;

    const { searchParams } = requestHelper;
    const query = searchParams.q;
    const viewbox = searchParams.viewbox;

    if (!query) {
      return ResponseHandler.error('Query parameter "q" is required', INTERNAL_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    try {
      let data = [];
      
      // Check if query is a UK postcode
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
        let nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&polygon_geojson=1`;
        if (viewbox) nominatimUrl += `&viewbox=${viewbox}`;

        const response = await fetch(nominatimUrl, { headers: { 'User-Agent': 'OnCallWeb/1.0' } });
        if (!response.ok) throw new Error(`Nominatim API responded with status: ${response.status}`);
        data = await response.json();
      }
      return ResponseHandler.success(data, 'Locations fetched successfully');
    } catch (error: any) {
      console.error('Error fetching from Nominatim:', error);
      return ResponseHandler.error('Failed to fetch location data', INTERNAL_CODES.EXTERNAL_SERVICE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
