const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function checkOwnerStatus() {
  try {
    // 1. Login como SUPER_ADMIN
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@plataforma.com',
        password: 'master123',
      }),
    });

    const { access_token } = await loginRes.json();

    // 2. Obtener restaurante
    const restaurantId = '624563ae-79ed-4eb2-a7d7-656b73f89d88';
    const restaurantRes = await fetch(
      `${BASE_URL}/master/restaurants/${restaurantId}`,
      {
        headers: { 'Authorization': `Bearer ${access_token}` },
      },
    );

    const restaurant = await restaurantRes.json();
    console.log('🏪 Restaurante:');
    console.log('   ID:', restaurant.id);
    console.log('   Nombre:', restaurant.name);
    console.log('   Owner User ID:', restaurant.ownerUserId);
    console.log('');

    if (restaurant.ownerUserId) {
      // 3. Obtener datos del owner
      const ownerRes = await fetch(
        `${BASE_URL}/users/${restaurant.ownerUserId}`,
        {
          headers: { 'Authorization': `Bearer ${access_token}` },
        },
      );

      const owner = await ownerRes.json();
      console.log('👤 Owner actual:');
      console.log('   ID:', owner.id);
      console.log('   Nombre:', owner.firstName, owner.lastName);
      console.log('   Email:', owner.email);
      console.log('   Role:', owner.role);
      console.log('   Restaurant ID:', owner.restaurantId);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOwnerStatus();
