/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

function loadEnvFromFile() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  loadEnvFromFile();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@plataforma.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'master123';
  const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Master';
  const adminLastName = process.env.ADMIN_LAST_NAME || 'Admin';

  const client = new Client({
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT || '5432'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    ssl:
      String(process.env.DB_SSL || 'false').toLowerCase() === 'true'
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await client.connect();
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const sql = `
      INSERT INTO "users"
        (id, email, password, "firstName", "lastName", role, "tenantId", "restaurantId", "isActive", "createdAt", "updatedAt")
      VALUES
        ($1, $2, $3, $4, $5, 'super_admin', NULL, NULL, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET
        password = EXCLUDED.password,
        role = 'super_admin',
        "firstName" = EXCLUDED."firstName",
        "lastName" = EXCLUDED."lastName",
        "tenantId" = NULL,
        "restaurantId" = NULL,
        "isActive" = true,
        "updatedAt" = NOW()
      RETURNING id, email, role, "isActive", "tenantId", "restaurantId";
    `;

    const result = await client.query(sql, [
      randomUUID(),
      adminEmail,
      passwordHash,
      adminFirstName,
      adminLastName,
    ]);

    console.log('Super admin created/updated successfully:');
    console.table(result.rows);
    console.log('Credentials:');
    console.log(`  email: ${adminEmail}`);
    console.log(`  password: ${adminPassword}`);
  } catch (err) {
    console.error('Failed to create/update super admin:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
