import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ormConfig } from './ormconfig';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const AppDataSource = new DataSource(ormConfig() as any);

export default AppDataSource;
