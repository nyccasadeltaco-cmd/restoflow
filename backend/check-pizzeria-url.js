const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'restfolow',
  user: 'postgres',
  password: 'admin',
});

async function checkUrl() {
  try {
    await client.connect();
    
    const result = await client.query(
      "SELECT name, slug, panel_url FROM restaurants WHERE slug = 'pizzeria-giovanny'"
    );

    if (result.rows.length > 0) {
      const restaurant = result.rows[0];
      console.log('🍕 Restaurante:', restaurant.name);
      console.log('📝 Slug:', restaurant.slug);
      console.log('🔗 Panel URL:', restaurant.panel_url);
      console.log('');
      
      if (restaurant.panel_url) {
        console.log('✅ Panel URL está configurado correctamente');
      } else {
        console.log('❌ Panel URL está vacío');
      }
    } else {
      console.log('❌ No se encontró el restaurante');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkUrl();
