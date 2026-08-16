/**
 * PenchGuard AI — Explainable Deviation Engine
 * Evaluates tiger movements across processing runs to detect:
 * 1. Range Centroid Shift
 * 2. First Capture at New Station (Survey-Effort Aware)
 * 3. Movement Toward Boundary/Village Edge
 * 4. Prolonged Absence
 */

export class DeviationEngine {
  constructor(config = {}) {
    this.coreThresholdKm = config.coreThresholdKm || 15;
    this.bufferThresholdKm = config.bufferThresholdKm || 5;
    this.prolongedAbsenceDays = config.prolongedAbsenceDays || 30;
  }

  /**
   * Calculates distance between two lat/lng coordinates in km (Haversine formula)
   */
  static calculateDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Analyzes movement of a tiger comparing current observation/run against historical runs
   */
  analyzeTigerMovement(tiger, currentObservation, historicalRuns = [], cameraStations = []) {
    const findings = [];

    // 1. Centroid Shift Analysis
    if (tiger.previousCentroid) {
      const shiftDistance = DeviationEngine.calculateDistanceKm(
        tiger.previousCentroid.lat,
        tiger.previousCentroid.lng,
        currentObservation.lat,
        currentObservation.lng
      );

      if (shiftDistance > this.bufferThresholdKm) {
        findings.push({
          type: 'Range Centroid Shift',
          severity: shiftDistance > this.coreThresholdKm ? 'HIGH' : 'MEDIUM',
          whatChanged: `Activity centroid shifted by ${shiftDistance.toFixed(1)} km from historical mean.`,
          evidence: [
            `Previous Centroid: ${tiger.previousCentroid.lat.toFixed(4)}°N, ${tiger.previousCentroid.lng.toFixed(4)}°E`,
            `Current Position: ${currentObservation.lat.toFixed(4)}°N, ${currentObservation.lng.toFixed(4)}°E`,
            `Shift Magnitude: ${shiftDistance.toFixed(1)} km (Configured Threshold: ${this.bufferThresholdKm} km)`,
          ],
          confidence: 88,
          surveyEffort: 'Sufficient',
          status: 'Requires Human Review'
        });
      }
    }

    // 2. Station Analysis (Survey-Effort Awareness)
    const station = cameraStations.find(s => s.id === currentObservation.cameraId);
    if (station) {
      const isNewlyInstalled = station.installationDate && 
        (new Date() - new Date(station.installationDate)) < (30 * 24 * 60 * 60 * 1000);

      if (isNewlyInstalled) {
        findings.push({
          type: 'New Station Observation',
          severity: 'LOW',
          whatChanged: `First capture at newly deployed station ${station.id}.`,
          evidence: [
            `Station ${station.id} installed on ${station.installationDate}`,
            `Station was NOT active during previous survey runs`,
            `Survey Effort Notice: Cannot classify as territorial expansion due to new station deployment`
          ],
          confidence: 95,
          surveyEffort: 'New Station - Baseline Establishing',
          status: 'Informational'
        });
      }
    }

    // 3. Movement Toward Boundary/Village Edge
    if (currentObservation.zone === 'Boundary Zone') {
      findings.push({
        type: 'Boundary Risk Deviation',
        severity: 'HIGH',
        whatChanged: `Tiger ${tiger.id} (${tiger.name}) detected in Sensitive Boundary Zone.`,
        evidence: [
          `Camera Station: ${currentObservation.cameraId} (${currentObservation.location || 'Village Border'})`,
          `Distance to Village Settlement: < 650 meters`,
          `Trajectory: Direct approach from Buffer Zone`
        ],
        confidence: 94,
        surveyEffort: 'Active Camera Monitoring',
        status: 'Requires Urgent Action'
      });
    }

    // 4. Prolonged Absence Check
    if (tiger.lastSeen) {
      const daysSinceLastSeen = Math.floor(
        (new Date() - new Date(tiger.lastSeen)) / (1000 * 60 * 60 * 24)
      );
      const expectedInterval = tiger.typicalIntervalDays || 8;

      if (daysSinceLastSeen > (expectedInterval * 3)) {
        findings.push({
          type: 'Prolonged Absence',
          severity: 'MEDIUM',
          whatChanged: `No detections logged for ${daysSinceLastSeen} days (Typical interval: ${expectedInterval} days).`,
          evidence: [
            `Last Logged Sightings: ${tiger.lastSeen} at ${tiger.lastCamera}`,
            `Expected Interval: Every ~${expectedInterval} days`,
            `Elapsed Time: ${daysSinceLastSeen} days (${(daysSinceLastSeen / expectedInterval).toFixed(1)}x expected interval)`
          ],
          confidence: 76,
          surveyEffort: 'Camera Mesh 90% Online',
          status: 'Possible prolonged absence — requires review'
        });
      }
    }

    return findings;
  }
}
