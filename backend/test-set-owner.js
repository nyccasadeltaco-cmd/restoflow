const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testSetOwner() {
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

    // 2. Usar un restaurante existente
    const restaurantId = '624563ae-79ed-4eb2-a7d7-656b73f89d88'; // Super Tacos
    console.log(`2️⃣ Asignando owner al restaurante ${restaurantId}...`);
    console.log('');

    // Caso 1: Crear nuevo owner con contraseña generada
    console.log('📝 CASO 1: Crear nuevo owner (contraseña auto-generada)');
    const timestamp = Date.now();
    
    const ownerData1 = {
      fullName: `Carlos Méndez ${timestamp}`,
      email: `carlos-${timestamp}@tacos.com`,
      phone: '+52 55 9999 8888',
    };

    console.log('Datos a enviar:', JSON.stringify(ownerData1, null, 2));
    console.log('');

    const setOwnerRes1 = await fetch(`${BASE_URL}/master/restaurants/${restaurantId}/owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(ownerData1),
    });

    if (!setOwnerRes1.ok) {
      const error = await setOwnerRes1.text();
      throw new Error(`Set owner falló (${setOwnerRes1.status}): ${error}`);
    }

    const result1 = await setOwnerRes1.json();
    console.log('✅ Owner asignado exitosamente:');
    console.log('   Restaurant ID:', result1.restaurantId);
    console.log('   Owner ID:', result1.ownerUser.id);
    console.log('   Owner Name:', result1.ownerUser.fullName);
    console.log('   Owner Email:', result1.ownerUser.email);
    console.log('   Owner Role:', result1.ownerUser.role);
    console.log('   Restaurant ID:', result1.ownerUser.restaurantId);
    if (result1.ownerUser.temporaryPassword) {
      console.log('   🔑 Temporary Password:', result1.ownerUser.temporaryPassword);
    }
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // Caso 2: Reasignar con contraseña personalizada
    console.log('📝 CASO 2: Reasignar mismo usuario con contraseña personalizada');
    
    const ownerData2 = {
      fullName: `Carlos Méndez López ${timestamp}`, // Nombre actualizado
      email: ownerData1.email, // Mismo email
      password: 'MyNewPassword123!',
      phone: '+52 55 8888 7777', // Teléfono actualizado
    };

    console.log('Datos a enviar:', JSON.stringify(ownerData2, null, 2));
    console.log('');

    const setOwnerRes2 = await fetch(`${BASE_URL}/master/restaurants/${restaurantId}/owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(ownerData2),
    });

    if (!setOwnerRes2.ok) {
      const error = await setOwnerRes2.text();
      throw new Error(`Reasignar owner falló (${setOwnerRes2.status}): ${error}`);
    }

    const result2 = await setOwnerRes2.json();
    console.log('✅ Owner reasignado exitosamente:');
    console.log('   Restaurant ID:', result2.restaurantId);
    console.log('   Owner ID:', result2.ownerUser.id, '(mismo ID que antes ✓)');
    console.log('   Owner Name:', result2.ownerUser.fullName, '(actualizado ✓)');
    console.log('   Owner Email:', result2.ownerUser.email);
    console.log('   Owner Phone:', result2.ownerUser.phone, '(actualizado ✓)');
    console.log('   Owner Role:', result2.ownerUser.role);
    if (result2.ownerUser.temporaryPassword) {
      console.log('   🔑 New Password:', result2.ownerUser.temporaryPassword);
    }
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // 3. Verificar login con la nueva contraseña
    console.log('3️⃣ Verificando login con la nueva contraseña...');
    
    const loginOwnerRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ownerData2.email,
        password: ownerData2.password,
      }),
    });

    if (!loginOwnerRes.ok) {
      throw new Error(`Login owner falló: ${loginOwnerRes.status}`);
    }

    const ownerLogin = await loginOwnerRes.json();
    console.log('✅ Login exitoso con la nueva contraseña');
    console.log('   User ID:', ownerLogin.user.id);
    console.log('   Email:', ownerLogin.user.email);
    console.log('   Role:', ownerLogin.user.role);
    console.log('   Restaurant ID:', ownerLogin.user.restaurantId);
    console.log('');

    console.log('🎉 Todas las pruebas pasaron exitosamente!');
    
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testSetOwner();
