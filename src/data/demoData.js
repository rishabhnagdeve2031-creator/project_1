/**
 * PenchGuard AI — Complete Demo/Prototype Data Layer
 * Pench Tiger Reserve Prototype Datasets
 */

// ── Camera Trap Stations (Survey-Effort Aware) ─────────────────
export const CAMERAS = [
  { id: 'CT-001', location: 'Core Zone A - Watering Hole', lat: 21.7380, lng: 79.3150, zone: 'Core Zone', status: 'online', lastCapture: '2 min ago', imagesProcessed: 142, animalsDetected: 18, battery: 92, signal: 95, installationDate: '2024-01-15', surveyActive: true },
  { id: 'CT-002', location: 'Core Zone A - Trail Junction', lat: 21.7420, lng: 79.3200, zone: 'Core Zone', status: 'online', lastCapture: '5 min ago', imagesProcessed: 98, animalsDetected: 12, battery: 87, signal: 88, installationDate: '2024-01-15', surveyActive: true },
  { id: 'CT-003', location: 'Core Zone B - River Crossing', lat: 21.7500, lng: 79.3350, zone: 'Core Zone', status: 'online', lastCapture: '8 min ago', imagesProcessed: 156, animalsDetected: 22, battery: 78, signal: 92, installationDate: '2024-02-01', surveyActive: true },
  { id: 'CT-004', location: 'Core Zone B - Bamboo Thicket', lat: 21.7550, lng: 79.3400, zone: 'Core Zone', status: 'online', lastCapture: '12 min ago', imagesProcessed: 67, animalsDetected: 8, battery: 95, signal: 90, installationDate: '2024-02-01', surveyActive: true },
  { id: 'CT-005', location: 'Core Zone C - Salt Lick', lat: 21.7300, lng: 79.3050, zone: 'Core Zone', status: 'online', lastCapture: '3 min ago', imagesProcessed: 203, animalsDetected: 31, battery: 64, signal: 85, installationDate: '2024-01-20', surveyActive: true },
  { id: 'CT-006', location: 'Buffer Zone North - Forest Edge', lat: 21.7600, lng: 79.3100, zone: 'Buffer Zone', status: 'online', lastCapture: '15 min ago', imagesProcessed: 45, animalsDetected: 5, battery: 91, signal: 78, installationDate: '2024-03-10', surveyActive: true },
  { id: 'CT-007', location: 'Buffer Zone North - Ridge Path', lat: 21.7650, lng: 79.3250, zone: 'Buffer Zone', status: 'online', lastCapture: '7 min ago', imagesProcessed: 89, animalsDetected: 11, battery: 82, signal: 82, installationDate: '2024-03-10', surveyActive: true },
  { id: 'CT-008', location: 'Buffer Zone East - Stream Bed', lat: 21.7350, lng: 79.3500, zone: 'Buffer Zone', status: 'online', lastCapture: '20 min ago', imagesProcessed: 112, animalsDetected: 14, battery: 73, signal: 75, installationDate: '2024-04-05', surveyActive: true },
  { id: 'CT-009', location: 'Buffer Zone South - Meadow', lat: 21.7100, lng: 79.3000, zone: 'Buffer Zone', status: 'online', lastCapture: '4 min ago', imagesProcessed: 78, animalsDetected: 9, battery: 88, signal: 80, installationDate: '2024-04-05', surveyActive: true },
  { id: 'CT-010', location: 'Buffer Zone West - Old Trail', lat: 21.7250, lng: 79.2800, zone: 'Buffer Zone', status: 'offline', lastCapture: '2 hours ago', imagesProcessed: 34, animalsDetected: 3, battery: 12, signal: 15, installationDate: '2024-04-12', surveyActive: false },
  { id: 'CT-011', location: 'Boundary Zone A - Village Edge', lat: 21.6950, lng: 79.2650, zone: 'Boundary Zone', status: 'online', lastCapture: '6 min ago', imagesProcessed: 56, animalsDetected: 7, battery: 80, signal: 68, installationDate: '2024-05-01', surveyActive: true },
  { id: 'CT-012', location: 'Boundary Zone A - Crop Field', lat: 21.6900, lng: 79.2550, zone: 'Boundary Zone', status: 'online', lastCapture: '10 min ago', imagesProcessed: 43, animalsDetected: 4, battery: 76, signal: 62, installationDate: '2024-05-01', surveyActive: true },
  { id: 'CT-013', location: 'Boundary Zone B - Road Crossing', lat: 21.7700, lng: 79.3500, zone: 'Boundary Zone', status: 'online', lastCapture: '18 min ago', imagesProcessed: 29, animalsDetected: 2, battery: 85, signal: 55, installationDate: '2024-05-15', surveyActive: true },
  { id: 'CT-014', location: 'Boundary Zone B - Sensitive Corridor', lat: 21.6920, lng: 79.2600, zone: 'Boundary Zone', status: 'online', lastCapture: '1 min ago', imagesProcessed: 167, animalsDetected: 19, battery: 69, signal: 72, installationDate: '2024-05-15', surveyActive: true },
  { id: 'CT-015', location: 'Core Zone A - Den Site', lat: 21.7400, lng: 79.3180, zone: 'Core Zone', status: 'online', lastCapture: '9 min ago', imagesProcessed: 91, animalsDetected: 15, battery: 83, signal: 93, installationDate: '2024-01-15', surveyActive: true },
  { id: 'CT-021', location: 'New Deployment - Buffer North', lat: 21.7720, lng: 79.3300, zone: 'Buffer Zone', status: 'online', lastCapture: '12 min ago', imagesProcessed: 12, animalsDetected: 1, battery: 98, signal: 92, installationDate: '2026-08-10', surveyActive: true }, // NEW STATION for Addition 13
];

