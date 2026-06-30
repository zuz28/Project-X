import type { Session } from '../services/mockImpacts';
import { calculateSessionStats } from './analytics';

export interface ExportFormat {
  format: 'json' | 'csv';
  mimeType: string;
  extension: string;
}

const formats: Record<string, ExportFormat> = {
  json: {
    format: 'json',
    mimeType: 'application/json',
    extension: 'json',
  },
  csv: {
    format: 'csv',
    mimeType: 'text/csv',
    extension: 'csv',
  },
};

export function exportSession(session: Session, formatType: 'json' | 'csv'): string {
  const format = formats[formatType];

  if (format.format === 'json') {
    return exportAsJSON(session);
  }

  return exportAsCSV(session);
}

function exportAsJSON(session: Session): string {
  const stats = calculateSessionStats(session);

  const data = {
    session: {
      id: session.id,
      date: new Date(session.date).toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    statistics: stats,
    impacts: session.impacts.map(impact => ({
      id: impact.id,
      timestamp: new Date(impact.timestamp).toISOString(),
      gForce: impact.gForce,
      rotational: impact.rotational,
      flagged: impact.flagged,
    })),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

function exportAsCSV(session: Session): string {
  const stats = calculateSessionStats(session);
  let csv = 'Vela Impact Export\n';
  csv += `Session ID,${session.id}\n`;
  csv += `Date,${new Date(session.date).toISOString()}\n`;
  csv += `Total Impacts,${stats.totalImpacts}\n`;
  csv += `Max G-Force,${stats.maxGForce}\n`;
  csv += `Avg G-Force,${stats.avgGForce}\n`;
  csv += `Max Rotational,${stats.maxRotational}\n`;
  csv += `Flagged Count,${stats.flaggedCount}\n`;
  csv += `Risk Percentage,${stats.riskPercentage}%\n`;
  csv += `Severity,${stats.severity}\n\n`;

  csv += 'Impact Data\n';
  csv += 'Timestamp,G-Force,Rotational (rad/s²),Flagged\n';

  session.impacts
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach(impact => {
      csv += `${new Date(impact.timestamp).toISOString()},${impact.gForce},${impact.rotational},${impact.flagged ? 'Yes' : 'No'}\n`;
    });

  return csv;
}

export function generateFilename(session: Session, format: 'json' | 'csv'): string {
  const date = new Date(session.date);
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `vela-session-${dateStr}-${timeStr}.${format}`;
}
