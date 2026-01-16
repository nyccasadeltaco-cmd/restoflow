import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ormConfig } from '../src/config/ormconfig';
import { User } from '../src/modules/users/entities/user.entity';
import {
  findSupabaseUserIdByEmail,
  getSupabaseAdminClient,
} from '../src/common/supabase/supabase-admin';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TEMP_PASSWORD_LENGTH = 12;
const TEMP_PASSWORD_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';

function generateTemporaryPassword(): string {
  let password = '';
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    password += TEMP_PASSWORD_CHARS.charAt(
      Math.floor(Math.random() * TEMP_PASSWORD_CHARS.length),
    );
  }
  return password;
}

async function run() {
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env',
    );
  }

  const config = ormConfig() as any;
  config.synchronize = false;
  const dataSource = new DataSource(config);
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const users = await userRepo.find({
    where: { isActive: true },
    order: { createdAt: 'ASC' },
  });

  const created: Array<{ email: string; tempPassword: string }> = [];
  const confirmed: string[] = [];

  for (const user of users) {
    if (!user.email) {
      continue;
    }

    const existingId = await findSupabaseUserIdByEmail(
      adminClient,
      user.email,
    );

    if (existingId) {
      const { data, error } = await adminClient.auth.admin.getUserById(
        existingId,
      );
      if (error) {
        throw new Error(`Supabase Auth get failed: ${error.message}`);
      }
      if (!data.user.email_confirmed_at) {
        const { error: confirmError } =
          await adminClient.auth.admin.updateUserById(existingId, {
            email_confirm: true,
          });
        if (confirmError) {
          throw new Error(
            `Supabase Auth confirm failed: ${confirmError.message}`,
          );
        }
        confirmed.push(user.email);
      }
      continue;
    }

    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    await userRepo.save(user);

    const { error } = await adminClient.auth.admin.createUser({
      email: user.email,
      password: tempPassword,
      email_confirm: true,
    });

    if (error) {
      throw new Error(`Supabase Auth create failed: ${error.message}`);
    }

    created.push({ email: user.email, tempPassword });
  }

  await dataSource.destroy();

  if (!created.length) {
    console.log('[sync-supabase-auth] No users created.');
  } else {
    console.log('[sync-supabase-auth] Users created in Supabase Auth:');
    for (const entry of created) {
      console.log(`${entry.email} -> ${entry.tempPassword}`);
    }
  }

  if (!confirmed.length) {
    console.log('[sync-supabase-auth] No users confirmed.');
    return;
  }

  console.log('[sync-supabase-auth] Users confirmed in Supabase Auth:');
  for (const email of confirmed) {
    console.log(email);
  }
}

run().catch((error) => {
  console.error('[sync-supabase-auth] failed', error);
  process.exit(1);
});