// ── Enhanced Tiger Profiles ────────────────────────────────────
export const TIGER_PROFILES = [
  {
    id: 'TGR-01', name: 'Sultan', status: 'active', gender: 'Male', age: '~7 years',
    firstSeen: '12 Mar 2024', lastSeen: '16 Aug 2026, 10:00 AM', lastCamera: 'CT-005',
    zone: 'Core Zone', observationCount: 42, movementStatus: 'Stable in core zone',
    color: '#f97316', typicalIntervalDays: 4,
    centroid: { lat: 21.7350, lng: 79.3120 },
    previousCentroid: { lat: 21.7340, lng: 79.3110 },
    estimatedAreaKm2: 18.5,
    identificationStatus: 'Confirmed Match',
    homeRangePoly: [
      [21.745, 79.300], [21.748, 79.325], [21.725, 79.330], [21.720, 79.305]
    ],
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
    color: '#eab308', typicalIntervalDays: 6,
    centroid: { lat: 21.7180, lng: 79.2850 },
    previousCentroid: { lat: 21.7240, lng: 79.2950 },
    estimatedAreaKm2: 24.2,
    identificationStatus: 'Confirmed Match',
    homeRangePoly: [
      [21.730, 79.275], [21.735, 79.305], [21.705, 79.310], [21.700, 79.270]
    ],
    timeline: [
      { time: '08:30 AM', camera: 'CT-003', zone: 'Core Zone' },
      { time: '09:00 AM', camera: 'CT-008', zone: 'Buffer Zone' },
      { time: '09:30 AM', camera: 'CT-009', zone: 'Buffer Zone' },
      { time: '10:00 AM', camera: 'CT-009', zone: 'Buffer Zone' },
    ]
  },
  {
    id: 'TGR-03', name: 'Maya', status: 'active', gender: 'Female', age: '~4 years',
    firstSeen: '15 Jan 2025', lastSeen: '08 Jul 2026, 09:30 AM', lastCamera: 'CT-003', // 38 days ago for Prolonged Absence demo!
    zone: 'Core Zone', observationCount: 24, movementStatus: 'Possible prolonged absence ⚠️',
    color: '#8b5cf6', typicalIntervalDays: 8,
    centroid: { lat: 21.7520, lng: 79.3450 },
    previousCentroid: { lat: 21.7520, lng: 79.3450 },
    estimatedAreaKm2: 12.8,
    identificationStatus: 'Confirmed Match',
    homeRangePoly: [
      [21.760, 79.335], [21.762, 79.355], [21.745, 79.360], [21.740, 79.338]
    ],
    timeline: [
      { time: '08:30 AM', camera: 'CT-020', zone: 'Core Zone' },
      { time: '09:00 AM', camera: 'CT-004', zone: 'Core Zone' },
      { time: '09:30 AM', camera: 'CT-003', zone: 'Core Zone' },
    ]
  },
  {
    id: 'TGR-07', name: 'Kali', status: 'active', gender: 'Male', age: '~6 years',
    firstSeen: '04 Sep 2023', lastSeen: '16 Aug 2026, 10:42 AM', lastCamera: 'CT-014',
    zone: 'Boundary Zone', observationCount: 27, movementStatus: 'Moving toward boundary ⚠️',
    color: '#ef4444', typicalIntervalDays: 5,
    centroid: { lat: 21.6920, lng: 79.2600 },
    previousCentroid: { lat: 21.7200, lng: 79.3050 }, // 7.2 km shift -> Centroid Shift trigger!
    estimatedAreaKm2: 32.6,
    identificationStatus: 'Confirmed Match',
    homeRangePoly: [
      [21.725, 79.290], [21.720, 79.310], [21.685, 79.280], [21.680, 79.250]
    ],
    timeline: [
      { time: '08:12 AM', camera: 'CT-003', zone: 'Core Zone' },
      { time: '09:20 AM', camera: 'CT-008', zone: 'Buffer Zone' },
      { time: '10:20 AM', camera: 'CT-011', zone: 'Boundary Zone' },
      { time: '10:42 AM', camera: 'CT-014', zone: 'Boundary Zone' },
    ]
  }
];

