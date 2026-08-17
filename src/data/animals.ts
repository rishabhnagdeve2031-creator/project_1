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
    lat: 21.7600,
    lng: 79.3380,
    currentZone: 'Core Zone',
    previousZone: 'Core Zone',
    speed: 3.5,
    maxSpeed: 56,
    color: '#f97316',
    pathHistory: [
      { lat: 21.7570, lng: 79.3350, timestamp: '08:30 AM' },
      { lat: 21.7580, lng: 79.3360, timestamp: '09:00 AM' },
      { lat: 21.7590, lng: 79.3370, timestamp: '09:30 AM' },
      { lat: 21.7600, lng: 79.3380, timestamp: '10:00 AM' }
    ]
  },
  {
    id: 'TGR-02',
    name: 'Shera',
    species: 'tiger',
    emoji: '🐅',
    lat: 21.7170,
    lng: 79.2820,
    currentZone: 'Buffer Zone',
    previousZone: 'Core Zone',
    speed: 4.2,
    maxSpeed: 56,
    color: '#eab308',
    pathHistory: [
      { lat: 21.7130, lng: 79.2780, timestamp: '08:30 AM' },
      { lat: 21.7145, lng: 79.2795, timestamp: '09:00 AM' },
      { lat: 21.7160, lng: 79.2810, timestamp: '09:30 AM' },
      { lat: 21.7170, lng: 79.2820, timestamp: '10:00 AM' }
    ]
  },
  {
    id: 'TGR-03',
    name: 'Maya',
    species: 'tiger',
    emoji: '🐅',
    lat: 21.7600,
    lng: 79.2860,
    currentZone: 'Core Zone',
    previousZone: 'Core Zone',
    speed: 2.8,
    maxSpeed: 56,
    color: '#8b5cf6',
    pathHistory: [
      { lat: 21.7570, lng: 79.2830, timestamp: '08:30 AM' },
      { lat: 21.7580, lng: 79.2840, timestamp: '09:00 AM' },
      { lat: 21.7590, lng: 79.2850, timestamp: '09:30 AM' },
      { lat: 21.7600, lng: 79.2860, timestamp: '10:00 AM' }
    ]
  },
  {
    id: 'TGR-07',
    name: 'Kali',
    species: 'tiger',
    emoji: '🐅',
    lat: 21.6960,
    lng: 79.3310,
    currentZone: 'Boundary Zone',
    previousZone: 'Buffer Zone',
    speed: 5.1,
    maxSpeed: 56,
    color: '#ef4444',
    pathHistory: [
      { lat: 21.6930, lng: 79.3280, timestamp: '08:12 AM' },
      { lat: 21.6940, lng: 79.3290, timestamp: '09:20 AM' },
      { lat: 21.6950, lng: 79.3300, timestamp: '10:20 AM' },
      { lat: 21.6960, lng: 79.3310, timestamp: '10:42 AM' }
    ]
  }
];

// Backwards-compat
export const TIGERS = ANIMALS;

export const SPECIES_LABELS: Record<AnimalSpecies, string> = {
  tiger: 'Tiger',
};