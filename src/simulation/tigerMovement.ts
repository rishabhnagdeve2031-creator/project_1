import type { Animal, PathPoint } from '../data/animals';

export interface AnimalVectorState {
  heading: number;      // heading direction in degrees (0 - 360)
  currentSpeed: number; // speed in km/h
}

// Map maintaining vector heading and speed state per animal
const animalVectorMap = new Map<string, AnimalVectorState>();

/**
 * Bounds for Pench Tiger Reserve & surrounding zones (Nagpur/Seoni region)
 * Lat: 21.650° N to 21.800° N
 * Lng: 79.200° E to 79.400° E
 */
const BOUNDS = {
  minLat: 21.650,
  maxLat: 21.800,
  minLng: 79.200,
  maxLng: 79.400
};

/**
 * Species-specific speed ranges (min, max) in km/h
 */
const SPEED_RANGES: Record<string, { min: number; max: number }> = {
  tiger:      { min: 1.5, max: 8.0 },
  elephant:   { min: 0.8, max: 4.5 },
  leopard:    { min: 2.0, max: 9.5 },
  deer:       { min: 2.0, max: 10.0 },
  wild_dog:   { min: 3.0, max: 11.0 },
  sloth_bear: { min: 0.5, max: 3.5 }
};

/**
 * Calculates the next position for an animal based on realistic movement vector,
 * heading inertia, and natural wandering algorithm.
 */
export function calculateNextPosition(animal: Animal): Animal {
  let vector = animalVectorMap.get(animal.id);
  const speedRange = SPEED_RANGES[animal.species] || { min: 1.0, max: 5.0 };

  if (!vector) {
    if (animal.id === 'TGR-07') {
      // Dedicated path for Kali: starts inside, travels North-East toward and across territory boundary
      vector = {
        heading: 40,
        currentSpeed: 6.2
      };
    } else {
      vector = {
        heading: Math.floor(Math.random() * 360),
        currentSpeed: animal.speed || speedRange.min + Math.random() * (speedRange.max - speedRange.min)
      };
    }
    animalVectorMap.set(animal.id, vector);
  }

  // 1. Natural Heading Inertia: Apply subtle direction change (-12 to +12 degrees, smaller for Kali to maintain trajectory)
  const headingVariation = animal.id === 'TGR-07' ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 24;
  vector.heading = (vector.heading + headingVariation + 360) % 360;

  // 2. Speed Variation: Small continuous speed adjustment (+/- 0.3 km/h)
  const speedVariation = (Math.random() - 0.5) * 0.6;
  vector.currentSpeed = Math.min(speedRange.max, Math.max(speedRange.min, vector.currentSpeed + speedVariation));

  // 3. Convert speed (km/h) to geographic coordinates per 2-second tick
  // 1 degree latitude ≈ 111 km => 1 km = (1 / 111) degrees
  // Distance covered in 2 seconds at currentSpeed km/h: d = (currentSpeed / 3600) * 2 km
  const kmInTwoSeconds = (vector.currentSpeed / 3600) * 2;
  // Visual scale factor for map presentation
  const deltaDegreesBase = (kmInTwoSeconds / 111) * 3.5;

  const headingRadians = (vector.heading * Math.PI) / 180;
  const deltaLat = Math.cos(headingRadians) * deltaDegreesBase;
  // Adjust longitude delta for cos(lat) map projection factor
  const cosLat = Math.cos((animal.lat * Math.PI) / 180);
  const deltaLng = (Math.sin(headingRadians) * deltaDegreesBase) / (cosLat || 1);

  let newLat = animal.lat + deltaLat;
  let newLng = animal.lng + deltaLng;

  // 4. Core Zone Boundary Redirection: If close to edge, bounce heading inward
  if (newLat > BOUNDS.maxLat || newLat < BOUNDS.minLat || newLng > BOUNDS.maxLng || newLng < BOUNDS.minLng) {
    vector.heading = (vector.heading + 180 + (Math.random() - 0.5) * 40) % 360;
    const turnRadians = (vector.heading * Math.PI) / 180;
    newLat = animal.lat + Math.cos(turnRadians) * (deltaDegreesBase * 0.5);
    newLng = animal.lng + (Math.sin(turnRadians) * deltaDegreesBase * 0.5) / (cosLat || 1);
  }

  // Clamped precision
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
    ...animal.pathHistory,
    { lat: newLat, lng: newLng, timestamp: timestampStr }
  ].slice(-30); // Maintain recent 30 telemetry points

  return {
    ...animal,
    lat: newLat,
    lng: newLng,
    speed: Number(vector.currentSpeed.toFixed(2)),
    pathHistory: updatedPathHistory
  };
}

/**
 * Resets cached movement vectors for all animals.
 */
export function resetTigerVectors(): void {
  animalVectorMap.clear();
}

export function resetAnimalVectors(): void {
  animalVectorMap.clear();
}
