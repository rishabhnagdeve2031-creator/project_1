import { INITIAL_OBSERVATIONS } from '../data/demoData';

const localSightings = [...INITIAL_OBSERVATIONS];

export const sightingService = {
  async getSightings(tigerId) {
    if (!tigerId) return localSightings;
    return localSightings.filter(s => s.tigerId === tigerId);
  },

  async addSighting(sighting) {
    const newSighting = {
      id: `SGT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...sighting,
      timestamp: sighting.timestamp || new Date().toLocaleString()
    };
    localSightings.push(newSighting);
    return newSighting;
  }
};