// ── Quarantined Blank Images (Safe Deletion Workflow) ──────────
export const INITIAL_QUARANTINE = [
  { id: 'Q-001', fileName: 'CT003_IMG_00812.jpg', cameraId: 'CT-003', timestamp: '16 Aug 2026, 08:15 AM', blankConfidence: 98.4, reason: 'Wind/Vegetation Motion - No Animal Pixels Detected', status: 'quarantined' },
  { id: 'Q-002', fileName: 'CT009_IMG_00419.jpg', cameraId: 'CT-009', timestamp: '16 Aug 2026, 08:42 AM', blankConfidence: 97.1, reason: 'Shadow/Lighting Change - No Animal Pixels Detected', status: 'quarantined' },
  { id: 'Q-003', fileName: 'CT014_IMG_00980.jpg', cameraId: 'CT-014', timestamp: '16 Aug 2026, 09:11 AM', blankConfidence: 94.6, reason: 'Rain/Water Spray - No Animal Pixels Detected', status: 'quarantined' },
  { id: 'Q-004', fileName: 'CT001_IMG_00104.jpg', cameraId: 'CT-001', timestamp: '16 Aug 2026, 09:55 AM', blankConfidence: 96.8, reason: 'Sun Flare - No Animal Pixels Detected', status: 'quarantined' },
];

// ── Human Review Queue (Ambiguous Identification) ──────────────
export const INITIAL_HUMAN_REVIEW = [
  {
    id: 'REV-001',
    fileName: 'CT014_IMG_01042.jpg',
    cameraId: 'CT-014',
    timestamp: '16 Aug 2026, 10:40 AM',
    candidate1: { id: 'TGR-07', name: 'Kali', confidence: 72 },
    candidate2: { id: 'TGR-03', name: 'Maya', confidence: 64 },
    status: 'pending',
    notes: 'Partial flank view due to foliage obstruction.'
  },
  {
    id: 'REV-002',
    fileName: 'CT008_IMG_00331.jpg',
    cameraId: 'CT-008',
    timestamp: '16 Aug 2026, 09:15 AM',
    candidate1: { id: 'TGR-02', name: 'Shera', confidence: 68 },
    candidate2: { id: 'TGR-01', name: 'Sultan', confidence: 61 },
    status: 'pending',
    notes: 'Night flash exposure reflection.'
  }
];

