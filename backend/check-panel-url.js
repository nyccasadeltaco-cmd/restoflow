const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'restfolow',
  user: 'postgres',
  password: 'admin',
});

async function checkPanelUrl() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    const result = await client.query(
      "SELECT name, slug, panel_url FROM restaurants WHERE slug = 'pizzeria-giovanny'"
    );

    if (result.rows.length > 0) {
      console.log('🍕 Restaurante encontrado:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      console.log('\n📝 Panel URL:', result.rows[0].panel_url);
    } else {
      console.log('❌ No se encontró el restaurante con slug "pizzeria-giovanny"');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkPanelUrl();
