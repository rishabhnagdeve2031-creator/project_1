/**
 * Telemetry Event Types & Handler Contracts for Wildlife Alert System Integration
 */

export interface PositionPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface TigerMovementEvent {
  tigerId: string;
  name: string;
  currentPosition: PositionPoint;
  previousPosition: PositionPoint | null;
  movementHistory: PositionPoint[];
  currentSpeed: number; // in km/h
  currentZone: string;
  previousZone: string;
}

/**
 * Handler signature for individual tiger movement updates
 */
export type TigerMovedHandler = (event: TigerMovementEvent) => void;

/**
 * Handler signature for full telemetry batch updates
 */
export type TelemetryBatchHandler = (events: TigerMovementEvent[]) => void;
