export interface Migration {
  version: number
  name: string
  sql: string
}

const defaultHomeClubDaysJson = JSON.stringify({
  heading: 'Find your time to play',
  introduction: 'There is a regular session for every age, stage and style of play.',
  daysJson: JSON.stringify([
    { name: 'Junior Club Day', schedule: 'Saturdays, 9am–12pm', note: 'For ages 5–12 and older junior players during the summer season.', linkUrl: '/juniors' },
    { name: 'Senior Club Day', schedule: 'Saturdays, 1:30pm–5pm', note: 'Social tennis for senior members and prospective players.', linkUrl: '/seniors' },
    { name: 'Midweek Tennis', schedule: 'Tuesdays, 9am–11:30am', note: 'Social doubles followed by morning tea during the summer season.', linkUrl: '/seniors' },
    { name: 'Monday Night Tennis', schedule: 'Mondays from 7pm', note: 'An evening opportunity to get on court and enjoy a hit.', linkUrl: '/seniors' },
    { name: 'Wednesday Night Tennis', schedule: 'Wednesdays from 7pm', note: 'Midweek evening tennis for club members.', linkUrl: '/seniors' }
  ])
}).replaceAll("'", "''")

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
        'Tennis for everyone.', 'In Stokes Valley.',
        'A friendly local club for juniors, seniors, families and players of every ability.',
        '',
        'Tennis for everyone.', 'In Stokes Valley.',
        'A friendly local club for juniors, seniors, families and players of every ability.',
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
        "item1Icon":"map-pin","item1Heading":"Great Facilities","item1Text":"Four AstroTurf courts, including two newer courts with lights, plus clubrooms and public courts.","item1Color":"#00251e",
        "item2Icon":"users-three","item2Heading":"All Ages Welcome","item2Text":"Tennis for juniors, seniors, families, midweek players and everyone in between.","item2Color":"#dadf3c",
        "item3Icon":"tennis-ball","item3Heading":"Play Your Way","item3Text":"Social tennis, professional coaching, interclub competition and casual club days.","item3Color":"#d42e00",
        "item4Icon":"heart","item4Heading":"Community Focused","item4Text":"A friendly, non-profit club serving Stokes Valley and the wider community since 1951.","item4Color":"#dadf3c"
      }');
    `
  },
  {
    version: 4,
    name: 'add_home_explore',
    sql: `
      CREATE TABLE home_explore (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        content_json TEXT NOT NULL,
        published_by INTEGER REFERENCES users(id),
        published_at TEXT
      );

      INSERT INTO home_explore (id, content_json) VALUES (1, '{
        "card1ImageUrl":"","card1Icon":"users-three","card1Heading":"Junior Tennis","card1Value":"Coaching, interclub and fun for young players.","card1LinkText":"Explore juniors","card1LinkUrl":"/juniors",
        "card2ImageUrl":"","card2Icon":"tennis-ball","card2Heading":"Senior Tennis","card2Value":"Social and competitive tennis for every level.","card2LinkText":"Explore seniors","card2LinkUrl":"/seniors",
        "card3ImageUrl":"","card3Icon":"heart","card3Heading":"Membership","card3Value":"Options for juniors, seniors, students and midweek players.","card3LinkText":"Membership information","card3LinkUrl":"/join",
        "card4ImageUrl":"","card4Icon":"calendar","card4Heading":"Club Days","card4Value":"Find a regular social or coaching session that works for you.","card4LinkText":"See club days","card4LinkUrl":"/about#club-days"
      }');
    `
  },
  {
    version: 5,
    name: 'add_home_sponsors',
    sql: `
      CREATE TABLE home_sponsors (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        content_json TEXT NOT NULL,
        published_by INTEGER REFERENCES users(id),
        published_at TEXT
      );

      INSERT INTO home_sponsors (id, content_json)
      VALUES (1, '{"itemsJson":"[]"}');
    `
  },
  {
    version: 6,
    name: 'add_site_footer',
    sql: `
      CREATE TABLE site_footer (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        content_json TEXT NOT NULL,
        published_by INTEGER REFERENCES users(id),
        published_at TEXT
      );

      INSERT INTO site_footer (id, content_json) VALUES (1, '{
        "address":"Stokes Valley, Lower Hutt",
        "email":"",
        "phone":"",
        "facebookUrl":"",
        "ctaHeading":"Come have a hit!",
        "ctaText":"New members are always welcome. Get in touch or come along for a hit."
      }');
    `
  },
  {
    version: 7,
    name: 'add_home_club_days',
    sql: `
      CREATE TABLE home_club_days (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        content_json TEXT NOT NULL,
        published_by INTEGER REFERENCES users(id),
        published_at TEXT
      );

      INSERT INTO home_club_days (id, content_json)
      VALUES (1, '${defaultHomeClubDaysJson}');
    `
  },
  {
    version: 8,
    name: 'repair_home_club_days_default_json',
    sql: `
      UPDATE home_club_days
      SET content_json = '${defaultHomeClubDaysJson}'
      WHERE NOT json_valid(content_json);
    `
  },
  {
    version: 9,
    name: 'shorten_default_home_hero_heading',
    sql: `
      UPDATE home_hero
      SET draft_headline_2 = 'In Stokes Valley.'
      WHERE draft_headline_2 = 'Right here in Stokes Valley.';

      UPDATE home_hero
      SET published_headline_2 = 'In Stokes Valley.'
      WHERE published_headline_2 = 'Right here in Stokes Valley.';
    `
  },
  {
    version: 10,
    name: 'add_durable_login_throttling',
    sql: `
      CREATE TABLE login_throttles (
        scope_key TEXT PRIMARY KEY,
        failed_count INTEGER NOT NULL,
        first_failed_at TEXT NOT NULL,
        last_failed_at TEXT NOT NULL,
        locked_until TEXT
      );

      CREATE INDEX login_throttles_last_failed_idx ON login_throttles(last_failed_at);
      DELETE FROM sessions
      WHERE id NOT IN (SELECT MAX(id) FROM sessions GROUP BY user_id);
      CREATE UNIQUE INDEX sessions_one_per_user_idx ON sessions(user_id);
    `
  }
]