// ── Audit Log Initial Records ──────────────────────────────────
export const INITIAL_AUDIT_LOG = [
  { id: 'AUD-001', timestamp: '16 Aug 2026, 10:42:01 AM', actor: 'AI Pipeline', type: 'Detection', title: 'Tiger Detected', details: 'CT-014 captured image CT014_IMG_01042.jpg. YOLO Confidence: 94.2%.' },
  { id: 'AUD-002', timestamp: '16 Aug 2026, 10:42:05 AM', actor: 'Stripe Matching Service', type: 'Identification', title: 'Ambiguous Stripe Match', details: 'Stripe pattern ambiguity between TGR-07 (72%) and TGR-03 (64%). Queued for Human Review.' },
  { id: 'AUD-003', timestamp: '16 Aug 2026, 10:42:10 AM', actor: 'DeviationEngine', type: 'Alert Trigger', title: 'Boundary Risk Alert Generated', details: 'Alert ALT-001 created. TGR-07 detected in Sensitive Boundary Zone B.' },
  { id: 'AUD-004', timestamp: '16 Aug 2026, 10:30:00 AM', actor: 'Human Operator', type: 'Quarantine Action', title: 'Confirmed Blank Image Q-002', details: 'Operator confirmed CT009_IMG_00419.jpg as blank. Safe deletion confirmed.' },
];

// ── Historical Processing Runs (Run Comparison) ───────────────
export const HISTORICAL_RUNS = [
  {
    id: 'RUN-001',
    date: '01 Aug 2026',
    imagesProcessed: 1120,
    blankImages: 810,
    usefulImages: 310,
    tigerDetections: 38,
    occupancySummary: [
      { tigerId: 'TGR-01', areaKm2: 17.2, centroid: '21.734°N, 79.311°E', status: 'Stable' },
      { tigerId: 'TGR-02', areaKm2: 21.0, centroid: '21.724°N, 79.295°E', status: 'Stable' },
      { tigerId: 'TGR-03', areaKm2: 12.8, centroid: '21.752°N, 79.345°E', status: 'Stable' },
      { tigerId: 'TGR-07', areaKm2: 24.5, centroid: '21.720°N, 79.305°E', status: 'Stable' },
    ]
  },
  {
    id: 'RUN-002',
    date: '08 Aug 2026',
    imagesProcessed: 1240,
    blankImages: 915,
    usefulImages: 325,
    tigerDetections: 41,
    occupancySummary: [
      { tigerId: 'TGR-01', areaKm2: 18.0, centroid: '21.734°N, 79.311°E', status: 'Stable' },
      { tigerId: 'TGR-02', areaKm2: 23.5, centroid: '21.721°N, 79.290°E', status: 'Minor Shift' },
      { tigerId: 'TGR-03', areaKm2: 12.8, centroid: '21.752°N, 79.345°E', status: 'No Detections' },
      { tigerId: 'TGR-07', areaKm2: 28.1, centroid: '21.705°N, 79.280°E', status: 'Expanding South' },
    ]
  },
  {
    id: 'RUN-003',
    date: '16 Aug 2026 (Current)',
    imagesProcessed: 1247,
    blankImages: 920,
    usefulImages: 327,
    tigerDetections: 42,
    occupancySummary: [
      { tigerId: 'TGR-01', areaKm2: 18.5, centroid: '21.735°N, 79.312°E', status: 'Stable' },
      { tigerId: 'TGR-02', areaKm2: 24.2, centroid: '21.718°N, 79.285°E', status: 'Buffer Shift' },
      { tigerId: 'TGR-03', areaKm2: 12.8, centroid: '21.752°N, 79.345°E', status: 'PROLONGED ABSENCE ⚠️' },
      { tigerId: 'TGR-07', areaKm2: 32.6, centroid: '21.692°N, 79.260°E', status: 'BOUNDARY SHIFT 🚨' },
    ]
  }
];

// ── Initial Observations ──────────────────────────────────────
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
];

