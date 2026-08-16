/**
 * PenchGuard AI — Data Export Utility
 * Exports Observations, Tiger Database, Alerts, and Occupancy data to CSV and JSON formats
 * suitable for Forest Department reports.
 */

export class ExportService {
  static downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static convertToCSV(array) {
    if (!array || !array.length) return '';
    const keys = Object.keys(array[0]).filter(k => typeof array[0][k] !== 'object');
    const header = keys.join(',');
    const rows = array.map(item =>
      keys.map(key => {
        let val = item[key];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        if (val.includes(',') || val.includes('\n')) val = `"${val}"`;
        return val;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  }

  static exportObservationsCSV(observations) {
    const csv = this.convertToCSV(observations);
    this.downloadFile(`PenchGuard_Observations_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv');
  }

  static exportTigerDatabaseJSON(tigers) {
    const json = JSON.stringify(tigers, null, 2);
    this.downloadFile(`PenchGuard_TigerDatabase_${new Date().toISOString().slice(0, 10)}.json`, json, 'application/json');
  }

  static exportAlertsCSV(alerts) {
    const csv = this.convertToCSV(alerts);
    this.downloadFile(`PenchGuard_Alerts_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv');
  }
}
