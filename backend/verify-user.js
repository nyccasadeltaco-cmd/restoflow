// Script para verificar que el usuario existe
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

async function verifyUser() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar el usuario
    const result = await client.query('SELECT * FROM users WHERE email = $1', ['admin@plataforma.com']);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = result.rows[0];
    console.log('✅ Usuario encontrado:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('First Name:', user.firstName);
    console.log('Last Name:', user.lastName);
    console.log('Role:', user.role);
    console.log('IsActive:', user.isActive);
    console.log('\n🔐 Verificando contraseña...');
    
    // Verificar la contraseña
    const isValid = await bcrypt.compare('master123', user.password);
    console.log(isValid ? '✅ Contraseña correcta' : '❌ Contraseña incorrecta');
    
    await client.end();
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    process.exit(1);
  }
}

verifyUser();
