/**
 * Script de prueba para crear un restaurante de ejemplo
 * Ejecutar: node test-create-restaurant.js
 */

const API_URL = 'http://localhost:3000/api';

// Primero necesitamos hacer login para obtener el JWT
async function login() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@plataforma.com',
        password: 'master123',
      }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error('❌ Error en login:', data);
      return null;
    }
    return data.access_token;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

// Crear un restaurante de prueba
async function createRestaurant(token) {
  try {
    const restaurantData = {
      name: 'Restaurante La Buena Mesa',
      slug: 'restaurante-la-buena-mesa',
      legalName: 'La Buena Mesa S.R.L.',
      email: 'contacto@labuenamesa.com',
      phone: '+1 (809) 555-1234',
      addressLine1: 'Calle Principal #123',
      addressLine2: 'Edificio Comercial, Local 5',
      city: 'Santo Domingo',
      state: 'Distrito Nacional',
      country: 'República Dominicana',
      postalCode: '10101',
      timezone: 'America/Santo_Domingo',
      currency: 'DOP',
      subscriptionPlan: 'TRIAL',
      logoUrl: 'https://via.placeholder.com/200x200/FF5733/FFFFFF?text=LBM',
      bannerUrl: 'https://via.placeholder.com/1200x400/33A1FF/FFFFFF?text=La+Buena+Mesa',
      primaryColor: '#FF5733',
      secondaryColor: '#33A1FF',
      accentColor: '#FFD700',
      isActive: true,
    };

    const response = await fetch(`${API_URL}/master/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(restaurantData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error al crear restaurante:', data);
      return null;
    }

    console.log('✅ Restaurante creado exitosamente:');
    console.log('   ID:', data.id);
    console.log('   Nombre:', data.name);
    console.log('   Slug:', data.slug);
    console.log('   Estado:', data.subscription_status);
    console.log('   URL:', `http://localhost:3000/api/master/restaurants/${data.id}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error al crear restaurante:', error.message);
    return null;
  }
}

// Obtener lista de restaurantes
async function listRestaurants(token) {
  try {
    const response = await fetch(`${API_URL}/master/restaurants`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error al listar restaurantes:', data);
      return null;
    }

    console.log('\n📋 Lista de restaurantes:');
    console.log(`   Total: ${data.meta.total}`);
    data.data.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} (${r.slug}) - ${r.subscription_status}`);
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error al listar restaurantes:', error.message);
    return null;
  }
}

// Ejecutar pruebas
async function main() {
  console.log('🚀 Iniciando prueba de creación de restaurante...\n');

  // 1. Login
  console.log('1️⃣ Obteniendo token de autenticación...');
  const token = await login();
  if (!token) {
    console.error('No se pudo obtener el token. Verifica que el usuario admin exista.');
    return;
  }
  console.log('✅ Token obtenido\n');

  // 2. Crear restaurante
  console.log('2️⃣ Creando restaurante de prueba...');
  const restaurant = await createRestaurant(token);
  if (!restaurant) {
    console.error('No se pudo crear el restaurante.');
    return;
  }
  console.log('');

  // 3. Listar restaurantes
  console.log('3️⃣ Obteniendo lista de restaurantes...');
  await listRestaurants(token);

  console.log('\n✨ Prueba completada exitosamente!');
  console.log('\n💡 Ahora puedes abrir el frontend y ver el restaurante en la lista');
}

main();
