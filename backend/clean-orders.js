// Script para limpiar la tabla orders y order_items antes de la migración
require('dotenv').config();
const { Client } = require('pg');

async function cleanOrders() {
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

    // Eliminar todos los order_items primero (FK constraint)
    const deleteItemsResult = await client.query('DELETE FROM order_items');
    console.log(`✅ Eliminados ${deleteItemsResult.rowCount} order_items`);

    // Eliminar todas las orders
    const deleteOrdersResult = await client.query('DELETE FROM orders');
    console.log(`✅ Eliminadas ${deleteOrdersResult.rowCount} orders`);

    console.log('\n🎉 Base de datos limpiada. Ahora puedes reiniciar el backend.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanOrders();
