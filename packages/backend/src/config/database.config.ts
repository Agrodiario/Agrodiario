import { registerAs } from '@nestjs/config';

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

export default registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;

  // If DATABASE_URL is provided, use it (Railway/Heroku style)
  if (databaseUrl) {
    const parsed = parseDatabaseUrl(databaseUrl);
    return {
      type: 'postgres',
      host: parsed.host,
      port: parsed.port,
      username: parsed.username,
      password: parsed.password,
      database: parsed.database,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV === 'development',
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/database/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  // Otherwise use individual environment variables
  return {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'agrodiario',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.NODE_ENV === 'development',
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
  };
});
