const { DataSource } = require('typeorm');

async function updatePanelUrls() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'restfolow_db',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    // Obtener todos los restaurantes
    const restaurants = await dataSource.query(
      'SELECT id, name, slug FROM restaurants WHERE slug IS NOT NULL'
    );

    console.log(`\n📋 Encontrados ${restaurants.length} restaurantes con slug\n`);

    const baseUrl = 'http://localhost:65456';

    for (const restaurant of restaurants) {
      const newPanelUrl = `${baseUrl}/#/r/${restaurant.slug}/login`;
      
      await dataSource.query(
        'UPDATE restaurants SET "panelUrl" = $1 WHERE id = $2',
        [newPanelUrl, restaurant.id]
      );

      console.log(`✅ ${restaurant.name}`);
      console.log(`   Slug: ${restaurant.slug}`);
      console.log(`   Nueva URL: ${newPanelUrl}\n`);
    }

    console.log('✅ Todas las URLs actualizadas correctamente');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePanelUrls();
