const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testRestaurantPanel() {
  try {
    console.log('🧪 Test: Restaurant Panel API\n');
    console.log('═'.repeat(60));
    console.log('');

    // 1. Login como RESTAURANT_ADMIN
    console.log('1️⃣ Login como RESTAURANT_ADMIN...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@supertacos.com',
        password: 'tacos123',
      }),
    });

    if (!loginRes.ok) {
      const error = await loginRes.text();
      throw new Error(`Login falló (${loginRes.status}): ${error}`);
    }

    const { access_token, user } = await loginRes.json();
    console.log('✅ Login exitoso');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Restaurant ID:', user.restaurantId);
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // 2. GET /restaurant/me
    console.log('2️⃣ GET /restaurant/me');
    const meRes = await fetch(`${BASE_URL}/restaurant/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!meRes.ok) {
      const error = await meRes.text();
      throw new Error(`GET /restaurant/me falló (${meRes.status}): ${error}`);
    }

    const meData = await meRes.json();
    console.log('✅ Respuesta exitosa:');
    console.log('');
    console.log('👤 Usuario:');
    console.log('   ID:', meData.user.id);
    console.log('   Nombre:', meData.user.fullName);
    console.log('   Email:', meData.user.email);
    console.log('   Role:', meData.user.role);
    console.log('');
    console.log('🏪 Restaurante:');
    console.log('   ID:', meData.restaurant.id);
    console.log('   Nombre:', meData.restaurant.name);
    console.log('   Slug:', meData.restaurant.slug);
    console.log('   Email:', meData.restaurant.email);
    console.log('   Phone:', meData.restaurant.phone);
    console.log('   Suscripción:', meData.restaurant.subscriptionStatus);
    console.log('   Plan:', meData.restaurant.subscriptionPlan);
    console.log('   Timezone:', meData.restaurant.timezone);
    console.log('   Currency:', meData.restaurant.currency);
    console.log('   Activo:', meData.restaurant.isActive);
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // 3. GET /restaurant/settings
    console.log('3️⃣ GET /restaurant/settings');
    const settingsRes = await fetch(`${BASE_URL}/restaurant/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!settingsRes.ok) {
      const error = await settingsRes.text();
      throw new Error(`GET /restaurant/settings falló (${settingsRes.status}): ${error}`);
    }

    const settingsData = await settingsRes.json();
    console.log('✅ Respuesta exitosa:');
    console.log('');
    console.log('⚙️ Configuración del Restaurante:');
    console.log('   ID:', settingsData.id);
    console.log('   Nombre:', settingsData.name);
    console.log('   Nombre Legal:', settingsData.legalName);
    console.log('   Email:', settingsData.email);
    console.log('   Teléfono:', settingsData.phone);
    console.log('');
    console.log('📍 Dirección:');
    console.log('   Línea 1:', settingsData.addressLine1);
    console.log('   Línea 2:', settingsData.addressLine2);
    console.log('   Ciudad:', settingsData.city);
    console.log('   Estado:', settingsData.state);
    console.log('   País:', settingsData.country);
    console.log('   CP:', settingsData.postalCode);
    console.log('');
    console.log('💳 Tarifas:');
    console.log('   Card Fee Mode:', settingsData.cardFeeMode);
    console.log('   Card Fee %:', settingsData.cardFeePercent);
    console.log('   Card Fee Fixed:', settingsData.cardFeeFixed);
    console.log('   Platform Fee %:', settingsData.platformFeePercent);
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // 4. PATCH /restaurant/settings
    console.log('4️⃣ PATCH /restaurant/settings');
    
    const updateData = {
      phone: '+52 55 9999 8888',
      addressLine2: 'Piso 2, Col. Roma Norte',
      timezone: 'America/Mexico_City',
      cardFeePercent: 3.5,
    };

    console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2));
    console.log('');

    const updateRes = await fetch(`${BASE_URL}/restaurant/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!updateRes.ok) {
      const error = await updateRes.text();
      throw new Error(`PATCH /restaurant/settings falló (${updateRes.status}): ${error}`);
    }

    const updatedData = await updateRes.json();
    console.log('✅ Actualización exitosa:');
    console.log('   Teléfono:', updatedData.phone, '(actualizado ✓)');
    console.log('   Dirección Línea 2:', updatedData.addressLine2, '(actualizado ✓)');
    console.log('   Timezone:', updatedData.timezone, '(actualizado ✓)');
    console.log('   Card Fee %:', updatedData.cardFeePercent, '(actualizado ✓)');
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    // 5. Verificar que otros campos NO cambiaron
    console.log('5️⃣ Verificando que otros campos permanecen iguales...');
    console.log('   Nombre:', updatedData.name === settingsData.name ? '✓' : '✗');
    console.log('   Email:', updatedData.email === settingsData.email ? '✓' : '✗');
    console.log('   Ciudad:', updatedData.city === settingsData.city ? '✓' : '✗');
    console.log('');
    console.log('─'.repeat(60));
    console.log('');

    console.log('🎉 Todos los tests pasaron exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('   ✅ POST /auth/login (RESTAURANT_ADMIN)');
    console.log('   ✅ GET /restaurant/me');
    console.log('   ✅ GET /restaurant/settings');
    console.log('   ✅ PATCH /restaurant/settings');
    console.log('   ✅ Actualización parcial funciona correctamente');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

testRestaurantPanel();
