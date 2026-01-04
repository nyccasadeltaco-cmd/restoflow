/**
 * Script de prueba para verificar la autenticación multi-rol limpia
 * Prueba:
 * 1. Login como SUPER_ADMIN
 * 2. Decodificación del JWT
 * 3. Acceso a endpoint protegido /master/restaurants
 */

const BASE_URL = 'http://localhost:3000/api';

// Función para decodificar JWT (sin verificar firma, solo para inspección)
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando JWT:', error.message);
    return null;
  }
}

async function testAuth() {
  console.log('🔐 Probando Autenticación Multi-Rol (Versión Limpia)');
  console.log('============================================================\n');

  try {
    // =============================================
    // 1️⃣ LOGIN COMO SUPER_ADMIN
    // =============================================
    console.log('1️⃣ Login como SUPER_ADMIN (admin@plataforma.com)');
    console.log('------------------------------------------------------------');

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@plataforma.com',
        password: 'master123',
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Error en login:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    console.log('Usuario:', JSON.stringify(loginData.user, null, 2));

    const token = loginData.access_token;

    // =============================================
    // 2️⃣ DECODIFICAR JWT
    // =============================================
    console.log('\n2️⃣ Decodificando JWT Payload');
    console.log('------------------------------------------------------------');

    const payload = decodeJWT(token);
    if (payload) {
      console.log('✅ JWT Decodificado:');
      console.log(JSON.stringify(payload, null, 2));

      // Verificaciones
      console.log('\n📋 Verificaciones:');
      console.log(`   ✓ sub (userId): ${payload.sub || '❌ FALTA'}`);
      console.log(`   ✓ email: ${payload.email || '❌ FALTA'}`);
      console.log(`   ✓ role: ${payload.role || '❌ FALTA'}`);
      console.log(`   ✓ restaurantId: ${payload.restaurantId !== undefined ? (payload.restaurantId === null ? 'null (correcto para SUPER_ADMIN)' : payload.restaurantId) : '❌ FALTA'}`);
      console.log(`   ✓ tenantId: ${payload.tenantId !== undefined ? payload.tenantId : '❌ FALTA'}`);

      // Validación de reglas de negocio
      if (payload.role === 'super_admin' && payload.restaurantId === undefined) {
        console.log('\n⚠️  SUPER_ADMIN no tiene restaurantId en el token (debería tenerlo como null o undefined)');
      } else if (payload.role === 'super_admin' && payload.restaurantId === null) {
        console.log('\n✅ SUPER_ADMIN tiene restaurantId = null (CORRECTO)');
      }
    }

    // =============================================
    // 3️⃣ ACCESO A ENDPOINT PROTEGIDO
    // =============================================
    console.log('\n3️⃣ Accediendo a endpoint protegido (GET /master/restaurants)');
    console.log('------------------------------------------------------------');

    const restaurantsResponse = await fetch(`${BASE_URL}/master/restaurants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!restaurantsResponse.ok) {
      const errorText = await restaurantsResponse.text();
      console.error(`❌ Error accediendo a restaurantes: ${restaurantsResponse.status}`);
      console.error('Respuesta:', errorText);
      
      if (restaurantsResponse.status === 403) {
        console.log('\n⚠️  Error 403: El guard de roles está bloqueando el acceso');
        console.log('   Verifica que el decorador @Roles esté usando UserRole.SUPER_ADMIN');
      }
    } else {
      const restaurantsData = await restaurantsResponse.json();
      console.log('✅ Acceso exitoso a endpoint protegido');
      console.log(`   Total de restaurantes: ${restaurantsData.data?.length || 0}`);
      
      if (restaurantsData.data && restaurantsData.data.length > 0) {
        console.log('\n📋 Primer restaurante:');
        console.log(JSON.stringify(restaurantsData.data[0], null, 2));
      }
    }

    // =============================================
    // RESUMEN
    // =============================================
    console.log('\n============================================================');
    console.log('✅ PRUEBA COMPLETADA');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Error en la prueba:');
    console.error('  ', error.message);
    if (error.cause) {
      console.error('   Causa:', error.cause);
    }
  }
}

// Ejecutar prueba
testAuth();
