// Test con password URL-encoded
const { Client } = require('pg');

// Password original: Z`6*k-kFP]SCzGTN+Mux
// URL-encoded: Z%606*k-kFP%5DSCzGTN%2BMux

const originalPassword = 'Z`6*k-kFP]SCzGTN+Mux';
const urlEncodedPassword = encodeURIComponent(originalPassword);

console.log('Password original:', originalPassword);
console.log('Password URL-encoded:', urlEncodedPassword);
console.log('\n');

const configs = [
  {
    name: 'Direct Connection - Original Password',
    config: {
      host: 'db.hkepastqekfrckyppbnp.supabase.co',
      port: 5432,
      user: 'postgres',
      password: originalPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Direct Connection - Connection String con URL-encoded',
    connectionString: `postgresql://postgres:${urlEncodedPassword}@db.hkepastqekfrckyppbnp.supabase.co:5432/postgres?sslmode=require`
  }
];

async function testConnection(name, config) {
  console.log(`🔍 Probando: ${name}...`);
  
  const client = config.connectionString 
    ? new Client({ connectionString: config.connectionString, ssl: { rejectUnauthorized: false } })
    : new Client(config);
  
  try {
    await client.connect();
    console.log(`✅ ${name} - CONEXIÓN EXITOSA!\n`);
    
    const res = await client.query('SELECT NOW()');
    console.log(`   Server time: ${res.rows[0].now}\n`);
    
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ ${name} - ERROR:`);
    console.log(`   ${err.message}\n`);
    return false;
  }
}

async function main() {
  console.log('🚀 Probando diferentes formatos de password...\n');
  
  for (const { name, config, connectionString } of configs) {
    await testConnection(name, config || connectionString);
  }
  
  console.log('\n📝 RECOMENDACIÓN:');
  console.log('Si ninguna opción funciona, resetea el password en Supabase:');
  console.log('https://supabase.com/dashboard/project/hkepastqekfrckyppbnp/settings/database');
  console.log('\nUsa un password sin caracteres especiales (solo letras, números y guiones)');
}

main();
