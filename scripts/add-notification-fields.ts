import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import * as schema from '../src/db/schema';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const db = drizzle(client, { schema });
  await db.execute(`ALTER TABLE users ADD COLUMN notif_email boolean NOT NULL DEFAULT true`);
  await db.execute(`ALTER TABLE users ADD COLUMN notif_system boolean NOT NULL DEFAULT true`);
  await db.execute(`ALTER TABLE users ADD COLUMN notif_onboarding boolean NOT NULL DEFAULT false`);
  await client.end();
  console.log('Notification preference columns added to users table.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
