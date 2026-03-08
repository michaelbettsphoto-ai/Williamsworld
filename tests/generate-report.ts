/**
 * Report Generator — Aggregates Playwright JSON test results into QA-REPORT.md
 * Run with: ts-node tests/generate-report.ts
 */
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Types (Playwright JSON reporter output schema)
// ─────────────────────────────────────────────────────────────────────────────

interface TestResult {
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: { message: string; stack?: string };
  attachments?: Array<{ name: string; path?: string; contentType: string }>;
  retry: number;
}

interface TestCase {
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  results: TestResult[];
  location: { file: string; line: number };
}

interface TestSuite {
  title: string;
  specs: TestCase[];
  suites?: TestSuite[];
}

interface PlaywrightReport {
  stats: {
    expected: number;
    skipped: number;
    unexpected: number;
    flaky: number;
    duration: number;
    startTime: string;
  };
  suites: TestSuite[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function flattenSpecs(suite: TestSuite): TestCase[] {
  const specs: TestCase[] = [...(suite.specs ?? [])];
  for (const child of suite.suites ?? []) {
    specs.push(...flattenSpecs(child));
  }
  return specs;
}

function statusIcon(status: string): string {
  switch (status) {
    case 'passed': return '✅';
    case 'failed': return '❌';
    case 'timedOut': return '⏱️';
    case 'skipped': return '⏭️';
    default: return '❓';
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function stabilityScore(passed: number, total: number, failedCritical: number): number {
  if (total === 0) return 0;
  const passRate = passed / total;
  const criticalPenalty = Math.min(failedCritical * 5, 20);
  return Math.max(0, Math.round(passRate * 100 - criticalPenalty));
}

function getFileAgent(filePath: string): 'A' | 'B' | 'C' | 'unknown' {
  if (filePath.includes('visual-ui')) return 'A';
  if (filePath.includes('functional-logic')) return 'B';
  if (filePath.includes('chaos-monkey')) return 'C';
  return 'unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Report Generator
// ─────────────────────────────────────────────────────────────────────────────

function generateReport(resultsPath: string, outputPath: string): void {
  if (!fs.existsSync(resultsPath)) {
    console.error(`Results file not found: ${resultsPath}`);
    console.error('Run: npm run test:all   to generate results first.');
    process.exit(1);
  }

  const raw = fs.readFileSync(resultsPath, 'utf-8');
  const report: PlaywrightReport = JSON.parse(raw);

  // Flatten all specs
  const allSpecs: TestCase[] = [];
  for (const suite of report.suites ?? []) {
    allSpecs.push(...flattenSpecs(suite));
  }

  // Categorise by agent
  const agentA = allSpecs.filter((s) => getFileAgent(s.location?.file ?? '') === 'A');
  const agentB = allSpecs.filter((s) => getFileAgent(s.location?.file ?? '') === 'B');
  const agentC = allSpecs.filter((s) => getFileAgent(s.location?.file ?? '') === 'C');

  // Stats
  const totalTests = allSpecs.length;
  const passed = allSpecs.filter((s) => s.status === 'passed').length;
  const failed = allSpecs.filter((s) => s.status === 'failed' || s.status === 'timedOut').length;
  const skipped = allSpecs.filter((s) => s.status === 'skipped').length;
  const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;
  const score = stabilityScore(passed, totalTests, failed);
  const totalDuration = report.stats?.duration ?? 0;

  const runDate = report.stats?.startTime
    ? new Date(report.stats.startTime).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    : new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  const verdict =
    score >= 90 ? '🟢 STABLE'
    : score >= 70 ? '🟡 MOSTLY STABLE'
    : score >= 50 ? '🟠 NEEDS ATTENTION'
    : '🔴 CRITICAL ISSUES';

  // ─── Build Markdown ───────────────────────────────────────────────────────

  const lines: string[] = [];

  lines.push('# Williams World — QA Audit Report');
  lines.push('');
  lines.push(`**Target:** https://michaelbettsphoto-ai.github.io/Williamsworld/`);
  lines.push(`**Run Date:** ${runDate}`);
  lines.push(`**Duration:** ${formatDuration(totalDuration)}`);
  lines.push(`**Branch:** \`claude/qa-audit-williams-world-XcbvJ\``);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Tests | ${totalTests} |`);
  lines.push(`| Passed | ${passed} ✅ |`);
  lines.push(`| Failed | ${failed} ❌ |`);
  lines.push(`| Skipped | ${skipped} ⏭️ |`);
  lines.push(`| Pass Rate | ${passRate}% |`);
  lines.push(`| **Stability Score** | **${score}/100** |`);
  lines.push(`| Overall Verdict | ${verdict} |`);
  lines.push('');

  // Agent summaries
  const agentSummary = (label: string, specs: TestCase[]) => {
    const p = specs.filter((s) => s.status === 'passed').length;
    const f = specs.filter((s) => s.status === 'failed' || s.status === 'timedOut').length;
    return `| Agent ${label} | ${specs.length} | ${p} | ${f} |`;
  };

  lines.push('### Agent Summary');
  lines.push('');
  lines.push('| Agent | Tests | Passed | Failed |');
  lines.push('|-------|-------|--------|--------|');
  lines.push(agentSummary('A (Visual/UI)', agentA));
  lines.push(agentSummary('B (Functional)', agentB));
  lines.push(agentSummary('C (Chaos)', agentC));
  lines.push('');
  lines.push('---');
  lines.push('');

  // Per-agent logs
  const renderAgentLog = (label: string, description: string, specs: TestCase[]) => {
    lines.push(`## ${label}: ${description}`);
    lines.push('');
    if (specs.length === 0) {
      lines.push('_No tests found for this agent._');
      lines.push('');
      return;
    }
    for (const spec of specs) {
      const icon = statusIcon(spec.status);
      const dur = spec.results?.[0]?.duration ?? 0;
      lines.push(`### ${icon} ${spec.title}`);
      lines.push('');
      lines.push(`- **Status:** ${spec.status}`);
      lines.push(`- **Duration:** ${formatDuration(dur)}`);
      if (spec.status === 'failed' || spec.status === 'timedOut') {
        const err = spec.results?.[0]?.error;
        if (err) {
          lines.push(`- **Error:** \`${err.message.slice(0, 300).replace(/\n/g, ' ')}\``);
        }
        // Check for screenshot
        const screenshots = spec.results?.[0]?.attachments?.filter(
          (a) => a.contentType === 'image/png'
        );
        if (screenshots && screenshots.length > 0) {
          lines.push(`- **Screenshot:** \`${screenshots[0].path ?? screenshots[0].name}\``);
        }
        // Check for trace
        const traces = spec.results?.[0]?.attachments?.filter(
          (a) => a.name === 'trace' || a.contentType === 'application/zip'
        );
        if (traces && traces.length > 0) {
          lines.push(`- **Trace:** \`${traces[0].path ?? traces[0].name}\``);
        }
      }
      lines.push('');
    }
  };

  renderAgentLog(
    'Agent A Log',
    'Visual / UI (Responsive Design & CSS Integrity)',
    agentA
  );
  lines.push('---');
  lines.push('');
  renderAgentLog(
    'Agent B Log',
    'Functional / Logic (User Journeys & State)',
    agentB
  );
  lines.push('---');
  lines.push('');
  renderAgentLog(
    'Agent C Log',
    'Chaos Monkey (Edge Cases & Breakage)',
    agentC
  );
  lines.push('---');
  lines.push('');

  // Critical Failures
  const criticalFails = allSpecs.filter(
    (s) => s.status === 'failed' || s.status === 'timedOut'
  );
  lines.push('## Critical Failures');
  lines.push('');
  if (criticalFails.length === 0) {
    lines.push('_No critical failures detected. 🎉_');
  } else {
    for (const spec of criticalFails) {
      lines.push(`### ❌ ${spec.title}`);
      lines.push('');
      const err = spec.results?.[0]?.error;
      if (err) {
        lines.push('```');
        lines.push(err.message.slice(0, 500));
        lines.push('```');
      }
      lines.push('');
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');
  if (failed === 0) {
    lines.push('- ✅ All tests passed. Monitor for regressions on future deployments.');
    lines.push('- Consider adding visual regression snapshots to lock in current appearance.');
    lines.push('- Add performance tests (Core Web Vitals) as the next QA milestone.');
  } else {
    if (agentA.some((s) => s.status === 'failed')) {
      lines.push('- **Visual/UI:** Review CSS variables and responsive breakpoints. Check font loading from Google Fonts.');
    }
    if (agentB.some((s) => s.status === 'failed')) {
      lines.push('- **Functional:** Review DOM selectors — some IDs/classes may have changed. Verify localStorage key names match current code.');
    }
    if (agentC.some((s) => s.status === 'failed')) {
      lines.push('- **Chaos:** Add error boundaries / try-catch around localStorage reads. Test offline scenario with a service worker for caching.');
    }
    lines.push('- Re-run failed tests after fixes: `npm run test:all`');
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('_Report generated by Williams World QA Agent Swarm — Playwright TypeScript_');

  // Write output
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`✅ Report written to: ${outputPath}`);
  console.log(`   Total: ${totalTests} | Passed: ${passed} | Failed: ${failed} | Score: ${score}/100 | Verdict: ${verdict}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────────────────────────────────────────

const resultsFile = path.resolve(__dirname, '../test-results/results.json');
const reportFile = path.resolve(__dirname, '../QA-REPORT.md');
generateReport(resultsFile, reportFile);
