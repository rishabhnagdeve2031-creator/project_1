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
    lat: 29.5324,
    lng: 78.8831,
    currentZone: "Core Zone",
    previousZone: "Core Zone",
    speed: 3.5,
    color: "#f97316", // Vibrant Amber/Orange
    pathHistory: [
      { lat: 29.5280, lng: 78.8780, timestamp: "09:30 AM" },
      { lat: 29.5302, lng: 78.8805, timestamp: "10:00 AM" },
      { lat: 29.5315, lng: 78.8820, timestamp: "10:15 AM" },
      { lat: 29.5324, lng: 78.8831, timestamp: "10:30 AM" }
    ]
  },
  {
    id: "tiger-02",
    name: "Shera",
    lat: 29.5480,
    lng: 78.9115,
    currentZone: "Core Zone",
    previousZone: "Core Zone",
    speed: 4.2,
    color: "#eab308", // Golden Yellow
    pathHistory: [
      { lat: 29.5420, lng: 78.9050, timestamp: "09:30 AM" },
      { lat: 29.5445, lng: 78.9078, timestamp: "10:00 AM" },
      { lat: 29.5462, lng: 78.9095, timestamp: "10:15 AM" },
      { lat: 29.5480, lng: 78.9115, timestamp: "10:30 AM" }
    ]
  },
  {
    id: "tiger-03",
    name: "Maya",
    lat: 29.5190,
    lng: 78.8540,
    currentZone: "Core Zone",
    previousZone: "Core Zone",
    speed: 2.8,
    color: "#ef4444", // Crimson Red
    pathHistory: [
      { lat: 29.5140, lng: 78.8480, timestamp: "09:30 AM" },
      { lat: 29.5162, lng: 78.8505, timestamp: "10:00 AM" },
      { lat: 29.5175, lng: 78.8522, timestamp: "10:15 AM" },
      { lat: 29.5190, lng: 78.8540, timestamp: "10:30 AM" }
    ]
  }
];
