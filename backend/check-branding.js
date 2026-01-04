const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'restfolow',
  user: 'postgres',
  password: 'admin',
});

async function checkBranding() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    const result = await client.query(`
      SELECT 
        name, 
        slug, 
        panel_url,
        logo_url,
        primary_color,
        secondary_color,
        is_active
      FROM restaurants 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('🍽️ Restaurantes en la base de datos:\n');
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
      console.log(`   Slug: ${row.slug}`);
      console.log(`   Panel URL: ${row.panel_url}`);
      console.log(`   Logo: ${row.logo_url || '❌ No configurado'}`);
      console.log(`   Primary Color: ${row.primary_color || '❌ No configurado'}`);
      console.log(`   Active: ${row.is_active ? '✅' : '❌'}`);
      console.log('');
    });

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkBranding();
