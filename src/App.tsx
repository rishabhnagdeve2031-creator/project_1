import React, { useState } from 'react';
import { TIGERS, type Tiger } from './data/tigers';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { TigerList } from './components/TigerList';
import { useSimulationEngine } from './hooks/useSimulationEngine';

export const App: React.FC = () => {
  const {
    tigers,
    isRunning,
    isLoading,
    hasMoved,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSingleTick
  } = useSimulationEngine(TIGERS);

  const [selectedTiger, setSelectedTiger] = useState<Tiger | null>(TIGERS[0]);

  // Keep selectedTiger updated with live simulation state
  const activeSelectedTiger = tigers.find((t) => t.id === selectedTiger?.id) || selectedTiger;

  return (
    <div className="app-container">
      <Header
        isRunning={isRunning}
        isLoading={isLoading}
        hasMoved={hasMoved}
        onStart={startSimulation}
        onStop={stopSimulation}
        onReset={resetSimulation}
        onTick={stepSingleTick}
      />
      <main className="app-main-layout">
        <MapView
          tigers={tigers}
          selectedTiger={activeSelectedTiger}
          onSelectTiger={(tiger) => setSelectedTiger(tiger)}
        />
        <TigerList
          tigers={tigers}
          selectedTiger={activeSelectedTiger}
          onSelectTiger={(tiger) => setSelectedTiger(tiger)}
        />
      </main>
    </div>
  );
};

export default App;
