import Database, { DatabaseConfig } from '@crane-technologies/database';
import { queries } from '@/queries';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

export const DATABASE = 'DATABASE';

let db: Database | null = null;

export const dbProvider = {
  provide: DATABASE,
  useFactory: () => {
    const config: DatabaseConfig = {
      connectionString: process.env.DB_CONNECTION,
      max: Number(process.env.MAX_POOL_SIZE) || 10,
      ssl: { rejectUnauthorized: false },
    };

    db = Database.getInstance(config, queries);

    if (db) {
      console.log('Database connection established');
    }
    return db;
  },
};
