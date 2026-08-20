import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { migrations } from '../db/migrations'
import { hashPassword } from './password'

const databasePath = resolve(process.env.DATABASE_PATH || 'data/app.db')
mkdirSync(dirname(databasePath), { recursive: true })

export const db = new Database(databasePath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.pragma('busy_timeout = 5000')

db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`)

const applyMigration = db.transaction((version: number, name: string, sql: string) => {
  db.exec(sql)
  db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)').run(version, name)
})

const applied = new Set(
  db.prepare('SELECT version FROM _migrations').all().map(row => (row as { version: number }).version)
)

for (const migration of migrations) {
  if (!applied.has(migration.version)) applyMigration(migration.version, migration.name, migration.sql)
}

const userCount = (db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }).count
if (userCount === 0) {
  const username = process.env.ADMIN_INITIAL_USERNAME || 'siteadmin'
  const configuredPassword = process.env.ADMIN_INITIAL_PASSWORD
  const password = configuredPassword || (process.env.NODE_ENV === 'production' ? null : 'change-me-now')

  if (password) {
    db.prepare(`
      INSERT INTO users (username, display_name, password_hash, role)
      VALUES (?, 'Site Administrator', ?, 'owner')
    `).run(username, hashPassword(password))

    db.prepare(`
      INSERT INTO audit_log (user_id, username, action, entity_type, entity_id, changes_json)
      VALUES ((SELECT id FROM users WHERE username = ?), ?, 'account.created', 'user', ?, ?)
    `).run(username, username, username, JSON.stringify({ source: 'initial bootstrap' }))

    if (!configuredPassword) {
      console.warn('[cms] Development administrator created: siteadmin / change-me-now')
    }
  } else {
    console.warn('[cms] No administrator created. Set ADMIN_INITIAL_USERNAME and ADMIN_INITIAL_PASSWORD.')
  }
}
