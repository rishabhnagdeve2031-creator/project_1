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

const SIMULATION_SPEEDS: Record<string, number> = {
  'TGR-03': 120, // Maya: 120 km/h simulation rate
  'TGR-01': 70,  // Sultan: 70 km/h simulation rate
  'TGR-02': 60,  // Shera: 60 km/h simulation rate
  'TGR-07': 40   // Kali: 40 km/h simulation rate
};

const NON_CROSSING_TERRITORY_BOUNDS: Record<string, { centerLat: number; centerLng: number; minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  'TGR-03': { centerLat: 21.7620, centerLng: 79.2840, minLat: 21.7480, maxLat: 21.7740, minLng: 79.2680, maxLng: 79.2980 },
  'TGR-01': { centerLat: 21.7610, centerLng: 79.3360, minLat: 21.7480, maxLat: 21.7740, minLng: 79.3240, maxLng: 79.3500 },
  'TGR-02': { centerLat: 21.7170, centerLng: 79.2810, minLat: 21.7040, maxLat: 21.7280, minLng: 79.2680, maxLng: 79.2940 },
};

/**
 * Calculates the next position for an animal based on realistic movement vector,
 * heading inertia, and natural wandering algorithm.
 */
export function calculateNextPosition(animal: Animal): Animal {
  let vector = animalVectorMap.get(animal.id);
  const simSpeed = SIMULATION_SPEEDS[animal.id] || animal.speed || 50;

  if (!vector) {
    if (animal.id === 'TGR-07') {
      // Dedicated path for Kali: starts inside, travels North-East toward and across territory boundary
      vector = {
        heading: 40,
        currentSpeed: simSpeed
      };
    } else {
      vector = {
        heading: Math.floor(Math.random() * 360),
        currentSpeed: simSpeed
      };
    }
    animalVectorMap.set(animal.id, vector);
  }

  // 1. Natural Heading Inertia
  const headingVariation = animal.id === 'TGR-07' ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 24;
  vector.heading = (vector.heading + headingVariation + 360) % 360;

  // 2. Convert simulation speed (km/h) to geographic coordinates per 2-second tick
  // 1 degree latitude ≈ 111 km => 1 km = (1 / 111) degrees
  const kmInTwoSeconds = (simSpeed / 3600) * 2;
  const deltaDegreesBase = (kmInTwoSeconds / 111) * 3.5;

  const headingRadians = (vector.heading * Math.PI) / 180;
  const deltaLat = Math.cos(headingRadians) * deltaDegreesBase;
  const cosLat = Math.cos((animal.lat * Math.PI) / 180);
  const deltaLng = (Math.sin(headingRadians) * deltaDegreesBase) / (cosLat || 1);

  let newLat = animal.lat + deltaLat;
  let newLng = animal.lng + deltaLng;

  // 3. For non-crossing tigers: bounce heading inward so they stay inside their territory
  const territory = NON_CROSSING_TERRITORY_BOUNDS[animal.id];
  if (territory && animal.id !== 'TGR-07') {
    if (newLat > territory.maxLat || newLat < territory.minLat || newLng > territory.maxLng || newLng < territory.minLng) {
      const angleToCenter = (Math.atan2(territory.centerLng - animal.lng, territory.centerLat - animal.lat) * 180) / Math.PI;
      vector.heading = (angleToCenter + 360 + (Math.random() - 0.5) * 30) % 360;
      const turnRadians = (vector.heading * Math.PI) / 180;
      newLat = animal.lat + Math.cos(turnRadians) * (deltaDegreesBase * 0.7);
      newLng = animal.lng + (Math.sin(turnRadians) * deltaDegreesBase * 0.7) / (cosLat || 1);
    }
  }

  // 4. Outer Reserve Boundary Redirection
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
