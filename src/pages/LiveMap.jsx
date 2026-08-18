import React, { useState, useEffect, useRef } from 'react';
import { ANIMALS } from '../data/animals';
import { useSimulationEngine } from '../hooks/useSimulationEngine';
import { useAppContext } from '../context/AppContext';

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATED CAMERA DETECTION DATA — DEMO MODE
// Pench Tiger Reserve is divided into 4 non-overlapping quadrants.
// Each tiger owns a clearly separate geographic region.
// These are simulated detections until the real AI photo-detection pipeline
// is operational.
//
// Reserve overview (center ~21.730°N, 79.310°E):
//   TGR-01 Sultan  → North-East  quadrant
//   TGR-02 Shera   → South-West  quadrant
//   TGR-03 Maya    → North-West  quadrant
//   TGR-07 Kali    → South-East  quadrant
// ═══════════════════════════════════════════════════════════════════════════════

const TIGER_TERRITORY_DATA = [
  {
    id: 'TGR-01',
    name: 'Sultan',
    color: '#f97316',   // orange
    anchorPoints: [
      { lat: 21.7480, lng: 79.3280 },
      { lat: 21.7520, lng: 79.3360 },
      { lat: 21.7590, lng: 79.3440 },
      { lat: 21.7650, lng: 79.3500 },
      { lat: 21.7700, lng: 79.3420 },
      { lat: 21.7720, lng: 79.3320 },
      { lat: 21.7680, lng: 79.3260 },
      { lat: 21.7560, lng: 79.3300 },
    ],
    // Distributed camera detection stations — Boundary perimeter + full interior
    cameraPoints: [
      // Perimeter / Boundary points
      { id: 'CT-S01', lat: 21.7790, lng: 79.3320, label: 'North Den Ridge', time: '05:48 AM, 16 Aug' },
      { id: 'CT-S02', lat: 21.7760, lng: 79.3480, label: 'Northeast Salt Lick', time: '11:05 AM, 16 Aug' },
      { id: 'CT-S03', lat: 21.7690, lng: 79.3560, label: 'East Ridge Lookout', time: '10:20 AM, 16 Aug' },
      { id: 'CT-S04', lat: 21.7610, lng: 79.3550, label: 'East Bamboo Thicket', time: '09:45 AM, 16 Aug' },
      { id: 'CT-S05', lat: 21.7530, lng: 79.3500, label: 'Southeast Ridge Pass', time: '08:32 AM, 16 Aug' },
      { id: 'CT-S06', lat: 21.7460, lng: 79.3410, label: 'Gully Creek Crossing', time: '07:14 AM, 16 Aug' },
      { id: 'CT-S07', lat: 21.7410, lng: 79.3300, label: 'Watering Hole South', time: '06:22 PM, 15 Aug' },
      { id: 'CT-S08', lat: 21.7450, lng: 79.3210, label: 'Southwest Forest Line', time: '07:55 AM, 15 Aug' },
      { id: 'CT-S09', lat: 21.7540, lng: 79.3180, label: 'West Forest Margin', time: '03:30 AM, 15 Aug' },
      { id: 'CT-S10', lat: 21.7630, lng: 79.3160, label: 'Stream Ford West', time: '06:40 PM, 14 Aug' },
      { id: 'CT-S11', lat: 21.7710, lng: 79.3180, label: 'Northwest Creek Bed', time: '10:15 AM, 14 Aug' },
      { id: 'CT-S12', lat: 21.7770, lng: 79.3240, label: 'North Escarpment', time: '02:15 PM, 14 Aug' },
      // Interior points (irregular natural network)
      { id: 'CT-S13', lat: 21.7715, lng: 79.3360, label: 'Upper Plateau Station', time: '04:10 AM, 16 Aug' },
      { id: 'CT-S14', lat: 21.7660, lng: 79.3450, label: 'Teak Canopy Station', time: '11:40 AM, 16 Aug' },
      { id: 'CT-S15', lat: 21.7585, lng: 79.3460, label: 'East Gully Post', time: '08:50 PM, 15 Aug' },
      { id: 'CT-S16', lat: 21.7630, lng: 79.3400, label: 'Central Glade Station', time: '01:25 PM, 15 Aug' },
      { id: 'CT-S17', lat: 21.7570, lng: 79.3360, label: 'Core Territory Post', time: '09:15 AM, 15 Aug' },
      { id: 'CT-S18', lat: 21.7620, lng: 79.3270, label: 'Rock Shelter Station', time: '04:50 AM, 14 Aug' },
      { id: 'CT-S19', lat: 21.7680, lng: 79.3260, label: 'Upper Creek Station', time: '08:10 PM, 14 Aug' },
      { id: 'CT-S20', lat: 21.7510, lng: 79.3260, label: 'Trail Junction Post', time: '12:30 PM, 13 Aug' },
      { id: 'CT-S21', lat: 21.7480, lng: 79.3330, label: 'South Meadow Post', time: '05:40 AM, 13 Aug' },
      { id: 'CT-S22', lat: 21.7540, lng: 79.3380, label: 'Gully Junction NE', time: '11:00 AM, 13 Aug' },
    ],
  },
  {
    id: 'TGR-02',
    name: 'Shera',
    color: '#eab308',   // yellow
    anchorPoints: [
      { lat: 21.7060, lng: 79.2720 },
      { lat: 21.7110, lng: 79.2800 },
      { lat: 21.7180, lng: 79.2870 },
      { lat: 21.7230, lng: 79.2950 },
      { lat: 21.7260, lng: 79.2880 },
      { lat: 21.7240, lng: 79.2760 },
      { lat: 21.7170, lng: 79.2690 },
      { lat: 21.7100, lng: 79.2750 },
    ],
    // Distributed camera detection stations — Boundary perimeter + full interior
    cameraPoints: [
      // Perimeter / Boundary points
      { id: 'CT-SH01', lat: 21.7330, lng: 79.2860, label: 'North Den Slope', time: '11:42 AM, 16 Aug' },
      { id: 'CT-SH02', lat: 21.7300, lng: 79.2990, label: 'Northeast River Bend', time: '10:10 AM, 16 Aug' },
      { id: 'CT-SH03', lat: 21.7240, lng: 79.3030, label: 'East Ridge Crossing', time: '08:55 AM, 16 Aug' },
      { id: 'CT-SH04', lat: 21.7170, lng: 79.3010, label: 'East Watering Pool', time: '07:38 AM, 16 Aug' },
      { id: 'CT-SH05', lat: 21.7090, lng: 79.2940, label: 'Southeast Old Trail', time: '06:10 AM, 16 Aug' },
      { id: 'CT-SH06', lat: 21.7010, lng: 79.2870, label: 'South Scrub Border', time: '05:30 PM, 15 Aug' },
      { id: 'CT-SH07', lat: 21.6980, lng: 79.2750, label: 'South Grassland Post', time: '06:44 AM, 15 Aug' },
      { id: 'CT-SH08', lat: 21.7030, lng: 79.2660, label: 'Southwest Meadow Post', time: '08:00 AM, 15 Aug' },
      { id: 'CT-SH09', lat: 21.7100, lng: 79.2610, label: 'West Village Buffer', time: '01:10 PM, 14 Aug' },
      { id: 'CT-SH10', lat: 21.7190, lng: 79.2600, label: 'West Forest Perimeter', time: '09:20 AM, 14 Aug' },
      { id: 'CT-SH11', lat: 21.7270, lng: 79.2660, label: 'Northwest Bamboo Station', time: '03:45 PM, 14 Aug' },
      { id: 'CT-SH12', lat: 21.7320, lng: 79.2750, label: 'North Hollow Post', time: '07:15 AM, 14 Aug' },
      // Interior points (irregular natural network)
      { id: 'CT-SH13', lat: 21.7270, lng: 79.2840, label: 'Central Ridge Station', time: '11:30 PM, 16 Aug' },
      { id: 'CT-SH14', lat: 21.7220, lng: 79.2920, label: 'East Slope Station', time: '04:50 AM, 16 Aug' },
      { id: 'CT-SH15', lat: 21.7150, lng: 79.2920, label: 'Pond Clearing Post', time: '08:10 PM, 15 Aug' },
      { id: 'CT-SH16', lat: 21.7130, lng: 79.2860, label: 'Core Old Trail Station', time: '11:00 AM, 15 Aug' },
      { id: 'CT-SH17', lat: 21.7210, lng: 79.2820, label: 'Core Habitat Post', time: '02:35 PM, 15 Aug' },
      { id: 'CT-SH18', lat: 21.7160, lng: 79.2750, label: 'West Forest Station', time: '06:15 AM, 14 Aug' },
      { id: 'CT-SH19', lat: 21.7230, lng: 79.2720, label: 'Bamboo Grove Station', time: '10:40 PM, 14 Aug' },
      { id: 'CT-SH20', lat: 21.7080, lng: 79.2700, label: 'Meadow Central Post', time: '07:25 AM, 13 Aug' },
      { id: 'CT-SH21', lat: 21.7050, lng: 79.2780, label: 'South Trail Crossing', time: '01:50 PM, 13 Aug' },
      { id: 'CT-SH22', lat: 21.7110, lng: 79.2830, label: 'Scrub Forest Post', time: '09:05 AM, 13 Aug' },
    ],
  },
  {
    id: 'TGR-03',
    name: 'Maya',
    color: '#8b5cf6',   // purple
    anchorPoints: [
      { lat: 21.7490, lng: 79.2760 },
      { lat: 21.7550, lng: 79.2840 },
      { lat: 21.7620, lng: 79.2920 },
      { lat: 21.7680, lng: 79.2980 },
      { lat: 21.7720, lng: 79.2900 },
      { lat: 21.7700, lng: 79.2800 },
      { lat: 21.7640, lng: 79.2740 },
      { lat: 21.7560, lng: 79.2780 },
    ],
    // Distributed camera detection stations — Boundary perimeter + full interior
    cameraPoints: [
      // Perimeter / Boundary points
      { id: 'CT-M01', lat: 21.7785, lng: 79.2855, label: 'North Ridge Apex', time: '05:55 AM, 16 Aug' },
      { id: 'CT-M02', lat: 21.7750, lng: 79.2990, label: 'Northeast Plateau', time: '07:20 AM, 16 Aug' },
      { id: 'CT-M03', lat: 21.7695, lng: 79.3050, label: 'East Salt Block', time: '08:45 AM, 16 Aug' },
      { id: 'CT-M04', lat: 21.7625, lng: 79.3060, label: 'East Stream Bank', time: '10:05 AM, 16 Aug' },
      { id: 'CT-M05', lat: 21.7540, lng: 79.3000, label: 'Southeast Ridge', time: '11:30 AM, 16 Aug' },
      { id: 'CT-M06', lat: 21.7470, lng: 79.2910, label: 'Southeast Valley', time: '05:10 AM, 15 Aug' },
      { id: 'CT-M07', lat: 21.7425, lng: 79.2785, label: 'South Ravine Base', time: '06:50 AM, 15 Aug' },
      { id: 'CT-M08', lat: 21.7460, lng: 79.2670, label: 'Southwest Slope', time: '07:35 AM, 15 Aug' },
      { id: 'CT-M09', lat: 21.7540, lng: 79.2635, label: 'West Forest Border', time: '01:40 PM, 14 Aug' },
      { id: 'CT-M10', lat: 21.7630, lng: 79.2630, label: 'West Trail Crossing', time: '10:15 AM, 14 Aug' },
      { id: 'CT-M11', lat: 21.7720, lng: 79.2685, label: 'Northwest Waterhole', time: '04:30 PM, 14 Aug' },
      { id: 'CT-M12', lat: 21.7770, lng: 79.2750, label: 'North Ledge Station', time: '08:00 AM, 14 Aug' },
      // Interior points (irregular natural network)
      { id: 'CT-M13', lat: 21.7710, lng: 79.2840, label: 'Upper Springs NW', time: '11:15 PM, 16 Aug' },
      { id: 'CT-M14', lat: 21.7680, lng: 79.2930, label: 'High Teak Canopy', time: '05:25 AM, 16 Aug' },
      { id: 'CT-M15', lat: 21.7610, lng: 79.2970, label: 'East Creek Bank', time: '07:50 PM, 15 Aug' },
      { id: 'CT-M16', lat: 21.7580, lng: 79.2905, label: 'Bamboo Cleared Glade', time: '12:10 PM, 15 Aug' },
      { id: 'CT-M17', lat: 21.7645, lng: 79.2855, label: 'Core Habitat Station', time: '03:15 PM, 15 Aug' },
      { id: 'CT-M18', lat: 21.7600, lng: 79.2780, label: 'West Teak Patch', time: '08:40 AM, 14 Aug' },
      { id: 'CT-M19', lat: 21.7675, lng: 79.2740, label: 'Rocky Escarpment', time: '02:00 PM, 14 Aug' },
      { id: 'CT-M20', lat: 21.7525, lng: 79.2730, label: 'Lower Fork Station', time: '06:10 AM, 13 Aug' },
      { id: 'CT-M21', lat: 21.7485, lng: 79.2820, label: 'Valley Pass Junction', time: '09:30 PM, 13 Aug' },
      { id: 'CT-M22', lat: 21.7555, lng: 79.2840, label: 'Teak Forest Central', time: '11:55 AM, 13 Aug' },
    ],
  },
  {
    id: 'TGR-07',
    name: 'Kali',
    color: '#ef4444',   // red
    anchorPoints: [
      { lat: 21.6840, lng: 79.3200 },
      { lat: 21.6890, lng: 79.3280 },
      { lat: 21.6950, lng: 79.3360 },
      { lat: 21.7010, lng: 79.3440 },
      { lat: 21.7050, lng: 79.3370 },
      { lat: 21.7040, lng: 79.3270 },
      { lat: 21.6980, lng: 79.3210 },
      { lat: 21.6910, lng: 79.3240 },
    ],
    // Distributed camera detection stations — Boundary perimeter + full interior
    cameraPoints: [
      // Perimeter / Boundary points
      { id: 'CT-K01', lat: 21.7120, lng: 79.3340, label: 'North Bamboo Patch', time: '06:05 AM, 16 Aug' },
      { id: 'CT-K02', lat: 21.7080, lng: 79.3500, label: 'Northeast River Crossing', time: '07:45 AM, 16 Aug' },
      { id: 'CT-K03', lat: 21.7010, lng: 79.3530, label: 'East River Bank', time: '09:10 AM, 16 Aug' },
      { id: 'CT-K04', lat: 21.6940, lng: 79.3490, label: 'East Crop Border', time: '10:28 AM, 16 Aug' },
      { id: 'CT-K05', lat: 21.6860, lng: 79.3420, label: 'Southeast Plantation', time: '11:50 AM, 16 Aug' },
      { id: 'CT-K06', lat: 21.6790, lng: 79.3340, label: 'South Canal Line', time: '05:20 PM, 15 Aug' },
      { id: 'CT-K07', lat: 21.6760, lng: 79.3220, label: 'South Village Fringe', time: '06:35 AM, 15 Aug' },
      { id: 'CT-K08', lat: 21.6810, lng: 79.3130, label: 'Southwest Scrub Border', time: '08:15 AM, 15 Aug' },
      { id: 'CT-K09', lat: 21.6890, lng: 79.3110, label: 'West Dense Cover', time: '02:00 PM, 14 Aug' },
      { id: 'CT-K10', lat: 21.6970, lng: 79.3120, label: 'West Trail End', time: '09:40 AM, 14 Aug' },
      { id: 'CT-K11', lat: 21.7050, lng: 79.3160, label: 'Northwest Water Pool', time: '04:15 PM, 14 Aug' },
      { id: 'CT-K12', lat: 21.7100, lng: 79.3240, label: 'North Buffer Line', time: '07:50 AM, 14 Aug' },
      // Interior points (irregular natural network)
      { id: 'CT-K13', lat: 21.7040, lng: 79.3330, label: 'Central Corridor North', time: '10:45 PM, 16 Aug' },
      { id: 'CT-K14', lat: 21.7000, lng: 79.3420, label: 'Northeast Clearing Post', time: '03:10 AM, 16 Aug' },
      { id: 'CT-K15', lat: 21.6930, lng: 79.3410, label: 'East Thicket Post', time: '08:20 PM, 15 Aug' },
      { id: 'CT-K16', lat: 21.6980, lng: 79.3350, label: 'Core Buffer Station', time: '01:30 PM, 15 Aug' },
      { id: 'CT-K17', lat: 21.6920, lng: 79.3300, label: 'Core Habitat Post', time: '03:40 PM, 15 Aug' },
      { id: 'CT-K18', lat: 21.6950, lng: 79.3230, label: 'West Boundary Path', time: '08:15 AM, 14 Aug' },
      { id: 'CT-K19', lat: 21.7020, lng: 79.3230, label: 'Water Pool Clearing', time: '11:20 AM, 14 Aug' },
      { id: 'CT-K20', lat: 21.6860, lng: 79.3190, label: 'Dense Scrub Post', time: '05:50 AM, 13 Aug' },
      { id: 'CT-K21', lat: 21.6820, lng: 79.3270, label: 'South Fringe Post', time: '07:30 PM, 13 Aug' },
      { id: 'CT-K22', lat: 21.6880, lng: 79.3340, label: 'Scrub Edge Station', time: '10:15 AM, 13 Aug' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GEOMETRY HELPERS & POINT-IN-POLYGON VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/** 2-D cross product of OA and OB vectors */
function cross(O, A, B) {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

/** Convex hull (Andrew's monotone chain) — returns [lat,lng] array */
function convexHull(points) {
  if (points.length < 3) return points;
  const pts = [...points].sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return [...lower, ...upper];
}

/** Expand every hull vertex outward from centroid by `pad` degrees */
function expandHull(hull, centroid, pad) {
  return hull.map(([lat, lng]) => {
    const dLat = lat - centroid.lat;
    const dLng = lng - centroid.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng) || 0.001;
    return [lat + (dLat / dist) * pad, lng + (dLng / dist) * pad];
  });
}

/** Add slight natural irregularity via deterministic per-vertex jitter */
function addIrregularity(hull, seedOffset) {
  return hull.map(([lat, lng], i) => {
    const angle = ((i * 137.508 + seedOffset) % 360) * Math.PI / 180;
    const jitter = 0.003;
    return [lat + Math.cos(angle) * jitter, lng + Math.sin(angle) * jitter];
  });
}

/** Average lat/lng of points */
function calcCentroid(pts) {
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
}

/** Point-in-polygon check using Ray-Casting algorithm */
function isPointInPolygon(point, polygon) {
  const lat = point.lat !== undefined ? point.lat : point[0];
  const lng = point.lng !== undefined ? point.lng : point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Distance squared from point p to segment [p1, p2] */
function distToSegmentSquared(p, p1, p2) {
  const l2 = (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
  if (l2 === 0) return (p[0] - p1[0]) ** 2 + (p[1] - p1[1]) ** 2;
  let t = ((p[0] - p1[0]) * (p2[0] - p1[0]) + (p[1] - p1[1]) * (p2[1] - p1[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return (p[0] - (p1[0] + t * (p2[0] - p1[0]))) ** 2 + (p[1] - (p1[1] + t * (p2[1] - p1[1]))) ** 2;
}

/** Minimum distance from point to polygon boundary in degrees */
function distToPolygonBoundary(point, polygon) {
  const p = [point.lat !== undefined ? point.lat : point[0], point.lng !== undefined ? point.lng : point[1]];
  let minD2 = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const d2 = distToSegmentSquared(p, polygon[i], polygon[j]);
    if (d2 < minD2) minD2 = d2;
  }
  return Math.sqrt(minD2);
}

/** Check if point is strictly inside territory with a safety margin away from boundary */
function isPointInsideTerritory(point, polygon, safetyMargin = 0.0015) {
  if (!isPointInPolygon(point, polygon)) return false;
  return distToPolygonBoundary(point, polygon) >= safetyMargin;
}

/** Ensure point is strictly inside territory by pulling towards centroid if near or outside boundary */
function ensureInsideTerritory(point, polygon, centroid, safetyMargin = 0.0022) {
  let curLat = point.lat;
  let curLng = point.lng;
  let iterations = 0;
  while ((!isPointInPolygon({ lat: curLat, lng: curLng }, polygon) ||
          distToPolygonBoundary({ lat: curLat, lng: curLng }, polygon) < safetyMargin) &&
         iterations < 40) {
    curLat = curLat + (centroid.lat - curLat) * 0.06;
    curLng = curLng + (centroid.lng - curLng) * 0.06;
    iterations++;
  }
  return { ...point, lat: curLat, lng: curLng };
}

/** Build territory polygon from fixed anchor points */
function buildTerritory(tiger, tigerIndex) {
  const pts = tiger.anchorPoints || tiger.cameraPoints;
  const raw = pts.map(c => [c.lat, c.lng]);
  const hull = convexHull(raw);
  const centroid = calcCentroid(pts);
  const expanded = expandHull(hull, centroid, 0.012);
  const irregular = addIrregularity(expanded, tigerIndex * 73);
  return { polygon: irregular, centroid };
}

// Pre-compute territories once and mathematically guarantee 100% inside polygon placement
const COMPUTED_TERRITORIES = TIGER_TERRITORY_DATA.map((tiger, idx) => {
  const { polygon, centroid } = buildTerritory(tiger, idx);
  const validatedCameraPoints = tiger.cameraPoints
    .map(cam => ensureInsideTerritory(cam, polygon, centroid, 0.0022))
    .filter(cam => isPointInsideTerritory(cam, polygon, 0.0008));
  return { ...tiger, polygon, centroid, cameraPoints: validatedCameraPoints };
});

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE MAPS LOADER
// ═══════════════════════════════════════════════════════════════════════════════
let googleMapsPromise = null;
function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('google-maps-script');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google.maps));
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return googleMapsPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// ALERT AUDIO SYNTHESIZER — LOUD EMERGENCY WARNING ALARM
// ═══════════════════════════════════════════════════════════════════════════════
function playLoudWarningAlarm() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.5, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    const now = ctx.currentTime;
    playTone(920, now, 0.18);
    playTone(640, now + 0.20, 0.18);
    playTone(920, now + 0.40, 0.18);
    playTone(640, now + 0.60, 0.25);
  } catch (e) {
    console.warn('Audio alarm playback error:', e);
  }
}

export default function LiveMap() {
  const { tigerProfiles, runs, addAlert } = useAppContext();
  const [activeTab, setActiveTab] = useState('map');
  const [filterTigerId, setFilterTigerId] = useState('all');

  const filteredTigerProfiles = filterTigerId === 'all'
    ? tigerProfiles
    : tigerProfiles.filter(t => t.id === filterTigerId);

  const {
    tigers: animals,
    isRunning,
    isLoading,
    hasMoved,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSingleTick
  } = useSimulationEngine(ANIMALS);

  const [selectedAnimal, setSelectedAnimal] = useState(ANIMALS[0]);
  const liveSelected = animals.find(a => a.id === selectedAnimal?.id) || animals[0];

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRefsRef = useRef({ territories: [], cams: [], centroids: [], labels: [], tigerOverlays: [], polylines: [], infoWindows: [] });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [popupAnimal, setPopupAnimal] = useState(null);

  const previousPositionsRef = useRef(new Map());
  const triggeredExitAlarmsRef = useRef(new Set());

  // ── Universal Boundary Crossing Detection (Works for ALL Tigers) ────────────
  useEffect(() => {
    if (!isRunning && !hasMoved) return;

    animals.forEach(animal => {
      const tigerTerritory = COMPUTED_TERRITORIES.find(t => t.id === animal.id);
      if (!tigerTerritory) return;

      const currentPos = { lat: animal.lat, lng: animal.lng };
      const previousPos = previousPositionsRef.current.get(animal.id) || currentPos;

      const previouslyInside = isPointInPolygon(previousPos, tigerTerritory.polygon);
      const currentlyInside = isPointInPolygon(currentPos, tigerTerritory.polygon);

      // Save current position for next tick evaluation
      previousPositionsRef.current.set(animal.id, currentPos);

      // Boundary crossing occurs ONLY when: previouslyInside === true && currentlyInside === false
      if (previouslyInside && !currentlyInside && !triggeredExitAlarmsRef.current.has(animal.id)) {
        triggeredExitAlarmsRef.current.add(animal.id);

        // 1. Play LOUD warning sound once per boundary-crossing event
        playLoudWarningAlarm();

        // 2. Nearest camera detection station in territory
        const nearestCam = tigerTerritory.cameraPoints.reduce((prev, curr) => {
          const dCurr = Math.hypot(curr.lat - animal.lat, curr.lng - animal.lng);
          const dPrev = Math.hypot(prev.lat - animal.lat, prev.lng - animal.lng);
          return dCurr < dPrev ? curr : prev;
        }, tigerTerritory.cameraPoints[0]);

        // 3. Dynamic alert formatted for any crossing tiger
        const exitAlert = {
          id: `ALT-EXT-${animal.id}-${Date.now().toString().slice(-4)}`,
          type: 'Tiger Territory Exit',
          severity: 'HIGH',
          tigerId: animal.id,
          cameraId: nearestCam?.id || 'CT-CORRIDOR',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: `${animal.name} Territory — Perimeter Boundary Exit`,
          description: `⚠️ TIGER TERRITORY EXIT: ${animal.name} (${animal.id}) has crossed outside established territory.`,
          whatChanged: `${animal.name} (${animal.id}) crossed territory boundary line into outside zone.`,
          supportingEvidence: [
            `Current Telemetry: ${animal.lat.toFixed(4)}°N, ${animal.lng.toFixed(4)}°E`,
            `Previous Telemetry: ${previousPos.lat.toFixed(4)}°N, ${previousPos.lng.toFixed(4)}°E`,
            `Status: OUTSIDE ESTABLISHED TERRITORY`,
            'Action: Forest officer review recommended'
          ],
          confidence: 96,
          surveyEffort: 'Real-time Telemetry & Mesh Sensors',
          lat: animal.lat,
          lng: animal.lng
        };

        addAlert(exitAlert);
      }
    });
  }, [animals, isRunning, hasMoved, addAlert]);

  const handleResetSim = () => {
    previousPositionsRef.current.clear();
    triggeredExitAlarmsRef.current.clear();
    resetSimulation();
  };

  // ── Init Google Map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'map' || !mapContainerRef.current) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    loadGoogleMaps(apiKey).then(maps => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const map = new maps.Map(mapContainerRef.current, {
        center: { lat: 21.730, lng: 79.310 },
        zoom: 11,
        mapTypeId: maps.MapTypeId.HYBRID,
        mapTypeControl: true,
        mapTypeControlOptions: { position: maps.ControlPosition.TOP_RIGHT },
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: { position: maps.ControlPosition.RIGHT_BOTTOM },
      });
      mapInstanceRef.current = map;
      setMapLoaded(true);
    }).catch(err => console.error('Google Maps load failed:', err));
  }, [activeTab]);

  // ── Pan on tiger selection ─────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current && liveSelected) {
      mapInstanceRef.current.panTo({ lat: liveSelected.lat, lng: liveSelected.lng });
      setPopupAnimal(liveSelected);
    }
  }, [selectedAnimal?.id]);

  // ── Render Territory + Camera Layer ───────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;
    const maps = window.google.maps;
    const refs = layerRefsRef.current;

    // Clean up previous territory overlays
    [...refs.territories, ...refs.cams, ...refs.centroids, ...refs.labels].forEach(o => {
      if (o?.setMap) o.setMap(null);
      else if (o?.close) o.close();
    });
    refs.infoWindows.forEach(iw => iw.close());
    refs.territories = []; refs.cams = []; refs.centroids = []; refs.labels = []; refs.infoWindows = [];

    // Decide which tigers to render
    const tigersToRender = filterTigerId === 'all'
      ? COMPUTED_TERRITORIES
      : COMPUTED_TERRITORIES.filter(t => t.id === filterTigerId);

    // ── Custom OverlayView for HTML labels ──────────────────────────────────
    class HtmlLabel extends maps.OverlayView {
      constructor(position, html, offsetY = 0) {
        super();
        this.pos = position;
        this.html = html;
        this.offsetY = offsetY;
        this.el = null;
        this.setMap(map);
      }
      onAdd() {
        this.el = document.createElement('div');
        this.el.style.cssText = 'position:absolute;pointer-events:none;';
        this.el.innerHTML = this.html;
        this.getPanes().overlayLayer.appendChild(this.el);
      }
      draw() {
        const proj = this.getProjection();
        if (!proj || !this.el) return;
        const pt = proj.fromLatLngToDivPixel(new maps.LatLng(this.pos.lat, this.pos.lng));
        if (pt) {
          this.el.style.left = `${pt.x}px`;
          this.el.style.top = `${pt.y + this.offsetY}px`;
        }
      }
      onRemove() {
        if (this.el?.parentNode) { this.el.parentNode.removeChild(this.el); this.el = null; }
      }
    }

    tigersToRender.forEach((tiger) => {
      const { polygon, centroid, color, cameraPoints, id, name } = tiger;

      // ── 1. Territory polygon ──────────────────────────────────────────────
      const poly = new maps.Polygon({
        paths: polygon.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 3,
        fillColor: color,
        fillOpacity: 0.30,
        map,
        zIndex: 2,
      });
      refs.territories.push(poly);

      // ── 2. Territory label (placed at centroid, offset below) ─────────────
      const labelHtml = `
        <div style="
          transform: translate(-50%, 10px);
          background: rgba(8,12,18,0.88);
          border: 2px solid ${color};
          border-radius: 8px;
          padding: 5px 12px;
          white-space: nowrap;
          font-family: monospace;
          font-size: 12px;
          font-weight: 800;
          color: ${color};
          text-shadow: 0 0 8px ${color}88;
          box-shadow: 0 0 12px ${color}44;
          letter-spacing: 0.5px;
        ">🐅 ${id} · ${name}</div>
      `;
      const label = new HtmlLabel(centroid, labelHtml, 18);
      refs.labels.push(label);

      // ── 3. Camera detection point markers ─────────────────────────────────
      cameraPoints.forEach(cam => {
        // Absolute safety guard: NEVER render an outside point
        if (!isPointInPolygon(cam, polygon)) return;

        const iw = new maps.InfoWindow({
          content: `
            <div style="font-family:monospace;font-size:12px;padding:6px 8px;min-width:200px;">
              <div style="font-weight:800;font-size:14px;margin-bottom:6px;color:#0f172a;">📷 ${cam.id}</div>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="color:#475569;padding:2px 8px 2px 0">Camera Station</td><td style="font-weight:700">${cam.label}</td></tr>
                <tr><td style="color:#475569;padding:2px 8px 2px 0">Tiger</td><td style="font-weight:700;color:${color}">${id} — ${name}</td></tr>
                <tr><td style="color:#475569;padding:2px 8px 2px 0">Detection</td><td>Camera Trap</td></tr>
                <tr><td style="color:#475569;padding:2px 8px 2px 0">Timestamp</td><td>${cam.time}</td></tr>
                <tr><td style="color:#475569;padding:2px 8px 2px 0">Coords</td><td>${cam.lat.toFixed(4)}°N, ${cam.lng.toFixed(4)}°E</td></tr>
                <tr><td colspan="2" style="padding-top:6px"><span style="background:#fbbf2422;color:#d97706;border:1px solid #d9780666;border-radius:3px;font-size:10px;font-weight:700;padding:2px 6px">⚠ DEMO — SIMULATED DETECTION</span></td></tr>
              </table>
            </div>
          `,
        });
        const camMarker = new maps.Marker({
          position: { lat: cam.lat, lng: cam.lng },
          map,
          title: `📷 ${cam.id} — ${cam.label} [${id}]`,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 5.5,
            fillColor: '#ffffff',
            fillOpacity: 1.0,
            strokeColor: color,
            strokeWeight: 2,
          },
          zIndex: 20,
        });
        camMarker.addListener('click', () => {
          refs.infoWindows.forEach(iw2 => iw2.close());
          iw.open(map, camMarker);
        });
        refs.cams.push(camMarker);
        refs.infoWindows.push(iw);
      });

      // ── 4. Centroid diamond marker ─────────────────────────────────────────
      const centroidMarker = new maps.Marker({
        position: { lat: centroid.lat, lng: centroid.lng },
        map,
        title: `◎ Activity Centroid — ${name} (${id})`,
        icon: {
          // Diamond SVG path centered at 0,0
          path: 'M 0,-11 L 8,0 L 0,11 L -8,0 Z',
          scale: 1.4,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
          anchor: new maps.Point(0, 0),
        },
        zIndex: 25,
      });
      refs.centroids.push(centroidMarker);
    });
  }, [mapLoaded, filterTigerId]);

  // ── Render live tiger sim markers + polylines ──────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;
    const maps = window.google.maps;
    const refs = layerRefsRef.current;

    refs.tigerOverlays.forEach(o => { if (o?.setMap) o.setMap(null); });
    refs.polylines.forEach(p => p.setMap(null));
    refs.tigerOverlays = []; refs.polylines = [];

    class AnimalMarkerOverlay extends maps.OverlayView {
      constructor(animal, isSelected, onClick) {
        super();
        this.animal = animal;
        this.isSelected = isSelected;
        this.onClick = onClick;
        this.div = null;
        this.setMap(map);
      }
      onAdd() {
        this.div = document.createElement('div');
        this.div.style.cssText = `position:absolute;cursor:pointer;z-index:${this.isSelected ? 100 : 30};transform:translate(-50%,-50%)`;
        const ring = this.isSelected
          ? `0 0 0 3px ${this.animal.color},0 0 18px ${this.animal.color}aa`
          : `0 0 8px ${this.animal.color}66`;
        this.div.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;pointer-events:auto">
            <div style="background:linear-gradient(135deg,${this.animal.color}ee,${this.animal.color}99);
              width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;
              font-size:22px;border:2.5px solid rgba(255,255,255,0.9);box-shadow:${ring}">${this.animal.emoji}</div>
            <div style="background:rgba(8,12,18,0.90);backdrop-filter:blur(6px);border:1.5px solid ${this.animal.color}99;
              border-radius:5px;padding:2px 8px;margin-top:4px;white-space:nowrap">
              <span style="font-size:11px;font-weight:700;color:#fff;font-family:monospace">${this.animal.name} (${this.animal.id})</span>
            </div>
          </div>`;
        this.div.addEventListener('click', e => { e.stopPropagation(); this.onClick(this.animal); });
        this.getPanes().overlayMouseTarget.appendChild(this.div);
      }
      draw() {
        const proj = this.getProjection();
        if (!proj || !this.div) return;
        const pt = proj.fromLatLngToDivPixel(new maps.LatLng(this.animal.lat, this.animal.lng));
        if (pt) { this.div.style.left = `${pt.x}px`; this.div.style.top = `${pt.y}px`; }
      }
      onRemove() {
        if (this.div?.parentNode) { this.div.parentNode.removeChild(this.div); this.div = null; }
      }
    }

    animals.forEach(animal => {
      if (animal.pathHistory?.length > 1) {
        refs.polylines.push(new maps.Polyline({
          path: animal.pathHistory.map(p => ({ lat: p.lat, lng: p.lng })),
          geodesic: true,
          strokeColor: animal.color,
          strokeOpacity: 0.85,
          strokeWeight: 2.5,
          map,
          zIndex: 12,
        }));
      }
      refs.tigerOverlays.push(new AnimalMarkerOverlay(animal, liveSelected?.id === animal.id, sel => {
        setSelectedAnimal(sel);
        setPopupAnimal(sel);
        map.panTo({ lat: sel.lat, lng: sel.lng });
      }));
    });

    return () => {
      refs.tigerOverlays.forEach(o => { if (o?.setMap) o.setMap(null); });
      refs.polylines.forEach(p => p.setMap(null));
    };
  }, [mapLoaded, animals, liveSelected?.id]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="live-map-root">
      {/* ── Controls Bar ── */}
      <div className="sim-controls-header">
        <div className="control-group">
          <button className={`control-btn ${isRunning ? 'active' : ''}`} onClick={startSimulation} disabled={isRunning || isLoading}>▶ Start Sim</button>
          <button className="control-btn" onClick={stopSimulation} disabled={!isRunning || isLoading}>⏸ Pause</button>
          <button className="control-btn" onClick={handleResetSim} disabled={(!hasMoved && !isRunning) || isLoading}>↺ Reset</button>
          <button className="control-btn" onClick={stepSingleTick} disabled={isRunning || isLoading}>⟩ Single Tick</button>
        </div>
        <div className="mode-tabs">
          <button className={`mode-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            🗺 Occupancy Map & Range Overlap
          </button>
          <button className={`mode-btn ${activeTab === 'history-runs' ? 'active' : ''}`} onClick={() => setActiveTab('history-runs')}>
            📈 Historical Run Comparison ({runs.length} Runs)
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>🐅 Filter:</span>
          <select value={filterTigerId} onChange={e => setFilterTigerId(e.target.value)}
            style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-bright)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            <option value="all">All Tigers</option>
            {tigerProfiles.map(t => <option key={t.id} value={t.id}>{t.id} — {t.name}</option>)}
          </select>
          <span className="status-badge count">{filteredTigerProfiles.length} / {tigerProfiles.length} Tigers</span>
        </div>
      </div>

      {/* ── MAP TAB ── */}
      {activeTab === 'map' && (
        <div className="live-map-wrapper">

          {/* Legend */}
          <div className="map-legend font-mono">
            <div className="legend-header">INDIVIDUAL TIGER TERRITORIES</div>
            {COMPUTED_TERRITORIES.map(t => (
              <div key={t.id} className="legend-tiger-row">
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: t.color, border: `2px solid ${t.color}`, marginRight: 7, flexShrink: 0 }} />
                <span style={{ color: t.color, fontWeight: 800 }}>{t.id}</span>
                <span style={{ color: '#94a3b8', marginLeft: 5 }}>{t.name}</span>
                <span style={{ color: '#475569', marginLeft: 'auto', fontSize: 10 }}>{t.cameraPoints.length} pts</span>
              </div>
            ))}
            <div className="legend-divider" />
            <div className="legend-key-row"><span className="lk-dot white-dot" />Camera Detection</div>
            <div className="legend-key-row"><span className="lk-diamond" />Tiger Centroid</div>
            <div className="legend-key-row"><span className="lk-box" />Individual Territory</div>
            <div className="demo-badge">⚠ DEMO — SIMULATED DETECTIONS</div>
          </div>

          {/* Google Map */}
          <div ref={mapContainerRef} className="google-map-frame" />

          {/* Tiger info popup */}
          {popupAnimal && (
            <div className="tiger-popup font-mono" style={{ borderColor: `${popupAnimal.color}bb` }}>
              <button className="popup-close" onClick={() => setPopupAnimal(null)}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `2px solid ${popupAnimal.color}55`, paddingBottom: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{popupAnimal.emoji}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: popupAnimal.color }}>{popupAnimal.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Tiger ID: {popupAnimal.id}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.8 }}>
                <div>Lat: <strong style={{ color: '#fff' }}>{popupAnimal.lat.toFixed(4)}°N</strong></div>
                <div>Lng: <strong style={{ color: '#fff' }}>{popupAnimal.lng.toFixed(4)}°E</strong></div>
                <div>Zone: <strong style={{ color: popupAnimal.color }}>{popupAnimal.currentZone}</strong></div>
              </div>
            </div>
          )}

          {/* Telemetry sidebar */}
          <div className="telemetry-sidebar">
            <div style={{ marginBottom: 8 }}>
              <h3 className="sidebar-title">🐅 Occupancy & Centroids</h3>
            </div>
            {COMPUTED_TERRITORIES.map(tiger => {
              const profile = tigerProfiles.find(p => p.id === tiger.id);
              return (
                <div key={tiger.id} className="occ-card" style={{ borderLeftColor: tiger.color }}
                  onClick={() => {
                    const anim = animals.find(a => a.id === tiger.id);
                    if (anim) {
                      setSelectedAnimal(anim);
                      setPopupAnimal(anim);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.panTo({ lat: anim.lat, lng: anim.lng });
                        mapInstanceRef.current.setZoom(13);
                      }
                    }
                  }}>
                  <div className="occ-header">
                    <span style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: 12 }}>{tiger.name} ({tiger.id})</span>
                    <span style={{ color: tiger.color, fontWeight: 700, fontSize: 11 }}>{profile?.estimatedAreaKm2 ?? '—'} km²</span>
                  </div>
                  <div className="occ-meta font-mono">
                    <div>Centroid: {tiger.centroid.lat.toFixed(3)}°N, {tiger.centroid.lng.toFixed(3)}°E</div>
                    <div style={{ marginTop: 4 }}>
                      {tiger.cameraPoints.map(c => (
                        <span key={c.id} style={{ fontSize: 9, background: `${tiger.color}22`, border: `1px solid ${tiger.color}55`, borderRadius: 3, padding: '1px 4px', marginRight: 3, marginBottom: 2, color: tiger.color, display: 'inline-block' }}>
                          📷 {c.id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HISTORY RUNS TAB ── */}
      {activeTab === 'history-runs' && (
        <div className="runs-container">
          <div className="runs-header-card">
            <h3>📈 Historical Survey Run Comparison</h3>
            <p>Compares tiger home range occupancy, centroid shifts, and camera station capture frequency across consecutive survey runs.</p>
          </div>
          <div className="runs-grid">
            {runs.map(run => (
              <div key={run.id} className="run-card">
                <div className="run-card-header">
                  <span className="run-id font-mono">{run.id}</span>
                  <span className="run-date">{run.date}</span>
                </div>
                <div className="run-kpis">
                  <div>Images: <strong>{run.imagesProcessed}</strong></div>
                  <div>Blanks: <strong>{run.blankImages}</strong></div>
                  <div>Useful: <strong className="green">{run.usefulImages}</strong></div>
                  <div>Tigers: <strong className="orange">{run.tigerDetections}</strong></div>
                </div>
                <div className="run-occupancy-table-wrapper">
                  <table className="run-table">
                    <thead><tr><th>Tiger ID</th><th>Occupancy</th><th>Centroid</th><th>Trend</th></tr></thead>
                    <tbody>
                      {run.occupancySummary.map((occ, i) => (
                        <tr key={i}>
                          <td className="font-mono">{occ.tigerId}</td>
                          <td className="font-mono">{occ.areaKm2} km²</td>
                          <td className="font-mono">{occ.centroid}</td>
                          <td>
                            <span className={`trend-pill ${occ.status.toLowerCase().includes('shift') || occ.status.toLowerCase().includes('absence') ? 'warn' : 'stable'}`}>
                              {occ.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style>{`
        .live-map-root {
          position: relative; width: 100%; height: 100%;
          min-height: calc(100vh - 60px);
          overflow: hidden; background: #0e141b;
          display: flex; flex-direction: column;
        }

        /* Controls */
        .sim-controls-header {
          background: rgba(14,20,27,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 8px 16px;
          display: flex; justify-content: space-between; align-items: center; gap: 12px;
          z-index: 100;
        }
        .control-group { display: flex; gap: 6px; }
        .control-btn {
          padding: 4px 10px;
          background: rgba(79,172,254,0.08);
          border: 1px solid rgba(79,172,254,0.25);
          color: #4facfe; font-size: 11px; border-radius: 4px; cursor: pointer;
        }
        .control-btn.active { background: #4facfe; color: #000; font-weight: 700; }
        .mode-tabs { display: flex; gap: 6px; }
        .mode-btn {
          padding: 4px 12px; border-radius: 4px;
          border: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.03);
          color: var(--text-muted); font-size: 11px; cursor: pointer; font-weight: 600;
        }
        .mode-btn.active { background: rgba(16,185,129,0.15); border-color: #10b981; color: #34d399; }
        .status-badge { padding: 3px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; }
        .status-badge.count { background: rgba(255,255,255,0.06); color: #94a3b8; }

        /* Map wrapper */
        .live-map-wrapper {
          display: flex; flex: 1;
          height: calc(100vh - 120px);
          overflow: hidden; position: relative;
        }
        .google-map-frame { flex: 1; height: 100%; z-index: 1; }

        /* Legend */
        .map-legend {
          position: absolute; top: 14px; left: 14px; z-index: 1000;
          background: rgba(8,12,18,0.94);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px; padding: 12px 14px;
          min-width: 220px; backdrop-filter: blur(10px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .legend-header {
          font-size: 9px; color: #64748b; font-weight: 700;
          letter-spacing: 0.8px; margin-bottom: 10px;
        }
        .legend-tiger-row {
          display: flex; align-items: center;
          font-size: 11px; margin-bottom: 7px;
        }
        .legend-divider {
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 10px 0;
        }
        .legend-key-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; color: #64748b; margin-bottom: 5px;
        }
        .lk-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 2px solid #94a3b8;
          display: inline-block; flex-shrink: 0;
        }
        .white-dot { background: #fff; border-color: #64748b; }
        .lk-diamond {
          width: 10px; height: 10px;
          background: #94a3b8;
          clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%);
          display: inline-block; flex-shrink: 0;
        }
        .lk-box {
          width: 12px; height: 10px;
          border: 2px solid #94a3b8;
          background: rgba(148,163,184,0.15);
          border-radius: 2px;
          display: inline-block; flex-shrink: 0;
        }
        .demo-badge {
          margin-top: 10px; padding: 4px 8px;
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.35);
          border-radius: 4px; font-size: 9px;
          color: #fbbf24; font-weight: 700; letter-spacing: 0.4px;
        }

        /* Tiger popup */
        .tiger-popup {
          position: absolute; bottom: 24px; left: 20px; z-index: 1000;
          background: rgba(8,12,18,0.95);
          border: 1.5px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(14px);
          border-radius: 10px; padding: 14px 18px; min-width: 240px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.7);
          animation: popupFadeIn 0.25s ease-out;
        }
        .popup-close {
          position: absolute; top: 8px; right: 8px;
          background: rgba(255,255,255,0.08); border: none;
          color: #94a3b8; font-size: 12px; border-radius: 4px;
          width: 20px; height: 20px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .popup-close:hover { background: rgba(239,68,68,0.25); color: #f87171; }
        @keyframes popupFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Telemetry sidebar */
        .telemetry-sidebar {
          width: 280px;
          background: rgba(8,12,18,0.97);
          border-left: 1px solid rgba(255,255,255,0.07);
          padding: 12px; overflow-y: auto;
          display: flex; flex-direction: column; gap: 8px; z-index: 50;
        }
        .sidebar-title { font-size: 13px; color: #e2e8f0; margin: 0; }
        .occ-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-left: 3px solid;
          border-radius: 6px; padding: 8px;
          cursor: pointer; transition: background 0.2s;
        }
        .occ-card:hover { background: rgba(255,255,255,0.05); }
        .occ-header { display: flex; justify-content: space-between; align-items: center; }
        .occ-meta { font-size: 10px; color: var(--text-dim); margin-top: 4px; }

        /* Historical runs */
        .runs-container { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .runs-header-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 16px; }
        .runs-header-card h3 { margin: 0 0 4px; font-size: 16px; color: var(--text-bright); }
        .runs-header-card p  { margin: 0; font-size: 12px; color: var(--text-dim); }
        .runs-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .run-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
        .run-card-header { display: flex; justify-content: space-between; font-size: 13px; }
        .run-id { font-weight: 700; color: #10b981; }
        .run-date { color: var(--text-dim); }
        .run-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; }
        .green { color: #10b981; } .orange { color: #f97316; }
        .run-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .run-table th, .run-table td { padding: 6px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .run-table th { color: var(--text-dim); }
        .trend-pill { font-size: 9px; font-weight: 700; padding: 2px 4px; border-radius: 3px; }
        .trend-pill.stable { background: rgba(16,185,129,0.15); color: #34d399; }
        .trend-pill.warn   { background: rgba(239,68,68,0.15);  color: #f87171; }
        @media (max-width: 900px) { .runs-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
