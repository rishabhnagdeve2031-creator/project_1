/**
 * Telemetry Event Types & Handler Contracts for Wildlife Alert System Integration
 */

export interface PositionPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface AnimalMovementEvent {
  animalId: string;
  name: string;
  currentPosition: PositionPoint;
  previousPosition: PositionPoint | null;
  movementHistory: PositionPoint[];
  currentSpeed: number; // in km/h
  currentZone: string;
  previousZone: string;
}

// Backwards-compat alias
export type TigerMovementEvent = AnimalMovementEvent;

/**
 * Handler signature for individual animal movement updates
 */
export type AnimalMovedHandler = (event: AnimalMovementEvent) => void;
export type TigerMovedHandler = AnimalMovedHandler;

/**
 * Handler signature for full telemetry batch updates
 */
export type TelemetryBatchHandler = (events: AnimalMovementEvent[]) => void;
