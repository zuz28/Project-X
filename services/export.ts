import { Session } from '../store';

export function exportSessionsAsCSV(sessions: Session[]): string {
  const headers = [
    'Session ID',
    'Session Date',
    'Impact ID',
    'Impact Timestamp',
    'G-Force',
    'Rotational (rad/s²)',
    'Flagged',
  ];

  const rows = sessions
    .flatMap(session =>
      session.impacts.map(impact => [
        session.id,
        new Date(session.date).toISOString(),
        impact.id,
        new Date(impact.timestamp).toISOString(),
        impact.gForce.toString(),
        impact.rotational.toString(),
        impact.flagged ? 'Yes' : 'No',
      ])
    )
    .map(row => row.map(cell => `"${cell}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function exportSessionsAsJSON(sessions: Session[]): string {
  return JSON.stringify(sessions, null, 2);
}

export function generateReport(sessions: Session[]): string {
  const allImpacts = sessions.flatMap(s => s.impacts);
  const criticalImpacts = allImpacts.filter(i => i.gForce > 60);
  const highImpacts = allImpacts.filter(i => i.gForce > 40 && i.gForce <= 60);
  const totalImpacts = allImpacts.length;
  const avgG =
    totalImpacts > 0
      ? (allImpacts.reduce((sum, i) => sum + i.gForce, 0) / totalImpacts).toFixed(1)
      : '0';
  const maxG = totalImpacts > 0 ? Math.max(...allImpacts.map(i => i.gForce)).toFixed(1) : '0';

  const report = `
VELA IMPACT TRACKING REPORT
Generated: ${new Date().toISOString()}

SUMMARY
-------
Total Sessions: ${sessions.length}
Total Impacts: ${totalImpacts}
Average G-Force: ${avgG}G
Maximum G-Force: ${maxG}G

RISK ASSESSMENT
---------------
Critical Impacts (>60G): ${criticalImpacts.length}
High Impacts (40-60G): ${highImpacts.length}
Flagged Impacts: ${allImpacts.filter(i => i.flagged).length}

RECOMMENDATIONS
---------------
${getRecommendationsText(criticalImpacts.length, highImpacts.length)}

SESSIONS DETAIL
---------------
${sessions
  .map(
    session => `
Session: ${new Date(session.date).toLocaleString()}
Impacts: ${session.impacts.length}
Max G-Force: ${Math.max(...session.impacts.map(i => i.gForce)).toFixed(1)}G
Flagged: ${session.impacts.filter(i => i.flagged).length}
`
  )
  .join('\n')}

DISCLAIMER
----------
This report is for informational purposes only. For any concerns about head injuries,
please consult with a healthcare professional.
`;

  return report;
}

function getRecommendationsText(critical: number, high: number): string {
  const lines: string[] = [];

  if (critical > 0) {
    lines.push(`• CRITICAL: ${critical} critical impact(s) detected. Seek medical evaluation immediately.`);
  }

  if (high >= 3) {
    lines.push(`• ALERT: ${high} high-impact events recorded. Consider consulting healthcare provider.`);
  }

  if (high > 0 && high < 3) {
    lines.push(`• CAUTION: ${high} high-impact event(s). Monitor for symptoms closely.`);
  }

  if (lines.length === 0) {
    lines.push('• Your impact profile appears normal. Continue monitoring.');
  }

  return lines.join('\n');
}

export async function shareReport(sessions: Session[]): Promise<void> {
  const report = generateReport(sessions);
  const csv = exportSessionsAsCSV(sessions);

  // In a real app, this would use Share API
  console.log('Report generated:', report);
  console.log('CSV generated:', csv);
}
