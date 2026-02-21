interface RouteResponse {
  features: Array<{
    properties: {
      time: number;
      distance: number;
    };
  }>;
}

interface ETAResult {
  durationMinutes: number;
  distanceKm: number;
  success: boolean;
  error?: string;
}

const RATE_LIMIT_CACHE = new Map<string, { eta: ETAResult; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000;

export async function calculateETA(
  fromLat: number,
  fromLng: number,
  toAddress: string
): Promise<ETAResult> {
  const cacheKey = `${fromLat},${fromLng}-${toAddress}`;
  const cached = RATE_LIMIT_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.eta;
  }

  try {
    const geocodeResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        toAddress
      )}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_KEY}`
    );

    if (geocodeResponse.status === 429) {
      return {
        success: false,
        error: "Rate limit exceeded",
        durationMinutes: 0,
        distanceKm: 0,
      };
    }

    if (!geocodeResponse.ok) {
      throw new Error("Geocoding failed");
    }

    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.features || geocodeData.features.length === 0) {
      return {
        success: false,
        error: "Address not found",
        durationMinutes: 0,
        distanceKm: 0,
      };
    }

    const toLng = geocodeData.features[0].properties.lon;
    const toLat = geocodeData.features[0].properties.lat;

    const routeResponse = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}&mode=drive&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_KEY}`
    );

    if (routeResponse.status === 429) {
      return {
        success: false,
        error: "Rate limit exceeded",
        durationMinutes: 0,
        distanceKm: 0,
      };
    }

    if (!routeResponse.ok) {
      throw new Error("Routing failed");
    }

    const routeData: RouteResponse = await routeResponse.json();

    if (!routeData.features || routeData.features.length === 0) {
      return {
        success: false,
        error: "Route not found",
        durationMinutes: 0,
        distanceKm: 0,
      };
    }

    const result: ETAResult = {
      success: true,
      durationMinutes: Math.round(routeData.features[0].properties.time / 60),
      distanceKm: Math.round(routeData.features[0].properties.distance / 1000),
    };

    RATE_LIMIT_CACHE.set(cacheKey, { eta: result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error("ETA calculation error:", error);
    return {
      success: false,
      error: "ETA calculation failed",
      durationMinutes: 0,
      distanceKm: 0,
    };
  }
}
