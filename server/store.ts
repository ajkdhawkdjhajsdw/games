import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export interface StoredUser { id: string; subject: string; name: string; createdAt: number }

/** A single process owns this database; mutations never await inside transactions. */
export class Store {
  readonly db: DatabaseSync;
  constructor(path = 'data/quiet-harbor.sqlite') {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA foreign_keys=ON;
      PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, subject TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, state TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, room_id TEXT NOT NULL, revision INTEGER NOT NULL, kind TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(room_id, revision));
      CREATE TABLE IF NOT EXISTS results (scenario_id TEXT PRIMARY KEY, users TEXT NOT NULL, result TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS mastery (user_id TEXT NOT NULL, distinct_key TEXT NOT NULL, track TEXT NOT NULL, PRIMARY KEY(user_id, distinct_key, track));
      CREATE TABLE IF NOT EXISTS blocks (owner_id TEXT NOT NULL, target_id TEXT NOT NULL, PRIMARY KEY(owner_id,target_id));
      CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, reporter_id TEXT NOT NULL, room_id TEXT NOT NULL, scenario_id TEXT, category TEXT NOT NULL, detail TEXT NOT NULL, created_at INTEGER NOT NULL);
    `);
  }
  transaction<T>(operation: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = operation(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  user(subject: string, name: string, now: number): StoredUser {
    this.db.prepare('INSERT INTO users VALUES (?,?,?,?) ON CONFLICT(subject) DO UPDATE SET name=excluded.name').run(randomUUID(), subject, name, now);
    const row = this.db.prepare('SELECT * FROM users WHERE subject=?').get(subject)!;
    return { id: String(row.id), subject: String(row.subject), name: String(row.name), createdAt: Number(row.created_at) };
  }
  getRoom<T>(id: string): T | undefined {
    const row = this.db.prepare('SELECT state FROM rooms WHERE id=?').get(id);
    return row ? JSON.parse(String(row.state)) as T : undefined;
  }
  allRooms<T>(): T[] { return this.db.prepare('SELECT state FROM rooms').all().map(row => JSON.parse(String(row.state)) as T); }
  saveRoom(room: { id: string; revision: number }, now: number, kind = 'room.changed'): void {
    const previous = room.revision;
    room.revision++;
    const update = this.db.prepare('UPDATE rooms SET revision=?,state=? WHERE id=? AND revision=?').run(room.revision, JSON.stringify(room), room.id, previous);
    if (!update.changes) {
      if (previous !== 0) throw new Error('ROOM_REVISION_CONFLICT');
      this.db.prepare('INSERT INTO rooms VALUES (?,?,?)').run(room.id, room.revision, JSON.stringify(room));
    }
    this.db.prepare('INSERT INTO outbox VALUES (?,?,?,?,?)').run(randomUUID(), room.id, room.revision, kind, now);
  }
  blocked(a: string, b: string): boolean {
    return !!this.db.prepare('SELECT 1 FROM blocks WHERE (owner_id=? AND target_id=?) OR (owner_id=? AND target_id=?) LIMIT 1').get(a,b,b,a);
  }
  close(): void { this.db.close(); }
}
