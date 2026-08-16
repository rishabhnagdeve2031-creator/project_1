/**
 * PenchGuard AI — Demo/Prototype Data
 * All data is simulated for hackathon demonstration purposes.
 * Clearly labeled as PROTOTYPE DATA — not real Pench Tiger Reserve operational data.
 */

// ── Camera Traps ──────────────────────────────────────────────
export const CAMERAS = [
  { id: 'CT-001', location: 'Core Zone A - Watering Hole', lat: 21.7380, lng: 79.3150, zone: 'Core Zone', status: 'online', lastCapture: '2 min ago', imagesProcessed: 142, animalsDetected: 18, battery: 92, signal: 95 },
  { id: 'CT-002', location: 'Core Zone A - Trail Junction', lat: 21.7420, lng: 79.3200, zone: 'Core Zone', status: 'online', lastCapture: '5 min ago', imagesProcessed: 98, animalsDetected: 12, battery: 87, signal: 88 },
  { id: 'CT-003', location: 'Core Zone B - River Crossing', lat: 21.7500, lng: 79.3350, zone: 'Core Zone', status: 'online', lastCapture: '8 min ago', imagesProcessed: 156, animalsDetected: 22, battery: 78, signal: 92 },
  { id: 'CT-004', location: 'Core Zone B - Bamboo Thicket', lat: 21.7550, lng: 79.3400, zone: 'Core Zone', status: 'online', lastCapture: '12 min ago', imagesProcessed: 67, animalsDetected: 8, battery: 95, signal: 90 },
  { id: 'CT-005', location: 'Core Zone C - Salt Lick', lat: 21.7300, lng: 79.3050, zone: 'Core Zone', status: 'online', lastCapture: '3 min ago', imagesProcessed: 203, animalsDetected: 31, battery: 64, signal: 85 },
  { id: 'CT-006', location: 'Buffer Zone North - Forest Edge', lat: 21.7600, lng: 79.3100, zone: 'Buffer Zone', status: 'online', lastCapture: '15 min ago', imagesProcessed: 45, animalsDetected: 5, battery: 91, signal: 78 },
  { id: 'CT-007', location: 'Buffer Zone North - Ridge Path', lat: 21.7650, lng: 79.3250, zone: 'Buffer Zone', status: 'online', lastCapture: '7 min ago', imagesProcessed: 89, animalsDetected: 11, battery: 82, signal: 82 },
  { id: 'CT-008', location: 'Buffer Zone East - Stream Bed', lat: 21.7350, lng: 79.3500, zone: 'Buffer Zone', status: 'online', lastCapture: '20 min ago', imagesProcessed: 112, animalsDetected: 14, battery: 73, signal: 75 },
  { id: 'CT-009', location: 'Buffer Zone South - Meadow', lat: 21.7100, lng: 79.3000, zone: 'Buffer Zone', status: 'online', lastCapture: '4 min ago', imagesProcessed: 78, animalsDetected: 9, battery: 88, signal: 80 },
  { id: 'CT-010', location: 'Buffer Zone West - Old Trail', lat: 21.7250, lng: 79.2800, zone: 'Buffer Zone', status: 'offline', lastCapture: '2 hours ago', imagesProcessed: 34, animalsDetected: 3, battery: 12, signal: 15 },
  { id: 'CT-011', location: 'Boundary Zone A - Village Edge', lat: 21.6950, lng: 79.2650, zone: 'Boundary Zone', status: 'online', lastCapture: '6 min ago', imagesProcessed: 56, animalsDetected: 7, battery: 80, signal: 68 },
  { id: 'CT-012', location: 'Boundary Zone A - Crop Field', lat: 21.6900, lng: 79.2550, zone: 'Boundary Zone', status: 'online', lastCapture: '10 min ago', imagesProcessed: 43, animalsDetected: 4, battery: 76, signal: 62 },
  { id: 'CT-013', location: 'Boundary Zone B - Road Crossing', lat: 21.7700, lng: 79.3500, zone: 'Boundary Zone', status: 'online', lastCapture: '18 min ago', imagesProcessed: 29, animalsDetected: 2, battery: 85, signal: 55 },
  { id: 'CT-014', location: 'Boundary Zone B - Sensitive Corridor', lat: 21.6920, lng: 79.2600, zone: 'Boundary Zone', status: 'online', lastCapture: '1 min ago', imagesProcessed: 167, animalsDetected: 19, battery: 69, signal: 72 },
  { id: 'CT-015', location: 'Core Zone A - Den Site', lat: 21.7400, lng: 79.3180, zone: 'Core Zone', status: 'online', lastCapture: '9 min ago', imagesProcessed: 91, animalsDetected: 15, battery: 83, signal: 93 },
  { id: 'CT-016', location: 'Buffer Zone East - Hilltop', lat: 21.7450, lng: 79.3550, zone: 'Buffer Zone', status: 'online', lastCapture: '14 min ago', imagesProcessed: 38, animalsDetected: 4, battery: 90, signal: 70 },
  { id: 'CT-017', location: 'Core Zone C - Pond', lat: 21.7280, lng: 79.3100, zone: 'Core Zone', status: 'online', lastCapture: '6 min ago', imagesProcessed: 124, animalsDetected: 20, battery: 71, signal: 87 },
  { id: 'CT-018', location: 'Buffer Zone South - Grassland', lat: 21.7050, lng: 79.2900, zone: 'Buffer Zone', status: 'offline', lastCapture: '3 hours ago', imagesProcessed: 22, animalsDetected: 1, battery: 5, signal: 0 },
  { id: 'CT-019', location: 'Boundary Zone C - Farm Border', lat: 21.6850, lng: 79.2700, zone: 'Boundary Zone', status: 'online', lastCapture: '11 min ago', imagesProcessed: 31, animalsDetected: 3, battery: 77, signal: 58 },
  { id: 'CT-020', location: 'Core Zone B - Teak Forest', lat: 21.7480, lng: 79.3280, zone: 'Core Zone', status: 'online', lastCapture: '3 min ago', imagesProcessed: 108, animalsDetected: 16, battery: 86, signal: 91 },
];

