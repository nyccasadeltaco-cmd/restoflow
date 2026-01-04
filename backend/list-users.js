const { DataSource } = require('typeorm');

async function listUsers() {
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

    // Obtener usuarios RESTAURANT_ADMIN con sus restaurantes
    const users = await dataSource.query(`
      SELECT 
        u.id,
        u.email,
        u."fullName",
        u.role,
        u."isActive",
        r.name as restaurant_name,
        r.slug as restaurant_slug
      FROM users u
      LEFT JOIN restaurants r ON u."restaurantId" = r.id
      WHERE u.role = 'RESTAURANT_ADMIN'
      ORDER BY r.name
    `);

    console.log('👥 USUARIOS RESTAURANT_ADMIN:\n');
    console.log('='.repeat(100));

    if (users.length === 0) {
      console.log('\n⚠️  No hay usuarios RESTAURANT_ADMIN en la base de datos\n');
    } else {
      for (const user of users) {
        console.log(`\n🏪 Restaurante: ${user.restaurant_name || 'SIN ASIGNAR'}`);
        if (user.restaurant_slug) {
          console.log(`   URL Panel: http://localhost:65456/#/r/${user.restaurant_slug}/login`);
        }
        console.log(`   ---`);
        console.log(`   👤 Usuario: ${user.fullName || 'Sin nombre'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Estado: ${user.isActive ? '✅ Activo' : '❌ Inactivo'}`);
        console.log(`   ℹ️  Usa este email y la contraseña que configuraste`);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('\n📋 RESUMEN:\n');
    console.log(`   Total de usuarios admin: ${users.length}`);
    console.log(`   Usuarios activos: ${users.filter(u => u.isActive).length}`);
    
    console.log('\n💡 PARA HACER LOGIN:\n');
    console.log('   1. Abre la URL del restaurante (ejemplo: http://localhost:65456/#/r/super-tacos/login)');
    console.log('   2. Ingresa el email del usuario admin de ese restaurante');
    console.log('   3. Ingresa la contraseña que configuraste para ese usuario\n');

    // También mostrar usuarios SUPER_ADMIN
    const superAdmins = await dataSource.query(`
      SELECT email, "fullName", "isActive"
      FROM users
      WHERE role = 'SUPER_ADMIN'
    `);

    if (superAdmins.length > 0) {
      console.log('\n🔐 USUARIOS SUPER_ADMIN (Master Panel):\n');
      for (const admin of superAdmins) {
        console.log(`   📧 ${admin.email} - ${admin.fullName || 'Sin nombre'} ${admin.isActive ? '✅' : '❌'}`);
      }
      console.log('   (Estos usuarios acceden al Master Panel, no al Restaurant Panel)\n');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Asegúrate de que PostgreSQL esté corriendo');
    }
    process.exit(1);
  }
}

listUsers();
