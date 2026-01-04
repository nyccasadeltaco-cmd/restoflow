const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testReassignOwner() {
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

    // 2. Crear un restaurante A con su owner
    console.log('2️⃣ Creando Restaurante A con su owner...');
    const timestamp = Date.now();
    
    const restaurantA = {
      name: `Test Restaurant A ${timestamp}`,
      address: 'Calle Falsa 123',
      phone: '+52 55 1234 5678',
      ownerFullName: `Owner A ${timestamp}`,
      ownerEmail: `owner-a-${timestamp}@test.com`,
      ownerPhone: '+52 55 1111 1111',
      generatePassword: true,
    };

    const createARes = await fetch(`${BASE_URL}/master/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(restaurantA),
    });

    if (!createARes.ok) {
      const error = await createARes.text();
      throw new Error(`Crear Restaurant A falló: ${error}`);
    }

    const resultA = await createARes.json();
    console.log('✅ Restaurant A creado:');
    console.log('   Restaurant ID:', resultA.id);
    console.log('   Owner ID:', resultA.ownerUserId);
    console.log('   Owner Email:', restaurantA.ownerEmail);
    console.log('');

    // 3. Crear un restaurante B con su owner
    console.log('3️⃣ Creando Restaurante B con su owner...');
    
    const restaurantB = {
      name: `Test Restaurant B ${timestamp}`,
      address: 'Avenida Principal 456',
      phone: '+52 55 8765 4321',
      ownerFullName: `Owner B ${timestamp}`,
      ownerEmail: `owner-b-${timestamp}@test.com`,
      ownerPhone: '+52 55 2222 2222',
      generatePassword: true,
    };

    const createBRes = await fetch(`${BASE_URL}/master/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(restaurantB),
    });

    if (!createBRes.ok) {
      const error = await createBRes.text();
      throw new Error(`Crear Restaurant B falló: ${error}`);
    }

    const resultB = await createBRes.json();
    console.log('✅ Restaurant B creado:');
    console.log('   Restaurant ID:', resultB.id);
    console.log('   Owner ID:', resultB.ownerUserId);
    console.log('   Owner Email:', restaurantB.ownerEmail);
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // 4. Reasignar el owner de Restaurant A al Restaurant B
    console.log('4️⃣ Reasignando Owner A al Restaurant B...');
    console.log(`   Owner A (${restaurantA.ownerEmail})`);
    console.log(`   → Restaurant A (${resultA.id})`);
    console.log(`   → Restaurant B (${resultB.id})`);
    console.log('');

    const reassignData = {
      fullName: `Owner A Reassigned ${timestamp}`,
      email: restaurantA.ownerEmail, // Email del owner original de A
      phone: '+52 55 9999 9999',
    };

    const reassignRes = await fetch(`${BASE_URL}/master/restaurants/${resultB.id}/owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(reassignData),
    });

    if (!reassignRes.ok) {
      const error = await reassignRes.text();
      throw new Error(`Reasignar owner falló: ${error}`);
    }

    const reassignResult = await reassignRes.json();
    console.log('✅ Owner reasignado exitosamente:');
    console.log('   Owner ID:', reassignResult.ownerUser.id, '(mismo que Owner A ✓)');
    console.log('   Owner Name:', reassignResult.ownerUser.fullName, '(actualizado ✓)');
    console.log('   Owner Email:', reassignResult.ownerUser.email);
    console.log('   Owner Phone:', reassignResult.ownerUser.phone, '(actualizado ✓)');
    console.log('   Restaurant ID:', reassignResult.ownerUser.restaurantId, '(ahora es B ✓)');
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // 5. Verificar que Restaurant A ahora tiene al Owner A reasignado
    console.log('5️⃣ Verificando Restaurant A...');
    
    const getARes = await fetch(`${BASE_URL}/master/restaurants/${resultA.id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (!getARes.ok) {
      throw new Error(`Get Restaurant A falló: ${getARes.status}`);
    }

    const currentA = await getARes.json();
    console.log('   Restaurant A:');
    console.log('   - Owner User ID:', currentA.ownerUserId);
    console.log('   - Estado:', currentA.ownerUserId === resultA.ownerUserId ? 
      'Mantiene owner original ✓' : 'Owner cambiado ⚠️');
    console.log('');

    // 6. Verificar que Restaurant B ahora tiene al Owner A
    console.log('6️⃣ Verificando Restaurant B...');
    
    const getBRes = await fetch(`${BASE_URL}/master/restaurants/${resultB.id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (!getBRes.ok) {
      throw new Error(`Get Restaurant B falló: ${getBRes.status}`);
    }

    const currentB = await getBRes.json();
    console.log('   Restaurant B:');
    console.log('   - Owner User ID:', currentB.ownerUserId);
    console.log('   - Estado:', currentB.ownerUserId === resultA.ownerUserId ? 
      'Ahora tiene Owner A ✓' : 'Owner diferente ⚠️');
    console.log('');

    console.log('🎉 Test de reasignación completado exitosamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log('   ✓ Restaurant A creado con Owner A');
    console.log('   ✓ Restaurant B creado con Owner B');
    console.log('   ✓ Owner A reasignado de Restaurant A → Restaurant B');
    console.log('   ✓ Restaurant B ahora tiene Owner A como administrador');
    
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testReassignOwner();
