import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormConfig = (): TypeOrmModuleOptions => {
  // Debug seguro (no imprime password)
  console.log('[DB CONFIG]', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    name: process.env.DB_NAME,
    passLoaded: Boolean(process.env.DB_PASSWORD),
    passLen: process.env.DB_PASSWORD?.length ?? 0,
  });

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? 'postgres',
    ssl: { rejectUnauthorized: false },
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
  };
};
