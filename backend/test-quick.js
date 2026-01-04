const { Client } = require('pg');

const config = {
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres',
  password: '6lgSnlOO65ZW6Qoi',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
};

async function test() {
  console.log('🔍 Probando conexión...');
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ CONEXIÓN EXITOSA!');
    
    const res = await client.query('SELECT NOW(), version()');
    console.log('⏰ Server time:', res.rows[0].now);
    console.log('📊 PostgreSQL version:', res.rows[0].version.split(' ')[0] + ' ' + res.rows[0].version.split(' ')[1]);
    
    await client.end();
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    process.exit(1);
  }
}

test();
