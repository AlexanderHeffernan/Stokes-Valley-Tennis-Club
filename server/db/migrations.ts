export interface Migration {
  version: number
  name: string
  sql: string
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_cms',
    sql: `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('owner', 'editor')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_hash TEXT NOT NULL UNIQUE,
        csrf_token TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX sessions_token_hash_idx ON sessions(token_hash);
      CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

      CREATE TABLE home_hero (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        draft_headline_1 TEXT NOT NULL,
        draft_headline_2 TEXT NOT NULL,
        draft_subheading TEXT NOT NULL,
        draft_image_url TEXT NOT NULL,
        published_headline_1 TEXT NOT NULL,
        published_headline_2 TEXT NOT NULL,
        published_subheading TEXT NOT NULL,
        published_image_url TEXT NOT NULL,
        updated_by INTEGER REFERENCES users(id),
        published_by INTEGER REFERENCES users(id),
        updated_at TEXT,
        published_at TEXT
      );

      INSERT INTO home_hero (
        id,
        draft_headline_1, draft_headline_2, draft_subheading, draft_image_url,
        published_headline_1, published_headline_2, published_subheading, published_image_url
      ) VALUES (
        1,
        'More than a club.', 'A place to play.',
        'Friendly people. Great tennis.\nAll ages and abilities welcome.',
        '',
        'More than a club.', 'A place to play.',
        'Friendly people. Great tennis.\nAll ages and abilities welcome.',
        ''
      );

      CREATE TABLE audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        changes_json TEXT NOT NULL,
        ip_address TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX audit_log_entity_idx ON audit_log(entity_type, entity_id, created_at);
      CREATE INDEX audit_log_user_idx ON audit_log(user_id, created_at);
    `
  },
  {
    version: 2,
    name: 'remove_default_hero_image',
    sql: `
      UPDATE home_hero
      SET draft_image_url = '', published_image_url = ''
      WHERE draft_image_url = '/images/hero-placeholder.svg'
        OR published_image_url = '/images/hero-placeholder.svg';
    `
  },
  {
    version: 3,
    name: 'add_home_highlights',
    sql: `
      CREATE TABLE home_highlights (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        content_json TEXT NOT NULL,
        published_by INTEGER REFERENCES users(id),
        published_at TEXT
      );

      INSERT INTO home_highlights (id, content_json) VALUES (1, '{
        "item1Icon":"trophy","item1Heading":"Great Facilities","item1Text":"Quality courts, practice facilities and a welcoming clubhouse.","item1Color":"#00251e",
        "item2Icon":"users-three","item2Heading":"All Ages Welcome","item2Text":"Juniors, seniors, families and everyone in between.","item2Color":"#dadf3c",
        "item3Icon":"tennis-ball","item3Heading":"Play Your Way","item3Text":"Social tennis, coaching, interclub and tournaments.","item3Color":"#d42e00",
        "item4Icon":"heart","item4Heading":"Community Focused","item4Text":"A welcoming club at the heart of Stokes Valley.","item4Color":"#dadf3c"
      }');
    `
  }
]
