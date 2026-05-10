import Database, { DatabaseConfig } from '@crane-technologies/database';
import { queries } from '@/queries';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { seedCabysIfNeeded } from './cabys.seeder';

export const DATABASE = 'DATABASE';

let db: Database | null = null;

async function bootstrapIfNeeded(database: Database): Promise<void> {
  const result = await database.rawQuery<{ schema_name: string }>(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'general_schema'`,
  );

  if (result.rows.length > 0) {
    console.log('Database already initialized. Skipping bootstrap.');
    return;
  }

  console.log('Database not initialized. Running bootstrap...');
  const sql = readFileSync(join(__dirname, 'database_backup.sql'), 'utf8');
  await database.rawQuery(sql);
  console.log('Bootstrap completed successfully.');
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
