const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Script para crear un usuario RESTAURANT_ADMIN para un restaurante específico
 * 
 * Uso:
 * node create-restaurant-admin-user.js <slug> <email> <fullName> <password>
 * 
 * Ejemplo:
 * node create-restaurant-admin-user.js pizzeria-giovanny giuseppe@dongiuseppe.com "Giuseppe Rossi" giovanny123
 */

async function createRestaurantAdmin() {
  // Obtener argumentos de la línea de comandos
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error('❌ Faltan argumentos');
    console.log('\nUso:');
    console.log('  node create-restaurant-admin-user.js <slug> <email> <fullName> <password>');
    console.log('\nEjemplo:');
    console.log('  node create-restaurant-admin-user.js pizzeria-giovanny giuseppe@dongiuseppe.com "Giuseppe Rossi" giovanny123');
    process.exit(1);
  }

  const [slug, email, fullName, password] = args;

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

    // 1. Buscar el restaurante por slug
    const restaurants = await dataSource.query(
      'SELECT id, name, slug FROM restaurants WHERE slug = $1',
      [slug]
    );

    if (restaurants.length === 0) {
      console.error(`❌ No se encontró restaurante con slug: ${slug}`);
      process.exit(1);
    }

    const restaurant = restaurants[0];
    console.log('📍 Restaurante encontrado:');
    console.log(`   ID: ${restaurant.id}`);
    console.log(`   Nombre: ${restaurant.name}`);
    console.log(`   Slug: ${restaurant.slug}\n`);

    // 2. Verificar si ya existe un usuario con ese email
    const existingUsers = await dataSource.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUsers.length > 0) {
      console.error(`❌ Ya existe un usuario con el email: ${email}`);
      console.log(`   ID del usuario existente: ${existingUsers[0].id}`);
      process.exit(1);
    }

    // 3. Generar hash de la contraseña
    console.log('🔐 Generando hash de contraseña...');
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Crear el usuario
    const userId = uuidv4();
    const now = new Date();

    await dataSource.query(
      `INSERT INTO users (id, email, "passwordHash", "fullName", role, "restaurantId", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, email, passwordHash, fullName, 'RESTAURANT_ADMIN', restaurant.id, true, now, now]
    );

    console.log('✅ Usuario creado exitosamente!\n');
    console.log('👤 Datos del usuario:');
    console.log(`   ID: ${userId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Nombre: ${fullName}`);
    console.log(`   Rol: RESTAURANT_ADMIN`);
    console.log(`   Restaurante: ${restaurant.name} (${restaurant.id})`);
    console.log(`   Password: ${password}\n`);

    console.log('🎯 Credenciales para login:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    console.log('🌐 URL del panel:');
    console.log(`   http://localhost:65456/#/r/${slug}/login\n`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createRestaurantAdmin();
