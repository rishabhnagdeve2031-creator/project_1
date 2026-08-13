/**
 * Geospatial utility functions for wildlife tracking simulation.
 */

/**
 * Standard Ray Casting algorithm to determine if a point is inside a polygon.
 * 
 * @param {number[]} point - A coordinate array: [latitude, longitude]
 * @param {number[][]} polygon - An array of coordinate arrays representing the polygon vertices: [[lat, lng], ...]
 * @returns {boolean} True if the point is inside the polygon, false otherwise.
 */
function isPointInPolygon(point, polygon) {
  const py = point[0]; // Latitude (Y axis)
  const px = point[1]; // Longitude (X axis)
  let inside = false;

  // We iterate through all vertices of the polygon
  // 'i' represents the current vertex, 'j' represents the previous vertex
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const vi = polygon[i];
    const vj = polygon[j];

    const viy = vi[0]; // Latitude of vertex i
    const vix = vi[1]; // Longitude of vertex i
    const vjy = vj[0]; // Latitude of vertex j
    const vjx = vj[1]; // Longitude of vertex j

    // Check if the ray cast from px, py horizontally to the right intersects the edge between vi and vj
    const intersect = ((viy > py) !== (vjy > py))
        && (px < (vjx - vix) * (py - viy) / (vjy - viy) + vix);
    
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculates the great-circle distance between two GPS coordinates in kilometers using the Haversine formula.
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  
  // Helper to convert degrees to radians
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  // Haversine formula calculation
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

// ==========================================
// TEST SUITE & SIMULATION DEMO
// ==========================================

// Define a square wildlife reserve zone (our polygon)
// Latitudes: 12.0 to 15.0, Longitudes: 76.0 to 79.0
const tigerSanctuaryZone = [
  [12.0, 76.0], // Southwest corner
  [12.0, 79.0], // Southeast corner
  [15.0, 79.0], // Northeast corner
  [15.0, 76.0]  // Northwest corner
];

// Mock data: A list of Tiger telemetry points
// Each tiger object has an ID, name, and current coordinates [lat, lng]
const tigers = [
  { id: 1, name: "Shera", coords: [13.5, 77.5] },  // Well inside the sanctuary
  { id: 2, name: "Bagheera", coords: [11.0, 75.0] }, // Far outside (south-west)
  { id: 3, name: "Raja", coords: [14.9, 78.9] },     // Near the northeast boundary, but inside
  { id: 4, name: "T2", coords: [15.5, 76.5] }        // Outside (north)
];

// Reference point: The ranger station coordinates
const rangerStation = [13.0, 77.0];

console.log("=== Wildlife Tracking Simulation: Real-Time Telemetry Processing ===\n");

// 1. Run Point-in-Polygon checks (Zone Breach Detection)
console.log("--- Zone Breach Detection (Checking Sanctuary Boundaries) ---");
for (let i = 0; i < tigers.length; i++) {
  const tiger = tigers[i];
  const isInside = isPointInPolygon(tiger.coords, tigerSanctuaryZone);
  
  if (isInside) {
    console.log(`[SAFE] ${tiger.name} (ID: ${tiger.id}) is inside the sanctuary zone at [${tiger.coords}].`);
  } else {
    console.log(`[ALERT] BREACH DETECTED! ${tiger.name} (ID: ${tiger.id}) has wandered outside the sanctuary at [${tiger.coords}]!`);
  }
}

console.log("\n--- Ranger Proximity Check (Haversine Distance to Ranger Station) ---");
console.log(`Ranger Station Location: [${rangerStation}]\n`);

// 2. Run Haversine calculations (Distance and Proximity Detection)
for (let i = 0; i < tigers.length; i++) {
  const tiger = tigers[i];
  const distance = getDistanceKm(
    rangerStation[0], rangerStation[1],
    tiger.coords[0], tiger.coords[1]
  );
  
  console.log(`${tiger.name} is ${distance.toFixed(2)} km away from the Ranger Station.`);
}
