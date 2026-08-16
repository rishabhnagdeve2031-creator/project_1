import type { Animal } from '../data/animals';
import { calculateNextPosition, resetAnimalVectors } from './tigerMovement';
import type { ITelemetryProvider } from './interfaces/ITelemetryProvider';
import type {
  AnimalMovementEvent,
  AnimalMovedHandler,
  TelemetryBatchHandler,
  PositionPoint
} from './types';

export type SimulationListener = (animals: Animal[]) => void;

/**
 * SimulationEngine
 * High-performance, isolated simulation engine that manages wildlife movement state,
 * executes ticks on a 2-second interval loop, and implements ITelemetryProvider for AlertManager integration.
 */
export class SimulationEngine implements ITelemetryProvider {
  private animals: Animal[];
  private previousPositionsMap: Map<string, PositionPoint> = new Map();
  private timerId: number | null = null;
  private isRunning: boolean = false;

  private batchListeners: Set<TelemetryBatchHandler> = new Set();
  private animalMovedListeners: Set<AnimalMovedHandler> = new Set();
  private readonly TICK_INTERVAL_MS: number = 2000; // 2 seconds update requirement

  constructor(initialAnimals: Animal[]) {
    this.animals = initialAnimals.map((a) => ({ ...a, pathHistory: [...a.pathHistory] }));
    this.recordPreviousPositions(this.animals);
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
   * Resets the simulation to the initial animal coordinates and clears vector state.
   */
  public reset(initialAnimals: Animal[]): void {
    this.stop();
    resetAnimalVectors();
    this.previousPositionsMap.clear();
    this.animals = initialAnimals.map((a) => ({
      ...a,
      pathHistory: [...a.pathHistory]
    }));
    this.recordPreviousPositions(this.animals);
    this.emit(this.getLatestTelemetry());
  }

  /**
   * Executes a single simulation step tick.
   * Updates latitude, longitude, speed, and path history for all animals.
   */
  public tick(): void {
    const updatedAnimals = this.animals.map((animal) => {
      // Store current position as previous before moving
      this.previousPositionsMap.set(animal.id, {
        lat: animal.lat,
        lng: animal.lng,
        timestamp: animal.pathHistory[animal.pathHistory.length - 1]?.timestamp || new Date().toLocaleTimeString()
      });

      return calculateNextPosition(animal);
    });

    this.animals = updatedAnimals;
    const events = this.buildTelemetryEvents(this.animals);
    this.emit(events);
  }

  // --- ITelemetryProvider Implementation for Alert System Integration ---

  /**
   * Subscribes a handler to individual animal movement events.
   */
  public onTigerMoved(handler: AnimalMovedHandler): () => void {
    this.animalMovedListeners.add(handler);
    return () => {
      this.animalMovedListeners.delete(handler);
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
  public unsubscribe(handler: AnimalMovedHandler | TelemetryBatchHandler): void {
    this.animalMovedListeners.delete(handler as AnimalMovedHandler);
    this.batchListeners.delete(handler as TelemetryBatchHandler);
  }

  /**
   * Emits telemetry movement events to all registered batch and single-movement handlers.
   */
  public emit(events: AnimalMovementEvent[]): void {
    // Notify batch subscribers
    this.batchListeners.forEach((handler) => handler(events));

    // Notify individual animal movement subscribers
    events.forEach((event) => {
      this.animalMovedListeners.forEach((handler) => handler(event));
    });
  }

  /**
   * Returns the most recent telemetry snapshot as AnimalMovementEvent objects.
   */
  public getLatestTelemetry(): AnimalMovementEvent[] {
    return this.buildTelemetryEvents(this.animals);
  }

  /**
   * Returns a copy of the current state of all animals.
   */
  public getTigers(): Animal[] {
    return this.animals.map((a) => ({ ...a, pathHistory: [...a.pathHistory] }));
  }

  /**
   * Returns a copy of the current state of all animals.
   */
  public getAnimals(): Animal[] {
    return this.animals.map((a) => ({ ...a, pathHistory: [...a.pathHistory] }));
  }

  /**
   * Returns whether the simulation loop is currently active.
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  // --- Private Helpers ---

  private recordPreviousPositions(animals: Animal[]): void {
    animals.forEach((animal) => {
      this.previousPositionsMap.set(animal.id, {
        lat: animal.lat,
        lng: animal.lng,
        timestamp: animal.pathHistory[animal.pathHistory.length - 1]?.timestamp || new Date().toLocaleTimeString()
      });
    });
  }

  private buildTelemetryEvents(animals: Animal[]): AnimalMovementEvent[] {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return animals.map((animal) => {
      const prev = this.previousPositionsMap.get(animal.id) || null;

      const movementHistory: PositionPoint[] = animal.pathHistory.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        timestamp: p.timestamp || now
      }));

      return {
        animalId: animal.id,
        // Keep tigerId for backwards compat with ITelemetryProvider
        tigerId: animal.id,
        name: animal.name,
        currentPosition: {
          lat: animal.lat,
          lng: animal.lng,
          timestamp: now
        },
        previousPosition: prev,
        movementHistory,
        currentSpeed: animal.speed,
        currentZone: animal.currentZone,
        previousZone: animal.previousZone
      } as AnimalMovementEvent & { tigerId: string };
    });
  }
}
