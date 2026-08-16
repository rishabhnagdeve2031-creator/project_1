/**
 * PenchGuard AI — Tiger Telemetry Data
 * Pench Tiger Reserve — Prototype Data
 */

export type AnimalSpecies = 'tiger';

export interface PathPoint {
  lat: number;
  lng: number;
  timestamp?: string;
}

export interface Animal {
  id: string;
  name: string;
  species: AnimalSpecies;
  emoji: string;
  lat: number;
  lng: number;
  currentZone: string;
  previousZone: string;
  speed: number;        // km/h (current)
  maxSpeed: number;     // km/h (species max for gauge scaling)
  color: string;
  pathHistory: PathPoint[];
}

// ── Backwards-compatibility alias ──
export type Tiger = Animal;

/**
 * Pench Tiger Reserve approximate center: 21.72°N, 79.30°E
 * Core Zone: ~21.68–21.78°N, ~79.25–79.38°E
 * Buffer Zone: expanded ring
 * Sensitive/Boundary Zone: outermost ring
 */
export const ANIMALS: Animal[] = [
  {
    id: 'TGR-01',
    name: 'Sultan',
    species: 'tiger',
    emoji: '🐅',
    lat: 21.7350,
    lng: 79.3120,
    currentZone: 'Core Zone',
    previousZone: 'Core Zone',
    speed: 3.5,
    maxSpeed: 56,
    color: '#f97316',
    pathHistory: [
      { lat: 21.7310, lng: 79.3080, timestamp: '08:30 AM' },
      { lat: 21.7325, lng: 79.3095, timestamp: '09:00 AM' },
      { lat: 21.7338, lng: 79.3108, timestamp: '09:30 AM' },
      { lat: 21.7350, lng: 79.3120, timestamp: '10:00 AM' }
    ]
  },
  {
    id: 'TGR-02',
    name: 'Shera',
    species: 'tiger',
    emoji: '🐅',
    lat: 21.7180,
    lng: 79.2850,
    currentZone: 'Buffer Zone',
    previousZone: 'Core Zone',
    speed: 4.2,
    maxSpeed: 56,
    color: '#eab308',
    pathHistory: [
      { lat: 21.7260, lng: 79.2980, timestamp: '08:30 AM' },
      { lat: 21.7235, lng: 79.2940, timestamp: '09:00 AM' },
      { lat: 21.7210, lng: 79.2900, timestamp: '09:30 AM' },
      { lat: 21.7180, lng: 79.2850, timestamp: '10:00 AM' }
    ]
  },
  {
    id: 'TGR-03',
    name: 'Maya',
    species: 'tiger',
    emoji: '🐅',
    lat: 21.7520,
    lng: 79.3450,
    currentZone: 'Core Zone',
    previousZone: 'Core Zone',
    speed: 2.8,
    maxSpeed: 56,
    color: '#8b5cf6',
    pathHistory: [
      { lat: 21.7490, lng: 79.3400, timestamp: '08:30 AM' },
      { lat: 21.7500, lng: 79.3420, timestamp: '09:00 AM' },
      { lat: 21.7510, lng: 79.3435, timestamp: '09:30 AM' },
      { lat: 21.7520, lng: 79.3450, timestamp: '10:00 AM' }
    ]
  },
  {
    id: 'TGR-07',
    name: 'Kali',
    species: 'tiger',
    emoji: '🐅',
    lat: 21.6920,
    lng: 79.2600,
    currentZone: 'Boundary Zone',
    previousZone: 'Buffer Zone',
    speed: 5.1,
    maxSpeed: 56,
    color: '#ef4444',
    pathHistory: [
      { lat: 21.7200, lng: 79.3050, timestamp: '08:12 AM' },
      { lat: 21.7100, lng: 79.2900, timestamp: '09:20 AM' },
      { lat: 21.7000, lng: 79.2750, timestamp: '10:20 AM' },
      { lat: 21.6920, lng: 79.2600, timestamp: '10:42 AM' }
    ]
  }
];

// Backwards-compat
export const TIGERS = ANIMALS;

export const SPECIES_LABELS: Record<AnimalSpecies, string> = {
  tiger: 'Tiger',
};
