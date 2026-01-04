// Script para DROP y recrear las tablas orders y order_items
require('dotenv').config();
const { Client } = require('pg');

async function dropOrderTables() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // DROP table order_items first (FK constraint)
    await client.query('DROP TABLE IF EXISTS order_items CASCADE');
    console.log('✅ Tabla order_items eliminada');

    // DROP table orders
    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    console.log('✅ Tabla orders eliminada');

    console.log('\n🎉 Tablas eliminadas. TypeORM las recreará con el esquema correcto.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

dropOrderTables();