// ── Tiger Profiles ────────────────────────────────────────────
export const TIGER_PROFILES = [
  {
    id: 'TGR-01', name: 'Sultan', status: 'active', gender: 'Male', age: '~7 years',
    firstSeen: '12 Mar 2024', lastSeen: '16 Aug 2026, 10:00 AM', lastCamera: 'CT-005',
    zone: 'Core Zone', observationCount: 42, movementStatus: 'Stable in core zone',
    color: '#f97316',
    timeline: [
      { time: '08:30 AM', camera: 'CT-001', zone: 'Core Zone' },
      { time: '09:00 AM', camera: 'CT-005', zone: 'Core Zone' },
      { time: '09:30 AM', camera: 'CT-015', zone: 'Core Zone' },
      { time: '10:00 AM', camera: 'CT-005', zone: 'Core Zone' },
    ]
  },
  {
    id: 'TGR-02', name: 'Shera', status: 'active', gender: 'Male', age: '~5 years',
    firstSeen: '28 Jun 2024', lastSeen: '16 Aug 2026, 10:00 AM', lastCamera: 'CT-009',
    zone: 'Buffer Zone', observationCount: 31, movementStatus: 'Moving toward buffer zone',
    color: '#eab308',
    timeline: [
      { time: '08:30 AM', camera: 'CT-003', zone: 'Core Zone' },
      { time: '09:00 AM', camera: 'CT-008', zone: 'Buffer Zone' },
      { time: '09:30 AM', camera: 'CT-009', zone: 'Buffer Zone' },
      { time: '10:00 AM', camera: 'CT-009', zone: 'Buffer Zone' },
    ]
  },
  {
    id: 'TGR-03', name: 'Maya', status: 'active', gender: 'Female', age: '~4 years',
    firstSeen: '15 Jan 2025', lastSeen: '16 Aug 2026, 10:00 AM', lastCamera: 'CT-003',
    zone: 'Core Zone', observationCount: 24, movementStatus: 'Stable in core zone',
    color: '#8b5cf6',
    timeline: [
      { time: '08:30 AM', camera: 'CT-020', zone: 'Core Zone' },
      { time: '09:00 AM', camera: 'CT-004', zone: 'Core Zone' },
      { time: '09:30 AM', camera: 'CT-003', zone: 'Core Zone' },
      { time: '10:00 AM', camera: 'CT-003', zone: 'Core Zone' },
    ]
  },
  {
    id: 'TGR-07', name: 'Kali', status: 'active', gender: 'Male', age: '~6 years',
    firstSeen: '04 Sep 2023', lastSeen: '16 Aug 2026, 10:42 AM', lastCamera: 'CT-014',
    zone: 'Boundary Zone', observationCount: 27, movementStatus: 'Moving toward boundary ⚠️',
    color: '#ef4444',
    timeline: [
      { time: '08:12 AM', camera: 'CT-003', zone: 'Core Zone' },
      { time: '09:20 AM', camera: 'CT-008', zone: 'Buffer Zone' },
      { time: '10:20 AM', camera: 'CT-011', zone: 'Boundary Zone' },
      { time: '10:42 AM', camera: 'CT-014', zone: 'Boundary Zone' },
    ]
  }
];

