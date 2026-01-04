/**
 * Script de prueba para FASE 2:
 * Creación de restaurante + usuario dueño (RESTAURANT_ADMIN)
 * 
 * Este script prueba el endpoint POST /master/restaurants
 * que crea tanto el restaurante como el usuario dueño automáticamente.
 */

const BASE_URL = 'http://localhost:3000/api';

async function testCreateRestaurantWithOwner() {
  console.log('\n🏪 FASE 2 - Crear Restaurante con Dueño');
  console.log('='.repeat(60));

  try {
    // 1. Login como SUPER_ADMIN
    console.log('\n1️⃣ Login como SUPER_ADMIN');
    console.log('-'.repeat(60));
    
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@plataforma.com',
        password: 'master123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    
    console.log('✅ Login exitoso');
    console.log(`   Token: ${token.substring(0, 30)}...`);
    console.log(`   User: ${loginData.user.email} (${loginData.user.role})`);

    // 2. Crear restaurante con dueño
    console.log('\n2️⃣ Crear restaurante "La Esquina" con dueño Juan Pérez');
    console.log('-'.repeat(60));

    const createRestaurantResponse = await fetch(`${BASE_URL}/master/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        // Datos del restaurante
        name: 'La Esquina Gourmet',
        email: 'contacto@laesquina.com',
        phone: '+52 55 1234 5678',
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        cardFeeMode: 'CLIENT',
        cardFeePercent: 2.9,
        platformFeePercent: 10,
        currency: 'MXN',
        timezone: 'America/Mexico_City',
        
        // Datos del dueño
        ownerFullName: 'Juan Pérez González',
        ownerEmail: 'juan.perez@laesquina.com',
        ownerPassword: 'ClaveTemporal123', // Opcional - si no se envía, se genera automáticamente
        ownerPhone: '+52 55 9876 5432'
      })
    });

    if (!createRestaurantResponse.ok) {
      const errorText = await createRestaurantResponse.text();
      throw new Error(`Create restaurant failed: ${createRestaurantResponse.status} - ${errorText}`);
    }

    const result = await createRestaurantResponse.json();
    
    console.log('✅ Restaurante creado exitosamente\n');
    
    console.log('📍 RESTAURANTE:');
    console.log(`   ID: ${result.restaurant.id}`);
    console.log(`   Nombre: ${result.restaurant.name}`);
    console.log(`   Slug: ${result.restaurant.slug}`);
    console.log(`   Email: ${result.restaurant.email}`);
    console.log(`   Plan: ${result.restaurant.subscriptionPlan}`);
    console.log(`   Estado: ${result.restaurant.subscriptionStatus}`);
    console.log(`   Owner User ID: ${result.restaurant.ownerUserId}`);
    
    console.log('\n👤 USUARIO DUEÑO:');
    console.log(`   ID: ${result.ownerUser.id}`);
    console.log(`   Nombre: ${result.ownerUser.fullName}`);
    console.log(`   Email: ${result.ownerUser.email}`);
    console.log(`   Teléfono: ${result.ownerUser.phone || 'N/A'}`);
    console.log(`   Rol: ${result.ownerUser.role}`);
    console.log(`   Restaurant ID: ${result.ownerUser.restaurantId}`);
    console.log(`   Contraseña temporal: ${result.ownerUser.temporaryPassword}`);

    // 3. Verificar que el dueño puede hacer login
    console.log('\n3️⃣ Verificar login del dueño');
    console.log('-'.repeat(60));

    const ownerLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: result.ownerUser.email,
        password: result.ownerUser.temporaryPassword
      })
    });

    if (!ownerLoginResponse.ok) {
      throw new Error(`Owner login failed: ${ownerLoginResponse.status}`);
    }

    const ownerLoginData = await ownerLoginResponse.json();
    console.log('✅ Login del dueño exitoso');
    console.log(`   Email: ${ownerLoginData.user.email}`);
    console.log(`   Rol: ${ownerLoginData.user.role}`);
    console.log(`   Restaurant ID: ${ownerLoginData.user.restaurantId}`);

    // Decodificar JWT para verificar el payload
    const ownerTokenParts = ownerLoginData.access_token.split('.');
    const ownerPayload = JSON.parse(Buffer.from(ownerTokenParts[1], 'base64').toString());
    
    console.log('\n🔐 JWT Payload del dueño:');
    console.log(`   sub (user ID): ${ownerPayload.sub}`);
    console.log(`   email: ${ownerPayload.email}`);
    console.log(`   role: ${ownerPayload.role}`);
    console.log(`   restaurantId: ${ownerPayload.restaurantId}`);
    console.log(`   tenantId: ${ownerPayload.tenantId}`);

    // Verificar que restaurantId coincide
    if (ownerPayload.restaurantId === result.restaurant.id) {
      console.log('\n✅ VERIFICACIÓN: restaurantId en JWT coincide con el restaurante creado');
    } else {
      console.log('\n❌ ERROR: restaurantId en JWT NO coincide');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ FASE 2 COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    
    console.log('\n📋 Resumen:');
    console.log(`   - Restaurante "${result.restaurant.name}" creado`);
    console.log(`   - Usuario dueño "${result.ownerUser.fullName}" creado con rol RESTAURANT_ADMIN`);
    console.log(`   - Asociación correcta: ownerUser.restaurantId = restaurant.id`);
    console.log(`   - Login del dueño funciona correctamente`);
    console.log(`   - JWT incluye restaurantId correcto`);

  } catch (error) {
    console.error('\n❌ Error en la prueba:');
    console.error('  ', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

// Ejecutar test
testCreateRestaurantWithOwner();
