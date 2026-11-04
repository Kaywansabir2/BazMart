/**
 * Dark Store Delivery Zones & Geofencing Validator
 */

export interface DeliveryZone {
  id: string;
  name: string;
  warehouseId: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

export const ACTIVE_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-erbil',
    name: 'Erbil Metropolitan & Suburbs',
    warehouseId: 'erbil-central-darkstore',
    centerLat: 36.1911,
    centerLng: 44.0092,
    radiusKm: 30.0,
  },
  {
    id: 'zone-sulaymaniyah',
    name: 'Sulaymaniyah City & Surroundings',
    warehouseId: 'suly-main-darkstore',
    centerLat: 35.5669,
    centerLng: 45.4167,
    radiusKm: 30.0,
  },
  {
    id: 'zone-duhok',
    name: 'Duhok Central Zone',
    warehouseId: 'erbil-central-darkstore', // Served via Kurdistan Dark Store Network
    centerLat: 36.8679,
    centerLng: 42.9886,
    radiusKm: 25.0,
  },
  {
    id: 'zone-baghdad',
    name: 'Baghdad Urban District',
    warehouseId: 'erbil-central-darkstore',
    centerLat: 33.3152,
    centerLng: 44.3661,
    radiusKm: 35.0,
  },
];

/**
 * Calculates Great-Circle distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validates GPS coordinates against active dark store zones
 */
export function validateDeliveryGeofence(
  lat?: number,
  lng?: number,
): {
  inZone: boolean;
  matchedZone?: DeliveryZone;
  distanceKm?: number;
  closestZoneName?: string;
} {
  // If no GPS coordinates provided, allow address text fallback
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return { inZone: true };
  }

  let closestZone: DeliveryZone | undefined;
  let minDistance = Infinity;

  for (const zone of ACTIVE_DELIVERY_ZONES) {
    const dist = calculateDistanceKm(lat, lng, zone.centerLat, zone.centerLng);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
    if (dist <= zone.radiusKm) {
      return {
        inZone: true,
        matchedZone: zone,
        distanceKm: Math.round(dist * 10) / 10,
      };
    }
  }

  return {
    inZone: false,
    distanceKm: Math.round(minDistance * 10) / 10,
    closestZoneName: closestZone ? closestZone.name : 'Active Zones',
  };
}

