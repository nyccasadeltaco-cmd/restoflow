const { DataSource } = require('typeorm');

async function listRestaurantsAndUsers() {
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
    console.log('✅ Conectado a la base de datos\n');

    // Obtener todos los restaurantes con sus usuarios admin
    const results = await dataSource.query(`
      SELECT 
        r.id as restaurant_id,
        r.name as restaurant_name,
        r.slug,
        r."panelUrl",
        r."primaryColor",
        u.id as user_id,
        u.email,
        u."fullName",
        u.role
      FROM restaurants r
      LEFT JOIN users u ON u."restaurantId" = r.id AND u.role = 'RESTAURANT_ADMIN'
      ORDER BY r.name
    `);

    console.log('🏪 RESTAURANTES Y SUS USUARIOS ADMIN:\n');
    console.log('='.repeat(100));

    let currentRestaurant = null;

    for (const row of results) {
      if (currentRestaurant !== row.restaurant_name) {
        currentRestaurant = row.restaurant_name;
        console.log(`\n🏪 ${row.restaurant_name}`);
        console.log(`   Slug: ${row.slug}`);
        console.log(`   Panel URL: ${row.panelUrl}`);
        console.log(`   Color: ${row.primaryColor || 'No definido'}`);
        console.log(`   ---`);
      }

      if (row.user_id) {
        console.log(`   👤 Admin: ${row.fullName || 'Sin nombre'}`);
        console.log(`      Email: ${row.email}`);
        console.log(`      Rol: ${row.role}`);
      } else {
        console.log(`   ❌ SIN USUARIO ADMIN ASIGNADO`);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('\n📋 RESUMEN PARA LOGIN:\n');

    // Agrupar por restaurante
    const restaurants = {};
    for (const row of results) {
      if (!restaurants[row.slug]) {
        restaurants[row.slug] = {
          name: row.restaurant_name,
          slug: row.slug,
          panelUrl: row.panelUrl,
          admins: []
        };
      }
      if (row.email) {
        restaurants[row.slug].admins.push({
          email: row.email,
          fullName: row.fullName
        });
      }
    }

    for (const [slug, data] of Object.entries(restaurants)) {
      console.log(`\n🌐 ${data.name}`);
      console.log(`   URL: ${data.panelUrl || `http://localhost:65456/#/r/${slug}/login`}`);
      if (data.admins.length > 0) {
        data.admins.forEach(admin => {
          console.log(`   ✅ Login: ${admin.email}`);
          console.log(`      (usa la contraseña que ya tienes configurada)`);
        });
      } else {
        console.log(`   ⚠️  No tiene usuario admin - necesitas crear uno`);
      }
    }

    console.log('\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listRestaurantsAndUsers();
