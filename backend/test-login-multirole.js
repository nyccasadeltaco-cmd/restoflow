const API_URL = 'http://localhost:3000/api';

async function testLogin() {
  console.log('🔐 Probando Login Multi-Rol\n');
  console.log('='.repeat(60));
  
  try {
    // Login como SUPER_ADMIN
    console.log('\n1️⃣ Login como SUPER_ADMIN (admin@plataforma.com)');
    console.log('-'.repeat(60));
    
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@plataforma.com',
        password: 'master123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`HTTP error! status: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const { access_token, user } = loginData;
    
    console.log('✅ Login exitoso!');
    console.log('\n📦 Usuario retornado:');
    console.log(JSON.stringify(user, null, 2));
    
    // Decodificar el JWT para ver el payload
    console.log('\n🔑 JWT Token (primeros 50 caracteres):');
    console.log(access_token.substring(0, 50) + '...');
    
    // Decodificar el payload (parte media del JWT)
    const payload = JSON.parse(
      Buffer.from(access_token.split('.')[1], 'base64').toString()
    );
    
    console.log('\n📋 Payload del JWT:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Verificar campos importantes
    console.log('\n✅ Verificación de campos:');
    console.log(`   - sub (userId): ${payload.sub}`);
    console.log(`   - email: ${payload.email}`);
    console.log(`   - role: ${payload.role}`);
    console.log(`   - restaurantId: ${payload.restaurantId === undefined ? 'undefined' : payload.restaurantId}`);
    console.log(`   - tenantId: ${payload.tenantId === undefined ? 'undefined' : payload.tenantId}`);
    
    // Probar acceso a ruta protegida
    console.log('\n2️⃣ Probando acceso a /master/restaurants');
    console.log('-'.repeat(60));
    
    const restaurantsResponse = await fetch(`${API_URL}/master/restaurants?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    if (!restaurantsResponse.ok) {
      throw new Error(`HTTP error! status: ${restaurantsResponse.status}`);
    }

    const restaurantsData = await restaurantsResponse.json();
    
    console.log('✅ Acceso exitoso a /master/restaurants');
    console.log(`   - Total de restaurantes: ${restaurantsData.meta.total}`);
    console.log(`   - Restaurantes en página: ${restaurantsData.data.length}`);
    
    if (restaurantsData.data.length > 0) {
      console.log(`   - Primer restaurante: ${restaurantsData.data[0].name}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Todas las pruebas pasaron correctamente!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:');
    console.error(`   ${error.message}`);
    if (error.response) {
      const errorData = await error.response.json();
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(errorData, null, 2)}`);
    }
    process.exit(1);
  }
}

testLogin();
