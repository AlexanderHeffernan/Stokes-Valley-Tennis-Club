import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('./audit-dependencies.mjs', import.meta.url))
const finding = (name, advisory) => ({
  name, severity: 'high', nodes: [`node_modules/${name}`],
  via: [{ name, severity: 'high', url: `https://github.com/advisories/${advisory}` }]
})
const baseline = {
  braces: finding('braces', 'GHSA-vfj7-8cjw-p6xm'),
  'node-forge': finding('node-forge', 'GHSA-86w9-cpqp-85rv'),
  nitro: { name: 'nitro', severity: 'high', via: ['nuxt', 'braces', 'node-forge'] },
  nuxt: { name: 'nuxt', severity: 'high', via: ['nitro'] }
}

test('audit CLI enforces advisory, version, expiry and fail-closed boundaries', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'svtc-audit-test-'))
  const npm = join(directory, 'npm')
  writeFileSync(npm, `#!/usr/bin/env node
import fs from 'node:fs';
console.log(fs.readFileSync('audit.json', 'utf8'));
process.exit(Number(process.env.FIXTURE_STATUS));
`)
  chmodSync(npm, 0o755)
  writeFileSync(join(directory, 'package.json'), '{"type":"module"}')
  const clock = join(directory, 'clock.mjs')
  try {
    const cases = [
      { name: 'accepts only the reviewed causes, including cyclic inherited entries', pass: true },
      { name: 'accepts a clean audit', pass: true, clean: true, status: 0 },
      { name: 'rejects a new advisory on an otherwise accepted package', mutate: v => v.braces.via.push({ name: 'braces', severity: 'high', url: 'https://github.com/advisories/GHSA-new-advisory' }) },
      { name: 'rejects another high dependency', mutate: v => { v.other = finding('other', 'GHSA-other') } },
      { name: 'rejects critical severity even for an accepted advisory', mutate: v => { v.braces.severity = 'critical'; v.braces.via[0].severity = 'critical' } },
      { name: 'rejects a changed package version', version: '3.0.4' },
      { name: 'rejects a mismatched nested copy', mutate: v => v.braces.nodes.push('node_modules/nested/node_modules/braces') },
      { name: 'accepts immediately before expiry', pass: true, now: '2026-11-21T23:59:59.999Z' },
      { name: 'rejects at the expiry boundary', now: '2026-11-22T00:00:00Z' },
      { name: 'rejects missing dependency causes', mutate: v => { v.nitro.via = ['missing'] } },
      { name: 'rejects a cycle with no advisory cause', mutate: v => { v.nitro.via = ['nuxt'] } },
      { name: 'rejects an audit service error', error: true },
      { name: 'rejects invalid JSON', raw: 'not JSON' },
      { name: 'rejects an unsupported report format', reportVersion: 3 },
      { name: 'rejects inconsistent severity totals', incorrectTotal: true },
      { name: 'rejects unexpected npm exit status', status: 2 }
    ]
    for (const scenario of cases) {
      await t.test(scenario.name, () => {
        const vulnerabilities = scenario.clean ? {} : structuredClone(baseline)
        scenario.mutate?.(vulnerabilities)
        const counts = { high: 0, critical: 0 }
        for (const value of Object.values(vulnerabilities)) counts[value.severity]++
        if (scenario.incorrectTotal) counts.high++
        const report = { auditReportVersion: scenario.reportVersion || 2, vulnerabilities, metadata: { vulnerabilities: counts } }
        if (scenario.error) report.error = { code: 'ENOAUDIT' }
        writeFileSync(join(directory, 'audit.json'), scenario.raw || JSON.stringify(report))
        writeFileSync(join(directory, 'package-lock.json'), JSON.stringify({ packages: {
          'node_modules/braces': { version: scenario.version || '3.0.3' },
          'node_modules/node-forge': { version: '1.4.0' }
        } }))
        writeFileSync(clock, `Date.now = () => ${Date.parse(scenario.now || '2026-10-23T00:00:00Z')};`)
        const result = spawnSync(process.execPath, ['--import', clock, script], {
          cwd: directory, encoding: 'utf8',
          env: { ...process.env, PATH: directory + delimiter + process.env.PATH, FIXTURE_STATUS: String(scenario.status ?? 1) }
        })
        assert.equal(result.status, scenario.pass ? 0 : 1, result.stdout + result.stderr)
        if (scenario.pass && !scenario.clean) {
          assert.match(result.stdout, /4 high\/critical package entries, 2 accepted underlying advisories/)
          assert.match(result.stdout, /TEMPORARILY ACCEPTED until 2026-11-22T00:00:00Z/)
        }
        if (!scenario.pass) assert.match(result.stderr, /Audit policy failed:/)
      })
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
