import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: process.cwd() + '/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST ?? 'localhost',
  port: parseInt(process.env.TYPEORM_PORT ?? '5432', 10),
  username: process.env.TYPEORM_USERNAME ?? 'postgres',
  password: process.env.TYPEORM_PASSWORD ?? 'P@stgres1',
  database: process.env.TYPEORM_DATABASE ?? 'academic',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
});

export default AppDataSource;
