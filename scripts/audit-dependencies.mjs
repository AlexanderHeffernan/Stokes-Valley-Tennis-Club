import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Approved temporary risk acceptance, not vulnerability fixes. Remove these
// entries when upstream patches land; changing versions requires a fresh review.
// Nitro uses braces for build-time file scans and node-forge through listhen's
// development HTTPS tooling. Neither chain was found in the production bundle.
// The Docker image still ships them in its root dependency tree.
const exceptions = [
  { name: 'braces', version: '3.0.3', advisory: 'GHSA-vfj7-8cjw-p6xm' },
  { name: 'node-forge', version: '1.4.0', advisory: 'GHSA-86w9-cpqp-85rv' }
]
const expiresAt = '2026-11-22T00:00:00Z'

try {
  if (Date.now() >= Date.parse(expiresAt)) {
    throw new Error(`Temporary audit exceptions expired at ${expiresAt}; remove or explicitly re-review them`)
  }

  const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], { encoding: 'utf8' })
  if (result.error || ![0, 1].includes(result.status)) {
    throw new Error(`npm audit could not complete (exit ${result.status}): ${result.error?.message || result.stderr}`)
  }
  const report = JSON.parse(result.stdout)
  if (report.error || report.auditReportVersion !== 2 || !report.vulnerabilities || !report.metadata?.vulnerabilities) {
    throw new Error('npm audit returned an error or an unsupported report; no findings were accepted')
  }
  console.log('Raw npm audit totals:', report.metadata.vulnerabilities)
  const vulnerabilities = report.vulnerabilities
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
  const blocking = Object.entries(vulnerabilities).filter(([, item]) => ['high', 'critical'].includes(item.severity))
  if (blocking.length !== report.metadata.vulnerabilities.high + report.metadata.vulnerabilities.critical) {
    throw new Error('npm audit severity totals do not match its findings')
  }

  const accepted = new Set()
  function inspect(name, visited = new Set()) {
    if (visited.has(name)) return 0
    visited.add(name)
    const item = vulnerabilities[name]
    if (!item || item.name !== name || !Array.isArray(item.via) || item.via.length === 0) {
      throw new Error(`Missing or invalid audit cause for ${name}`)
    }
    let causes = 0
    for (const cause of item.via) {
      if (typeof cause === 'string') {
        causes += inspect(cause, visited)
        continue
      }
      const exception = exceptions.find(entry => entry.name === name && cause.name === name
        && cause.url === `https://github.com/advisories/${entry.advisory}`)
      if (!exception || item.severity !== 'high' || cause.severity !== 'high'
        || !Array.isArray(item.nodes) || item.nodes.length === 0
        || item.nodes.some(path => lock.packages?.[path]?.version !== exception.version)) {
        throw new Error(`Unaccepted finding: ${name}: ${cause.url || 'unknown advisory'} (or package version changed)`)
      }
      accepted.add(`${exception.advisory}: ${name}@${exception.version}`)
      causes++
    }
    return causes
  }

  for (const [name, item] of blocking) {
    if (item.severity === 'critical') throw new Error(`Critical finding: ${name}; no critical exceptions are permitted`)
    if (inspect(name) === 0) throw new Error(`No advisory cause could be established for ${name}`)
  }
  for (const entry of accepted) console.log(`TEMPORARILY ACCEPTED until ${expiresAt}: ${entry}`)
  console.log(`Audit policy passed: ${blocking.length} high/critical package entries, ${accepted.size} accepted underlying advisories; no other high/critical findings`)
} catch (error) {
  console.error(`Audit policy failed: ${error.message}`)
  process.exitCode = 1
}
