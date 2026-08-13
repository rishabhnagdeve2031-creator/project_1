import type {
  TigerMovementEvent,
  TigerMovedHandler,
  TelemetryBatchHandler
} from '../types';

/**
 * Interface Segregation (SOLID): ITelemetryProvider
 * Public contract for subscribing to real-time tiger movement telemetry.
 * Readily expandable for integration with AlertManager.
 */
export interface ITelemetryProvider {
  /**
   * Registers a listener for single tiger movement events.
   * Returns an unsubscription function.
   */
  onTigerMoved(handler: TigerMovedHandler): () => void;

  /**
   * Registers a listener for batch telemetry updates.
   * Returns an unsubscription function.
   */
  subscribe(handler: TelemetryBatchHandler): () => void;

  /**
   * Unsubscribes a listener handler.
   */
  unsubscribe(handler: TigerMovedHandler | TelemetryBatchHandler): void;

  /**
   * Emits telemetry movement events to all registered handlers.
   */
  emit(events: TigerMovementEvent[]): void;

  /**
   * Returns the most recent telemetry snapshot for all tigers.
   */
  getLatestTelemetry(): TigerMovementEvent[];
}
