import type { ITelemetryProvider } from '../simulation/interfaces/ITelemetryProvider';
import type {
  TigerMovementEvent,
  TigerMovedHandler,
  TelemetryBatchHandler
} from '../simulation/types';

/**
 * TelemetryService
 * Decoupled event bus service enabling external modules (e.g., AlertManager)
 * to attach movement listeners without needing direct access to the UI or React tree.
 * Follows Single Responsibility and Dependency Inversion Principles.
 */
export class TelemetryService {
  private static instance: TelemetryService | null = null;
  private provider: ITelemetryProvider | null = null;

  private constructor() {}

  /**
   * Singleton instance accessor.
   */
  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Registers the active simulation engine provider.
   */
  public setProvider(provider: ITelemetryProvider): void {
    this.provider = provider;
  }

  /**
   * Subscribe to single tiger movement events (ideal for AlertManager).
   */
  public onTigerMoved(handler: TigerMovedHandler): () => void {
    if (!this.provider) {
      console.warn('[TelemetryService] Provider not initialized yet.');
      return () => {};
    }
    return this.provider.onTigerMoved(handler);
  }

  /**
   * Subscribe to batch movement updates.
   */
  public subscribe(handler: TelemetryBatchHandler): () => void {
    if (!this.provider) {
      console.warn('[TelemetryService] Provider not initialized yet.');
      return () => {};
    }
    return this.provider.subscribe(handler);
  }

  /**
   * Unsubscribe a listener.
   */
  public unsubscribe(handler: TigerMovedHandler | TelemetryBatchHandler): void {
    if (this.provider) {
      this.provider.unsubscribe(handler);
    }
  }

  /**
   * Fetch current telemetry snapshot.
   */
  public getLatestTelemetry(): TigerMovementEvent[] {
    return this.provider ? this.provider.getLatestTelemetry() : [];
  }
}