// ── Initial Explainable Alerts ────────────────────────────────
export const INITIAL_ALERTS = [
  {
    id: 'ALT-001', type: 'Boundary Movement', severity: 'HIGH',
    tigerId: 'TGR-07', cameraId: 'CT-014',
    timestamp: '16 Aug 2026, 10:42 AM',
    location: 'Boundary Zone B - Sensitive Corridor',
    description: 'Potential boundary movement detected. Tiger TGR-07 (Kali) observed moving toward sensitive corridor near village area.',
    whatChanged: 'Activity centroid shifted 7.2 km south toward human settlement boundary.',
    supportingEvidence: [
      'Historical Centroid: 21.720°N, 79.305°E',
      'Current Position: 21.692°N, 79.260°E (CT-014)',
      'Distance to Village Boundary: 650 meters'
    ],
    confidence: 94,
    surveyEffort: 'Sufficient (CT-014 Active since 2024-05-15)',
    status: 'active',
    lat: 21.6920, lng: 79.2600
  },
  {
    id: 'ALT-002', type: 'Zone Transition', severity: 'MEDIUM',
    tigerId: 'TGR-02', cameraId: 'CT-009',
    timestamp: '16 Aug 2026, 09:30 AM',
    location: 'Buffer Zone South - Meadow',
    description: 'Tiger TGR-02 (Shera) has moved from Core Zone to Buffer Zone.',
    whatChanged: 'Crossed core boundary line into buffer zone.',
    supportingEvidence: [
      'Previous Station: CT-003 (Core Zone)',
      'Current Station: CT-009 (Buffer Zone)',
      'Centroid Shift: 2.1 km'
    ],
    confidence: 91,
    surveyEffort: 'Sufficient',
    status: 'active',
    lat: 21.7180, lng: 79.2850
  },
  {
    id: 'ALT-003', type: 'Prolonged Absence', severity: 'MEDIUM',
    tigerId: 'TGR-03', cameraId: 'CT-003',
    timestamp: '16 Aug 2026, 08:00 AM',
    location: 'Core Zone B',
    description: 'Possible prolonged absence detected for Tiger TGR-03 (Maya).',
    whatChanged: 'No camera sightings logged for 38 consecutive days.',
    supportingEvidence: [
      'Typical Sighting Interval: 8 days',
      'Days Since Last Sighting: 38 days',
      'Camera Mesh Status: All surrounding cameras (CT-003, CT-004, CT-020) 100% online'
    ],
    confidence: 78,
    surveyEffort: 'Mesh Active — No Hardware Outage',
    status: 'active',
    lat: 21.7520, lng: 79.3450
  },
  {
    id: 'ALT-004',
    type: 'Possible Territory Exit',
    severity: 'MEDIUM',
    tigerId: 'TGR-07',
    cameraId: 'CT-K01',
    timestamp: '16 Aug 2026, 11:15 AM',
    location: 'Kali Territory — South-East Boundary',
    description: 'Tiger TGR-07 (Kali) is approaching the boundary of her established territory and may move outside her normal range.',
    whatChanged: 'Kali is approaching the boundary of her established territory and may move outside her normal range.',
    supportingEvidence: [
      'Current Position: 21.7120°N, 79.3340°E (CT-K01)',
      'Boundary Proximity: 180 meters from territory perimeter (heading North-East)',
      'Status: Approaching territory boundary — still inside established polygon',
      'Recommendation: Forest officer review recommended'
    ],
    confidence: 94,
    surveyEffort: 'Active Camera Mesh (90%+ Confidence)',
    status: 'active',
    lat: 21.7120,
    lng: 79.3340
  }
];

// ── KPI & Batch Efficiency Data ───────────────────────────────
export const KPI_DATA = {
  camerasOnline: 18,
  camerasTotal: 20,
  imagesProcessed: 1247,
  blankImages: 920,
  usefulImages: 327,
  tigerDetections: 42,
  otherAnimalDetections: 285,
  individualTigers: 4,
  pendingHumanReviews: 2,
  activeDeviations: 2,
  activeAlerts: 4,
  highRiskZones: 1,
  storageSavedGb: 2.4,
  processingTimeMin: '4m 21s'
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
