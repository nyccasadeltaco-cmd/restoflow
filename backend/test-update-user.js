const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testUpdateUser() {
  try {
    // 1. Login como SUPER_ADMIN
    console.log('1️⃣ Haciendo login como SUPER_ADMIN...');
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

    // 2. Obtener datos del usuario
    const userId = 'd4bd340e-eebc-4aa6-8e75-6ff00a410957';
    console.log(`2️⃣ Obteniendo usuario ${userId}...`);
    
    const getUserRes = await fetch(`${BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!getUserRes.ok) {
      const error = await getUserRes.text();
      throw new Error(`GET falló (${getUserRes.status}): ${error}`);
    }

    const user = await getUserRes.json();
    console.log('✅ Usuario obtenido:');
    console.log('   firstName:', user.firstName);
    console.log('   lastName:', user.lastName);
    console.log('   email:', user.email);
    console.log('   phone:', user.phone);
    console.log('');

    // 3. Actualizar usuario
    console.log(`3️⃣ Actualizando usuario...`);
    
    const updateData = {
      firstName: 'Giuseppe Updated',
      lastName: 'Rossi Updated',
      email: user.email,
      phone: '+57 312 999-9999',
    };

    console.log('Datos a enviar:', JSON.stringify(updateData, null, 2));
    console.log('');

    const updateRes = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(updateData),
    });

    console.log('Status:', updateRes.status);
    console.log('');

    if (!updateRes.ok) {
      const error = await updateRes.text();
      console.log('❌ Error response:', error);
      throw new Error(`PATCH falló (${updateRes.status}): ${error}`);
    }

    const updatedUser = await updateRes.json();
    console.log('✅ Usuario actualizado:');
    console.log('   firstName:', updatedUser.firstName);
    console.log('   lastName:', updatedUser.lastName);
    console.log('   email:', updatedUser.email);
    console.log('   phone:', updatedUser.phone);
    
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testUpdateUser();
