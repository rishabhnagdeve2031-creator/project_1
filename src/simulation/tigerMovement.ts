import type { Tiger, PathPoint } from '../data/tigers';

export interface TigerVectorState {
  heading: number; // heading direction in degrees (0 - 360)
  currentSpeed: number; // speed in km/h
}

// Map maintaining vector heading and speed state per tiger
const tigerVectorMap = new Map<string, TigerVectorState>();

/**
 * Bounds for Jim Corbett National Park Core Zone
 * Lat: 29.5050° N to 29.5650° N
 * Lng: 78.8350° E to 78.9350° E
 */
const BOUNDS = {
  minLat: 29.5050,
  maxLat: 29.5650,
  minLng: 78.8350,
  maxLng: 78.9350
};

/**
 * Calculates the next position for a tiger based on realistic movement vector,
 * heading inertia, and natural wandering algorithm.
 */
export function calculateNextPosition(tiger: Tiger): Tiger {
  let vector = tigerVectorMap.get(tiger.id);

  if (!vector) {
    // Initial random vector heading (0 - 360 degrees)
    vector = {
      heading: Math.floor(Math.random() * 360),
      currentSpeed: tiger.speed || 3.5
    };
    tigerVectorMap.set(tiger.id, vector);
  }

  // 1. Natural Heading Inertia: Apply subtle direction change (-12 to +12 degrees)
  const headingVariation = (Math.random() - 0.5) * 24;
  vector.heading = (vector.heading + headingVariation + 360) % 360;

  // 2. Speed Variation: Small continuous speed adjustment (+/- 0.2 km/h)
  const speedVariation = (Math.random() - 0.5) * 0.4;
  vector.currentSpeed = Math.min(5.5, Math.max(1.8, vector.currentSpeed + speedVariation));

  // 3. Convert speed (km/h) to geographic coordinates per 2-second tick tick
  // 1 degree latitude ≈ 111 km => 1 km = (1 / 111) degrees
  // Distance covered in 2 seconds at currentSpeed km/h: d = (currentSpeed / 3600) * 2 km
  const kmInTwoSeconds = (vector.currentSpeed / 3600) * 2;
  // Apply a subtle visual scale factor for map presentation (approx 15-30m per tick)
  const deltaDegreesBase = (kmInTwoSeconds / 111) * 3.5;

  const headingRadians = (vector.heading * Math.PI) / 180;
  const deltaLat = Math.cos(headingRadians) * deltaDegreesBase;
  // Adjust longitude delta for cos(lat) map projection factor
  const cosLat = Math.cos((tiger.lat * Math.PI) / 180);
  const deltaLng = (Math.sin(headingRadians) * deltaDegreesBase) / (cosLat || 1);

  let newLat = tiger.lat + deltaLat;
  let newLng = tiger.lng + deltaLng;

  // 4. Core Zone Boundary Redirection: If close to edge, bounce heading inward
  if (newLat > BOUNDS.maxLat || newLat < BOUNDS.minLat || newLng > BOUNDS.maxLng || newLng < BOUNDS.minLng) {
    // Reverse vector with slight random offset
    vector.heading = (vector.heading + 180 + (Math.random() - 0.5) * 40) % 360;
    // Re-calculate small step inward
    const turnRadians = (vector.heading * Math.PI) / 180;
    newLat = tiger.lat + Math.cos(turnRadians) * (deltaDegreesBase * 0.5);
    newLng = tiger.lng + (Math.sin(turnRadians) * deltaDegreesBase * 0.5) / (cosLat || 1);
  }

  // Clamped precision to prevent floating point inaccuracies
  newLat = Number(newLat.toFixed(6));
  newLng = Number(newLng.toFixed(6));

  // 5. Update Path History
  const now = new Date();
  const timestampStr = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const updatedPathHistory: PathPoint[] = [
    ...tiger.pathHistory,
    { lat: newLat, lng: newLng, timestamp: timestampStr }
  ].slice(-30); // Maintain recent 30 telemetry points

  return {
    ...tiger,
    lat: newLat,
    lng: newLng,
    speed: Number(vector.currentSpeed.toFixed(1)),
    pathHistory: updatedPathHistory
  };
}

/**
 * Resets cached movement vectors for all tigers.
 */
export function resetTigerVectors(): void {
  tigerVectorMap.clear();
}

