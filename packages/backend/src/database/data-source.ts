import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

// Parse DATABASE_URL if provided (Railway, Heroku, etc.)
function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 5432,
    username: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1), // Remove leading '/'
  };
}

const databaseUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

// Build data source options based on available config
const dataSourceOptions = databaseUrl
  ? {
      type: 'postgres' as const,
      ...parseDatabaseUrl(databaseUrl),
      synchronize: false,
      logging: !isProduction,
      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [join(__dirname, './migrations/*{.ts,.js}')],
      migrationsTableName: 'migrations',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'agrodiario',
      synchronize: false, // NEVER use synchronize with migrations
      logging: process.env.NODE_ENV === 'development',
      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [join(__dirname, './migrations/*{.ts,.js}')],
      migrationsTableName: 'migrations',
    };

export const AppDataSource = new DataSource(dataSourceOptions);
