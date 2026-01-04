/**
 * Test para el endpoint POST /api/master/restaurants
 * Crea un restaurante + usuario dueño (RESTAURANT_ADMIN) automáticamente
 */

const BASE_URL = 'http://localhost:3000/api';

async function testCreateRestaurantWithOwner() {
  console.log('🧪 Probando: Crear Restaurante + Owner (FASE 2)');
  console.log('='.repeat(60));
  console.log('');

  try {
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

    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log('✅ Login exitoso');
    console.log('');

    // 2. Crear restaurante + owner
    console.log('2️⃣ Creando restaurante + owner...');
    console.log('-'.repeat(60));
    
    const restaurantData = {
      // Datos del restaurante
      name: 'Pizzería Don Giuseppe ' + Date.now(), // Agregar timestamp para evitar duplicados
      slug: 'pizzeria-don-giuseppe-' + Date.now(), // Slug único
      email: 'contacto-' + Date.now() + '@dongiuseppe.com',
      phone: '+57 (312) 456-7890',
      timezone: 'America/Bogota',
      currency: 'COP',
      subscriptionPlan: 'TRIAL',
      subscriptionStatus: 'TRIAL',
      
      // Datos del dueño/owner (campos aplanados)
      ownerFullName: 'Giuseppe Rossi',
      ownerEmail: 'giuseppe-' + Date.now() + '@dongiuseppe.com',
      ownerPhone: '+57 312 456-7890',
      // ownerPassword: si no se envía, se genera automáticamente
    };

    console.log('Datos enviados:');
    console.log(JSON.stringify(restaurantData, null, 2));
    console.log('');

    const createRes = await fetch(`${BASE_URL}/master/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(restaurantData),
    });

    if (!createRes.ok) {
      const error = await createRes.text();
      throw new Error(`Creación falló (${createRes.status}): ${error}`);
    }

    const result = await createRes.json();
    console.log('✅ Restaurante + Owner creado exitosamente');
    console.log('');

    // 3. Mostrar resultado
    console.log('3️⃣ Resultado de la creación:');
    console.log('-'.repeat(60));
    console.log('');
    
    console.log('📍 RESTAURANTE CREADO:');
    console.log(`   ID: ${result.restaurant.id}`);
    console.log(`   Nombre: ${result.restaurant.name}`);
    console.log(`   Slug: ${result.restaurant.slug}`);
    console.log(`   Email: ${result.restaurant.email}`);
    console.log(`   Ciudad: ${result.restaurant.city}, ${result.restaurant.state}`);
    console.log(`   Owner User ID: ${result.restaurant.ownerUserId}`);
    console.log('');

    console.log('👤 USUARIO DUEÑO CREADO:');
    console.log(`   ID: ${result.ownerUser.id}`);
    console.log(`   Nombre: ${result.ownerUser.fullName}`);
    console.log(`   Email: ${result.ownerUser.email}`);
    console.log(`   Rol: ${result.ownerUser.role}`);
    console.log(`   Restaurant ID: ${result.ownerUser.restaurantId}`);
    console.log(`   Tenant ID: ${result.ownerUser.tenantId || 'null'}`);
    
    if (result.ownerUser.temporaryPassword) {
      console.log('');
      console.log('⚠️  CONTRASEÑA TEMPORAL GENERADA:');
      console.log(`   ${result.ownerUser.temporaryPassword}`);
      console.log('   (El usuario debe cambiarla en el primer login)');
    }
    console.log('');

    // 4. Validar que el restaurantId coincide
    console.log('4️⃣ Validaciones:');
    console.log('-'.repeat(60));
    
    if (result.restaurant.ownerUserId === result.ownerUser.id) {
      console.log('✅ restaurant.ownerUserId coincide con ownerUser.id');
    } else {
      console.log('❌ ERROR: restaurant.ownerUserId NO coincide con ownerUser.id');
    }

    if (result.ownerUser.restaurantId === result.restaurant.id) {
      console.log('✅ ownerUser.restaurantId coincide con restaurant.id');
    } else {
      console.log('❌ ERROR: ownerUser.restaurantId NO coincide con restaurant.id');
    }

    if (result.ownerUser.role === 'restaurant_admin') {
      console.log('✅ ownerUser.role es RESTAURANT_ADMIN');
    } else {
      console.log(`❌ ERROR: ownerUser.role es "${result.ownerUser.role}" (debería ser "restaurant_admin")`);
    }
    console.log('');

    // 5. Probar login con el owner
    console.log('5️⃣ Probando login con el nuevo owner...');
    console.log('-'.repeat(60));
    
    const ownerPassword = result.ownerUser.temporaryPassword || 'password123'; // Si había password en el request
    
    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: result.ownerUser.email,
        password: ownerPassword,
      }),
    });

    if (!ownerLoginRes.ok) {
      console.log('❌ Login del owner falló');
      const errorText = await ownerLoginRes.text();
      console.log(`   Error: ${errorText}`);
    } else {
      const ownerLoginData = await ownerLoginRes.json();
      console.log('✅ Login del owner exitoso');
      console.log('');
      console.log('JWT Payload del owner:');
      
      // Decodificar JWT (sin validar firma)
      const jwtParts = ownerLoginData.access_token.split('.');
      const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString());
      console.log(JSON.stringify(payload, null, 2));
      console.log('');
      
      console.log('Verificaciones del JWT:');
      console.log(`   ✓ role: ${payload.role}`);
      console.log(`   ✓ restaurantId: ${payload.restaurantId}`);
      console.log(`   ✓ tenantId: ${payload.tenantId}`);
      
      if (payload.restaurantId === result.restaurant.id) {
        console.log('   ✅ restaurantId en JWT coincide con el restaurante creado');
      } else {
        console.log('   ❌ ERROR: restaurantId en JWT NO coincide');
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('');
    console.error('❌ Error en la prueba:');
    console.error('   ', error.message);
    if (error.cause) {
      console.error('   Causa:', error.cause);
    }
    process.exit(1);
  }
}

// Ejecutar test
testCreateRestaurantWithOwner();
