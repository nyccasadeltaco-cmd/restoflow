const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function resetOwnerPassword() {
  try {
    console.log('🔑 Actualizando contraseña del owner...\n');

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

    // 2. Actualizar owner del restaurante con nueva contraseña
    const restaurantId = '624563ae-79ed-4eb2-a7d7-656b73f89d88';
    
    const ownerData = {
      fullName: 'Admin SuperTacos',
      email: 'admin@supertacos.com',
      password: 'tacos123',
      phone: '+52 55 1234 5678',
    };

    const updateRes = await fetch(
      `${BASE_URL}/master/restaurants/${restaurantId}/owner`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(ownerData),
      },
    );

    if (!updateRes.ok) {
      const error = await updateRes.text();
      throw new Error(`Update falló: ${error}`);
    }

    const result = await updateRes.json();
    console.log('✅ Contraseña actualizada:');
    console.log('   Email:', ownerData.email);
    console.log('   Nueva Password:', ownerData.password);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetOwnerPassword();
