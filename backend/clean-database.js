// Script para limpiar todas las tablas de la base de datos
const { Client } = require('pg');

const config = {
  host: 'db.hkepastqekfrckyppbnp.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '6lgSnlOO65ZW6Qoi',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos...\n');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');
    
    // Eliminar todas las tablas en orden (por dependencias)
    const dropQueries = [
      'DROP TABLE IF EXISTS order_items CASCADE',
      'DROP TABLE IF EXISTS payments CASCADE',
      'DROP TABLE IF EXISTS orders CASCADE',
      'DROP TABLE IF EXISTS menu_items CASCADE',
      'DROP TABLE IF EXISTS menu_categories CASCADE',
      'DROP TABLE IF EXISTS menus CASCADE',
      'DROP TABLE IF EXISTS tables CASCADE',
      'DROP TABLE IF EXISTS restaurants CASCADE',
      'DROP TABLE IF EXISTS subscriptions CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TABLE IF EXISTS tenants CASCADE',
      // Eliminar tipos ENUM
      'DROP TYPE IF EXISTS users_role_enum CASCADE',
      'DROP TYPE IF EXISTS tenants_plan_enum CASCADE',
      'DROP TYPE IF EXISTS tenants_status_enum CASCADE',
      'DROP TYPE IF EXISTS tables_status_enum CASCADE',
      'DROP TYPE IF EXISTS orders_status_enum CASCADE',
      'DROP TYPE IF EXISTS orders_delivery_type_enum CASCADE',
      'DROP TYPE IF EXISTS orders_payment_method_enum CASCADE',
      'DROP TYPE IF EXISTS orders_payment_status_enum CASCADE',
      'DROP TYPE IF EXISTS payments_method_enum CASCADE',
      'DROP TYPE IF EXISTS payments_status_enum CASCADE',
      'DROP TYPE IF EXISTS subscriptions_interval_enum CASCADE',
      'DROP TYPE IF EXISTS subscriptions_status_enum CASCADE',
    ];
    
    for (const query of dropQueries) {
      console.log(`Ejecutando: ${query}`);
      await client.query(query);
    }
    
    console.log('\n✅ Base de datos limpiada exitosamente!');
    console.log('\n📝 Ahora puedes reiniciar el backend para que TypeORM cree las tablas nuevas.');
    
    await client.end();
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    process.exit(1);
  }
}

cleanDatabase();
