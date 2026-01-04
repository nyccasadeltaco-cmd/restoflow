// Script de prueba de conexión a Supabase
const { Client } = require('pg');

// Configuración desde Supabase
const configs = [
  {
    name: 'Direct Connection',
    config: {
      host: 'db.hkepastqekfrckyppbnp.supabase.co',
      port: 5432,
      user: 'postgres',
      password: 'cPkoP3ArQDOLT9Nf',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Pooler Connection',
    config: {
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 6543,
      user: 'postgres.hkepastqekfrckyppbnp',
      password: 'cPkoP3ArQDOLT9Nf',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function testConnection(name, config) {
  console.log(`\n🔍 Probando: ${name}...`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log(`✅ ${name} - CONEXIÓN EXITOSA!`);
    
    const res = await client.query('SELECT NOW()');
    console.log(`   Server time: ${res.rows[0].now}`);
    
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ ${name} - ERROR:`);
    console.log(`   ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de conexión a Supabase...\n');
  
  for (const { name, config } of configs) {
    const success = await testConnection(name, config);
    if (success) {
      console.log(`\n✨ Usa esta configuración en tu .env:`);
      console.log(`DB_HOST=${config.host}`);
      console.log(`DB_PORT=${config.port}`);
      console.log(`DB_USER=${config.user}`);
      console.log(`DB_PASSWORD=${config.password}`);
      console.log(`DB_NAME=${config.database}`);
      console.log(`DB_SSL=true`);
      break;
    }
  }
}

main();
