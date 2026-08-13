import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { Tiger } from '../data/tigers';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { TelemetryService } from '../services/TelemetryService';

export function useSimulationEngine(initialTigers: Tiger[]) {
  // Store initial reference for reset comparison
  const initialTigersRef = useRef<Tiger[]>(initialTigers);
  const engineRef = useRef<SimulationEngine | null>(null);

  if (!engineRef.current) {
    const engine = new SimulationEngine(initialTigers);
    engineRef.current = engine;
    TelemetryService.getInstance().setProvider(engine);
  }

  const [tigers, setTigers] = useState<Tiger[]>(() => engineRef.current!.getTigers());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const engine = engineRef.current!;
    TelemetryService.getInstance().setProvider(engine);

    // Subscribe to engine tick state changes
    const unsubscribe = engine.subscribe(() => {
      setTigers(engine.getTigers());
      setIsRunning(engine.getIsRunning());
    });

    return () => {
      unsubscribe();
      engine.stop();
    };
  }, []);

  const startSimulation = useCallback(() => {
    if (engineRef.current && !isLoading) {
      engineRef.current.start();
      setIsRunning(true);
    }
  }, [isLoading]);

  const stopSimulation = useCallback(() => {
    if (engineRef.current && !isLoading) {
      engineRef.current.stop();
      setIsRunning(false);
    }
  }, [isLoading]);

  const resetSimulation = useCallback(() => {
    if (!engineRef.current || isLoading) return;

    setIsLoading(true);
    engineRef.current.stop();
    setIsRunning(false);

    // Brief smooth loading transition for UI feedback
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.reset(initialTigersRef.current);
      }
      setIsLoading(false);
    }, 400);
  }, [isLoading]);

  const stepSingleTick = useCallback(() => {
    if (engineRef.current && !isLoading) {
      engineRef.current.tick();
    }
  }, [isLoading]);

  // Check if simulation state has deviated from initial coordinates
  const hasMoved = useMemo(() => {
    if (tigers.length !== initialTigersRef.current.length) return true;
    return tigers.some((tiger, i) => {
      const init = initialTigersRef.current[i];
      return (
        Math.abs(tiger.lat - init.lat) > 0.00001 ||
        Math.abs(tiger.lng - init.lng) > 0.00001 ||
        tiger.pathHistory.length !== init.pathHistory.length
      );
    });
  }, [tigers]);

  return {
    tigers,
    isRunning,
    isLoading,
    hasMoved,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSingleTick
  };
}
