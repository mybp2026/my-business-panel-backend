import Database, { DatabaseConfig } from '@crane-technologies/database';
import { queries } from '@/queries';

import { ConfigService } from '@nestjs/config';

export const DATABASE = 'DATABASE';

let db: Database | null = null;

export const dbProvider = {
  provide: DATABASE,
  useFactory: (configService: ConfigService) => {
    const config: DatabaseConfig = {
      connectionString: configService.get<string>('DB_CONNECTION'),
      max: Number(configService.get<number>('MAX_POOL_SIZE')) || 10,
      ssl: { rejectUnauthorized: false },
    };

    db = Database.getInstance(config, queries);

    if (db) {
      console.log('Database connection established');
    }
    return db;
  },
  inject: [ConfigService],
};