// ── Observations ──────────────────────────────────────────────
export const INITIAL_OBSERVATIONS = [
  { id: 'OBS-001', tigerId: 'TGR-01', cameraId: 'CT-005', timestamp: '16 Aug 2026, 10:00 AM', zone: 'Core Zone', confidence: 96, detectionType: 'Automated', status: 'Confirmed', lat: 21.7350, lng: 79.3120 },
  { id: 'OBS-002', tigerId: 'TGR-02', cameraId: 'CT-009', timestamp: '16 Aug 2026, 10:00 AM', zone: 'Buffer Zone', confidence: 91, detectionType: 'Automated', status: 'Confirmed', lat: 21.7180, lng: 79.2850 },
  { id: 'OBS-003', tigerId: 'TGR-03', cameraId: 'CT-003', timestamp: '16 Aug 2026, 10:00 AM', zone: 'Core Zone', confidence: 93, detectionType: 'Automated', status: 'Confirmed', lat: 21.7520, lng: 79.3450 },
  { id: 'OBS-004', tigerId: 'TGR-07', cameraId: 'CT-014', timestamp: '16 Aug 2026, 10:42 AM', zone: 'Boundary Zone', confidence: 94, detectionType: 'Automated', status: 'Confirmed', lat: 21.6920, lng: 79.2600 },
  { id: 'OBS-005', tigerId: 'TGR-07', cameraId: 'CT-011', timestamp: '16 Aug 2026, 10:20 AM', zone: 'Boundary Zone', confidence: 88, detectionType: 'Automated', status: 'Confirmed', lat: 21.7000, lng: 79.2750 },
  { id: 'OBS-006', tigerId: 'TGR-07', cameraId: 'CT-008', timestamp: '16 Aug 2026, 09:20 AM', zone: 'Buffer Zone', confidence: 92, detectionType: 'Automated', status: 'Confirmed', lat: 21.7100, lng: 79.2900 },
  { id: 'OBS-007', tigerId: 'TGR-01', cameraId: 'CT-015', timestamp: '16 Aug 2026, 09:30 AM', zone: 'Core Zone', confidence: 97, detectionType: 'Automated', status: 'Confirmed', lat: 21.7338, lng: 79.3108 },
  { id: 'OBS-008', tigerId: 'TGR-02', cameraId: 'CT-008', timestamp: '16 Aug 2026, 09:00 AM', zone: 'Buffer Zone', confidence: 89, detectionType: 'Automated', status: 'Confirmed', lat: 21.7235, lng: 79.2940 },
  { id: 'OBS-009', tigerId: 'TGR-03', cameraId: 'CT-004', timestamp: '16 Aug 2026, 09:00 AM', zone: 'Core Zone', confidence: 95, detectionType: 'Automated', status: 'Confirmed', lat: 21.7500, lng: 79.3420 },
  { id: 'OBS-010', tigerId: 'TGR-07', cameraId: 'CT-003', timestamp: '16 Aug 2026, 08:12 AM', zone: 'Core Zone', confidence: 90, detectionType: 'Automated', status: 'Confirmed', lat: 21.7200, lng: 79.3050 },
  { id: 'OBS-011', tigerId: 'TGR-01', cameraId: 'CT-001', timestamp: '15 Aug 2026, 06:45 PM', zone: 'Core Zone', confidence: 94, detectionType: 'Automated', status: 'Confirmed', lat: 21.7310, lng: 79.3080 },
  { id: 'OBS-012', tigerId: 'TGR-02', cameraId: 'CT-003', timestamp: '15 Aug 2026, 04:20 PM', zone: 'Core Zone', confidence: 87, detectionType: 'Automated', status: 'Confirmed', lat: 21.7260, lng: 79.2980 },
];

