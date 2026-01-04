const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function setupRestaurantAdmin() {
  try {
    console.log('🔧 Setup: Crear RESTAURANT_ADMIN para testing\n');
    console.log('═'.repeat(60));
    console.log('');

    // 1. Login como SUPER_ADMIN
    console.log('1️⃣ Login como SUPER_ADMIN...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@plataforma.com',
        password: 'master123',
      }),
    });

    if (!loginRes.ok) {
      throw new Error(`Login falló: ${loginRes.status}`);
    }

    const { access_token } = await loginRes.json();
    console.log('✅ Login exitoso');
    console.log('');

    // 2. Obtener lista de restaurantes
    console.log('2️⃣ Obteniendo lista de restaurantes...');
    const restaurantsRes = await fetch(`${BASE_URL}/master/restaurants`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (!restaurantsRes.ok) {
      throw new Error(`Get restaurants falló: ${restaurantsRes.status}`);
    }

    const restaurantsData = await restaurantsRes.json();
    const restaurants = restaurantsData.data || restaurantsData;
    
    if (!restaurants || restaurants.length === 0) {
      throw new Error('No hay restaurantes en la base de datos');
    }

    // Buscar "Super Tacos" o usar el primero
    let restaurant = restaurants.find(r => r.name && r.name.includes('Tacos'));
    if (!restaurant) {
      restaurant = restaurants[0];
    }

    console.log('✅ Restaurante encontrado:');
    console.log('   ID:', restaurant.id);
    console.log('   Nombre:', restaurant.name);
    console.log('   Owner ID:', restaurant.ownerUserId);
    console.log('');

    // 3. Si no tiene owner, asignar uno
    if (!restaurant.ownerUserId) {
      console.log('3️⃣ Asignando owner al restaurante...');
      
      const ownerData = {
        fullName: 'Admin SuperTacos',
        email: 'admin@supertacos.com',
        password: 'tacos123',
        phone: '+52 55 1234 5678',
      };

      const setOwnerRes = await fetch(
        `${BASE_URL}/master/restaurants/${restaurant.id}/owner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
          body: JSON.stringify(ownerData),
        },
      );

      if (!setOwnerRes.ok) {
        const error = await setOwnerRes.text();
        throw new Error(`Set owner falló: ${error}`);
      }

      const result = await setOwnerRes.json();
      console.log('✅ Owner asignado exitosamente:');
      console.log('   User ID:', result.ownerUser.id);
      console.log('   Email:', result.ownerUser.email);
      console.log('   Role:', result.ownerUser.role);
      console.log('   Password:', ownerData.password);
      console.log('');
    } else {
      console.log('3️⃣ El restaurante ya tiene owner asignado');
      console.log('   Owner ID:', restaurant.ownerUserId);
      console.log('');
    }

    console.log('─'.repeat(60));
    console.log('');
    console.log('🎉 Setup completado!');
    console.log('');
    console.log('📋 Credenciales para testing:');
    console.log('   Email: admin@supertacos.com');
    console.log('   Password: tacos123');
    console.log('   Restaurant ID:', restaurant.id);
    console.log('');
    console.log('✅ Ahora puedes ejecutar: node test-restaurant-panel.js');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

setupRestaurantAdmin();
