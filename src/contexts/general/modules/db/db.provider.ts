import Database, { DatabaseConfig } from '@crane-technologies/database';
import { queries } from '@/queries';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { seedCabysIfNeeded } from './cabys.seeder';

export const DATABASE = 'DATABASE';

let db: Database | null = null;

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let i = 0;

  while (i < sql.length) {
    const tagMatch = sql[i] === '$' ? sql.slice(i).match(/^\$([A-Za-z_]*)\$/) : null;

    if (tagMatch) {
      const tag = tagMatch[0];
      if (!inDollarQuote) {
        inDollarQuote = true;
        dollarTag = tag;
      } else if (tag === dollarTag) {
        inDollarQuote = false;
        dollarTag = '';
      }
      current += tag;
      i += tag.length;
      continue;
    }

    if (!inDollarQuote && sql[i] === ';') {
      const stmt = current.trim();
      const upper = stmt.toUpperCase();
      if (stmt && upper !== 'BEGIN' && upper !== 'COMMIT') {
        statements.push(stmt);
      }
      current = '';
    } else {
      current += sql[i];
    }
    i++;
  }

  const remaining = current.trim();
  if (remaining) statements.push(remaining);
  return statements;
}

async function bootstrapIfNeeded(database: Database): Promise<void> {
  const result = await database.rawQuery<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'general_schema' AND table_name = 'role'
    ) AS exists
  `);

  if (result.rows[0]?.exists) {
    console.log('Database already initialized. Skipping bootstrap.');
    return;
  }

  console.log('Database not initialized. Running bootstrap...');
  const sql = readFileSync(join(__dirname, 'database_backup.sql'), 'utf8');
  const statements = splitSqlStatements(sql);

  const txn = await database.transaction();
  try {
    for (const stmt of statements) {
      await txn.rawQuery(stmt);
    }
    await txn.commit();
    console.log(`Bootstrap completed: ${statements.length} statements executed.`);
  } catch (err) {
    await txn.rollback();
    throw new Error(`Bootstrap failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export const dbProvider = {
  provide: DATABASE,
  useFactory: async (configService: ConfigService) => {
    const config: DatabaseConfig = {
      connectionString: configService.get<string>('DB_CONNECTION'),
      max: Number(configService.get<number>('MAX_POOL_SIZE')) || 10,
      ssl: { rejectUnauthorized: false },
    };

    db = Database.getInstance(config, queries);
    console.log('Database connection established');

    await bootstrapIfNeeded(db);
    await seedCabysIfNeeded(db);

    return db;
  },
  inject: [ConfigService],
};
