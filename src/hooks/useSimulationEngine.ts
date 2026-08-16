import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { Animal } from '../data/animals';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { TelemetryService } from '../services/TelemetryService';

export function useSimulationEngine(initialAnimals: Animal[]) {
  // Store initial reference for reset comparison
  const initialAnimalsRef = useRef<Animal[]>(initialAnimals);
  const engineRef = useRef<SimulationEngine | null>(null);

  if (!engineRef.current) {
    const engine = new SimulationEngine(initialAnimals);
    engineRef.current = engine;
    TelemetryService.getInstance().setProvider(engine);
  }

  const [tigers, setAnimals] = useState<Animal[]>(() => engineRef.current!.getAnimals());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const engine = engineRef.current!;
    TelemetryService.getInstance().setProvider(engine);

    // Subscribe to engine tick state changes
    const unsubscribe = engine.subscribe(() => {
      setAnimals(engine.getAnimals());
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
        engineRef.current.reset(initialAnimalsRef.current);
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
    const animals = tigers;
    if (animals.length !== initialAnimalsRef.current.length) return true;
    return animals.some((animal, i) => {
      const init = initialAnimalsRef.current[i];
      return (
        Math.abs(animal.lat - init.lat) > 0.00001 ||
        Math.abs(animal.lng - init.lng) > 0.00001 ||
        animal.pathHistory.length !== init.pathHistory.length
      );
    });
  }, [tigers]);

  return {
    tigers, // keep name 'tigers' for backwards-compat with LiveMap
    isRunning,
    isLoading,
    hasMoved,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSingleTick
  };
}
