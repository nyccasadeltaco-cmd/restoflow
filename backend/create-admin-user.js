// Script para crear usuario Super Admin de prueba
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const config = {
  host: 'db.hkepastqekfrckyppbnp.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '6lgSnlOO65ZW6Qoi',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

async function createSuperAdmin() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Conectado a Supabase');

    // Hash de la contraseña 'master123'
    const hashedPassword = await bcrypt.hash('master123', 10);

    // Crear usuario Super Admin
    const query = `
      INSERT INTO "users" (id, email, "firstName", "lastName", password, role, "isActive", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'admin@plataforma.com',
        'Super',
        'Admin',
        $1,
        'super_admin',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE
      SET password = $1, role = 'super_admin', "isActive" = true
      RETURNING id, email, "firstName", "lastName", role;
    `;

    const result = await client.query(query, [hashedPassword]);
    
    console.log('\n✅ Usuario Super Admin creado/actualizado:');
    console.log(result.rows[0]);
    console.log('\n🔑 Credenciales:');
    console.log('Email: admin@plataforma.com');
    console.log('Password: master123');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('relation "user" does not exist')) {
      console.log('\n⚠️  La tabla "user" no existe. Necesitas ejecutar las migraciones primero.');
      console.log('Ejecuta: npm run migration:run');
    }
  }
}

createSuperAdmin();
