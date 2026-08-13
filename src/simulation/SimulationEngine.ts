import type { Tiger } from '../data/tigers';
import { calculateNextPosition, resetTigerVectors } from './tigerMovement';
import type { ITelemetryProvider } from './interfaces/ITelemetryProvider';
import type {
  TigerMovementEvent,
  TigerMovedHandler,
  TelemetryBatchHandler,
  PositionPoint
} from './types';

export type SimulationListener = (tigers: Tiger[]) => void;

/**
 * SimulationEngine
 * High-performance, isolated simulation engine that manages wildlife movement state,
 * executes ticks on a 2-second interval loop, and implements ITelemetryProvider for AlertManager integration.
 */
export class SimulationEngine implements ITelemetryProvider {
  private tigers: Tiger[];
  private previousPositionsMap: Map<string, PositionPoint> = new Map();
  private timerId: number | null = null;
  private isRunning: boolean = false;

  private batchListeners: Set<TelemetryBatchHandler> = new Set();
  private tigerMovedListeners: Set<TigerMovedHandler> = new Set();
  private readonly TICK_INTERVAL_MS: number = 2000; // 2 seconds update requirement

  constructor(initialTigers: Tiger[]) {
    this.tigers = initialTigers.map((t) => ({ ...t, pathHistory: [...t.pathHistory] }));
    // Record initial positions
    this.recordPreviousPositions(this.tigers);
  }

  /**
   * Starts the 2-second simulation tick loop.
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerId = window.setInterval(() => {
      this.tick();
    }, this.TICK_INTERVAL_MS);
  }

  /**
   * Stops the tick simulation loop.
   */
  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Resets the simulation to the initial tiger coordinates and clears vector state.
   */
  public reset(initialTigers: Tiger[]): void {
    this.stop();
    resetTigerVectors();
    this.previousPositionsMap.clear();
    this.tigers = initialTigers.map((t) => ({
      ...t,
      pathHistory: [...t.pathHistory]
    }));
    this.recordPreviousPositions(this.tigers);
    this.emit(this.getLatestTelemetry());
  }

  /**
   * Executes a single simulation step tick.
   * Updates latitude, longitude, speed, and path history for all tigers.
   */
  public tick(): void {
    const updatedTigers = this.tigers.map((tiger) => {
      // Store current position as previous before moving
      this.previousPositionsMap.set(tiger.id, {
        lat: tiger.lat,
        lng: tiger.lng,
        timestamp: tiger.pathHistory[tiger.pathHistory.length - 1]?.timestamp || new Date().toLocaleTimeString()
      });

      return calculateNextPosition(tiger);
    });

    this.tigers = updatedTigers;
    const events = this.buildTelemetryEvents(this.tigers);
    this.emit(events);
  }

  // --- ITelemetryProvider Implementation for Alert System Integration ---

  /**
   * Subscribes a handler to individual tiger movement events.
   */
  public onTigerMoved(handler: TigerMovedHandler): () => void {
    this.tigerMovedListeners.add(handler);
    return () => {
      this.tigerMovedListeners.delete(handler);
    };
  }

  /**
   * Subscribes a handler to batch telemetry updates.
   */
  public subscribe(handler: TelemetryBatchHandler): () => void {
    this.batchListeners.add(handler);
    // Immediately provide current telemetry snapshot
    handler(this.getLatestTelemetry());

    return () => {
      this.batchListeners.delete(handler);
    };
  }

  /**
   * Unsubscribes a listener handler.
   */
  public unsubscribe(handler: TigerMovedHandler | TelemetryBatchHandler): void {
    this.tigerMovedListeners.delete(handler as TigerMovedHandler);
    this.batchListeners.delete(handler as TelemetryBatchHandler);
  }

  /**
   * Emits telemetry movement events to all registered batch and single-movement handlers.
   */
  public emit(events: TigerMovementEvent[]): void {
    // Notify batch subscribers
    this.batchListeners.forEach((handler) => handler(events));

    // Notify individual tiger movement subscribers
    events.forEach((event) => {
      this.tigerMovedListeners.forEach((handler) => handler(event));
    });
  }

  /**
   * Returns the most recent telemetry snapshot as TigerMovementEvent objects.
   */
  public getLatestTelemetry(): TigerMovementEvent[] {
    return this.buildTelemetryEvents(this.tigers);
  }

  /**
   * Returns a copy of the current state of all tigers.
   */
  public getTigers(): Tiger[] {
    return this.tigers.map((t) => ({ ...t, pathHistory: [...t.pathHistory] }));
  }

  /**
   * Returns whether the simulation loop is currently active.
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  // --- Private Helpers ---

  private recordPreviousPositions(tigers: Tiger[]): void {
    tigers.forEach((tiger) => {
      this.previousPositionsMap.set(tiger.id, {
        lat: tiger.lat,
        lng: tiger.lng,
        timestamp: tiger.pathHistory[tiger.pathHistory.length - 1]?.timestamp || new Date().toLocaleTimeString()
      });
    });
  }

  private buildTelemetryEvents(tigers: Tiger[]): TigerMovementEvent[] {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return tigers.map((tiger) => {
      const prev = this.previousPositionsMap.get(tiger.id) || null;

      const movementHistory: PositionPoint[] = tiger.pathHistory.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        timestamp: p.timestamp || now
      }));

      return {
        tigerId: tiger.id,
        name: tiger.name,
        currentPosition: {
          lat: tiger.lat,
          lng: tiger.lng,
          timestamp: now
        },
        previousPosition: prev,
        movementHistory,
        currentSpeed: tiger.speed,
        currentZone: tiger.currentZone,
        previousZone: tiger.previousZone
      };
    });
  }
}
