/**
 * Script para crear las tablas del módulo Social Media
 * Ejecuta el SQL schema en la base de datos
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Iniciando migración de Social Media Module...\n');

  // Conexión a la base de datos
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create-social-media-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando SQL migration...\n');

    // Ejecutar el SQL
    await client.query(sql);

    console.log('✅ Migración completada exitosamente!\n');
    console.log('📊 Tablas creadas:');
    console.log('   - social_connections');
    console.log('   - social_posts');
    console.log('   - social_post_publications');
    console.log('   - marketing_links');
    console.log('   - link_events');
    console.log('   - ai_generation_logs\n');

    console.log('🔒 Row Level Security (RLS) habilitado');
    console.log('⚡ Triggers configurados');
    console.log('📈 Índices creados\n');

    // Verificar que las tablas existan
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'social_connections',
        'social_posts',
        'social_post_publications',
        'marketing_links',
        'link_events',
        'ai_generation_logs'
      )
      ORDER BY table_name;
    `);

    console.log('✅ Verificación de tablas:');
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 ¡Social Media Module listo para usar!\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Reiniciar el backend: npm run start:dev');
    console.log('   2. Probar endpoints: /api/social-media/posts');
    console.log('   3. Configurar OAuth para Meta (Facebook/Instagram)');
    console.log('   4. Configurar OPENAI_API_KEY en .env para IA\n');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error('\n📋 Detalles del error:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Conexión cerrada\n');
  }
}

// Ejecutar migración
runMigration();
