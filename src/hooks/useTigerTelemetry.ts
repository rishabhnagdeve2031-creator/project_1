import { useEffect, useState } from 'react';
import type { TigerMovementEvent, TigerMovedHandler } from '../simulation/types';
import { TelemetryService } from '../services/TelemetryService';

/**
 * Custom hook providing real-time telemetry stream for any Tiger
 * or per-tiger movement callbacks. Prepared for AlertManager integration.
 */
export function useTigerTelemetry(onMoveCallback?: TigerMovedHandler) {
  const [latestEvents, setLatestEvents] = useState<TigerMovementEvent[]>(() =>
    TelemetryService.getInstance().getLatestTelemetry()
  );

  useEffect(() => {
    const service = TelemetryService.getInstance();

    // Subscribe to batch updates to maintain latest state
    const unsubscribeBatch = service.subscribe((events) => {
      setLatestEvents(events);
    });

    // Subscribe to individual tiger movement callback if provided
    let unsubscribeSingle = () => {};
    if (onMoveCallback) {
      unsubscribeSingle = service.onTigerMoved(onMoveCallback);
    }

    return () => {
      unsubscribeBatch();
      unsubscribeSingle();
    };
  }, [onMoveCallback]);

  return {
    latestEvents
  };
}