// ── Alerts ────────────────────────────────────────────────────
export const INITIAL_ALERTS = [
  {
    id: 'ALT-001', type: 'Boundary Movement', severity: 'HIGH',
    tigerId: 'TGR-07', cameraId: 'CT-014',
    timestamp: '16 Aug 2026, 10:42 AM',
    location: 'Boundary Zone B - Sensitive Corridor',
    description: 'Potential boundary movement detected. Tiger TGR-07 (Kali) observed moving toward sensitive corridor near village area.',
    status: 'active',
    lat: 21.6920, lng: 79.2600
  },
  {
    id: 'ALT-002', type: 'Zone Transition', severity: 'MEDIUM',
    tigerId: 'TGR-02', cameraId: 'CT-009',
    timestamp: '16 Aug 2026, 09:30 AM',
    location: 'Buffer Zone South - Meadow',
    description: 'Tiger TGR-02 (Shera) has moved from Core Zone to Buffer Zone. Monitoring movement pattern.',
    status: 'active',
    lat: 21.7180, lng: 79.2850
  },
  {
    id: 'ALT-003', type: 'Camera Offline', severity: 'LOW',
    tigerId: null, cameraId: 'CT-010',
    timestamp: '16 Aug 2026, 08:15 AM',
    location: 'Buffer Zone West - Old Trail',
    description: 'Camera CT-010 has gone offline. Low battery (12%). Signal lost.',
    status: 'acknowledged',
    lat: 21.7250, lng: 79.2800
  },
  {
    id: 'ALT-004', type: 'Boundary Proximity', severity: 'HIGH',
    tigerId: 'TGR-07', cameraId: 'CT-011',
    timestamp: '16 Aug 2026, 10:20 AM',
    location: 'Boundary Zone A - Village Edge',
    description: 'Tiger TGR-07 (Kali) detected near village boundary. Movement trajectory suggests continued boundary approach.',
    status: 'active',
    lat: 21.7000, lng: 79.2750
  },
];

// ── KPI Data ──────────────────────────────────────────────────
export const KPI_DATA = {
  camerasOnline: 18,
  camerasTotal: 20,
  imagesProcessed: 1240,
  tigersDetected: 12,
  individualTigers: 4,
  activeAlerts: 2,
  highRiskZones: 1,
};

// ── Analytics Chart Data ──────────────────────────────────────
export const DETECTION_CHART_DATA = [
  { day: 'Mon', count: 8 },
  { day: 'Tue', count: 12 },
  { day: 'Wed', count: 6 },
  { day: 'Thu', count: 15 },
  { day: 'Fri', count: 10 },
  { day: 'Sat', count: 18 },
  { day: 'Sun', count: 14 },
];

export const ZONE_DISTRIBUTION = [
  { zone: 'Core Zone', count: 48, color: '#10b981' },
  { zone: 'Buffer Zone', count: 28, color: '#eab308' },
  { zone: 'Boundary Zone', count: 12, color: '#ef4444' },
];

export const CAMERA_ACTIVITY_DATA = [
  { hour: '6AM', captures: 22 },
  { hour: '8AM', captures: 45 },
  { hour: '10AM', captures: 38 },
  { hour: '12PM', captures: 15 },
  { hour: '2PM', captures: 12 },
  { hour: '4PM', captures: 32 },
  { hour: '6PM', captures: 48 },
  { hour: '8PM', captures: 35 },
];

export const ALERTS_TREND = [
  { day: 'Mon', high: 0, medium: 1, low: 2 },
  { day: 'Tue', high: 1, medium: 0, low: 1 },
  { day: 'Wed', high: 0, medium: 2, low: 0 },
  { day: 'Thu', high: 2, medium: 1, low: 1 },
  { day: 'Fri', high: 0, medium: 1, low: 3 },
  { day: 'Sat', high: 1, medium: 0, low: 0 },
  { day: 'Sun', high: 2, medium: 1, low: 1 },
];
