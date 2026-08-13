/**
 * Wildlife Simulation Data Model - Tigers Telemetry Data
 * Jim Corbett National Park - Core Zone Tracking
 */

export interface PathPoint {
  lat: number;
  lng: number;
  timestamp?: string;
}

export interface Tiger {
  id: string;
  name: string;
  lat: number;
  lng: number;
  currentZone: string;
  previousZone: string;
  speed: number; // in km/h
  color: string; // hex visual tag color
  pathHistory: PathPoint[];
}

export const TIGERS: Tiger[] = [
  {
    id: "tiger-01",
    name: "Sultan",
    lat: 20.8330,
    lng: 79.5230,
    currentZone: "Core Zone",
    previousZone: "Core Zone",
    speed: 3.5,
    color: "#f97316", // Vibrant Amber/Orange
    pathHistory: [
      { lat: 20.8285, lng: 79.5180, timestamp: "09:30 AM" },
      { lat: 20.8305, lng: 79.5200, timestamp: "10:00 AM" },
      { lat: 20.8318, lng: 79.5215, timestamp: "10:15 AM" },
      { lat: 20.8330, lng: 79.5230, timestamp: "10:30 AM" }
    ]
  },
  {
    id: "tiger-02",
    name: "Shera",
    lat: 20.7720,
    lng: 79.4450,
    currentZone: "Buffer Zone",
    previousZone: "Core Zone",
    speed: 4.2,
    color: "#eab308", // Golden Yellow
    pathHistory: [
      { lat: 20.7660, lng: 79.4380, timestamp: "09:30 AM" },
      { lat: 20.7685, lng: 79.4408, timestamp: "10:00 AM" },
      { lat: 20.7702, lng: 79.4428, timestamp: "10:15 AM" },
      { lat: 20.7720, lng: 79.4450, timestamp: "10:30 AM" }
    ]
  },
  {
    id: "tiger-03",
    name: "Maya",
    lat: 20.7180,
    lng: 79.6350,
    currentZone: "Transition Zone",
    previousZone: "Buffer Zone",
    speed: 2.8,
    color: "#ef4444", // Crimson Red
    pathHistory: [
      { lat: 20.7130, lng: 79.6290, timestamp: "09:30 AM" },
      { lat: 20.7150, lng: 79.6315, timestamp: "10:00 AM" },
      { lat: 20.7165, lng: 79.6332, timestamp: "10:15 AM" },
      { lat: 20.7180, lng: 79.6350, timestamp: "10:30 AM" }
    ]
  }
];
