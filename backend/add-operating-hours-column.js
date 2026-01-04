const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function addOperatingHoursColumn() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar si la columna ya existe
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='restaurants' 
      AND column_name='operating_hours';
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('ℹ️  La columna operating_hours ya existe');
    } else {
      // Agregar la columna
      const alterQuery = `
        ALTER TABLE restaurants 
        ADD COLUMN operating_hours jsonb;
      `;
      
      await client.query(alterQuery);
      console.log('✅ Columna operating_hours agregada exitosamente');
    }

    await client.end();
    console.log('✅ Migración completada');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

addOperatingHoursColumn();
