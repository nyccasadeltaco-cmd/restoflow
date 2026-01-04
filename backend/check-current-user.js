const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function checkCurrentUser() {
  try {
    console.log('🔐 Probando login con usuario giuseppe...\n');
    
    // Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@supertacos.com',
        password: 'tacos123',
      }),
    });

    if (!loginRes.ok) {
      console.log('❌ Login falló:', loginRes.status);
      const error = await loginRes.text();
      console.log('Error:', error);
      return;
    }

    const { access_token } = await loginRes.json();
    console.log('✅ Login exitoso');
    console.log(`   Token: ${access_token.substring(0, 50)}...`);

    // Verificar endpoint /restaurant/me
    console.log('\n🏪 Llamando a /restaurant/me...\n');
    const meRes = await fetch(`${BASE_URL}/restaurant/me`, {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${meRes.status}`);
    
    if (!meRes.ok) {
      const error = await meRes.text();
      console.log('❌ Error:', error);
      return;
    }

    const restaurant = await meRes.json();
    console.log('✅ Restaurante obtenido:');
    console.log('   ID:', restaurant.id);
    console.log('   Nombre:', restaurant.name);
    console.log('   Owner:', restaurant.ownerUserId);

    // Verificar endpoint /restaurant/menu/categories
    console.log('\n📋 Llamando a /restaurant/menu/categories...\n');
    const categoriesRes = await fetch(`${BASE_URL}/restaurant/menu/categories`, {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${categoriesRes.status}`);
    
    if (!categoriesRes.ok) {
      const error = await categoriesRes.text();
      console.log('❌ Error:', error);
    } else {
      const categories = await categoriesRes.json();
      console.log(`✅ Categorías: ${categories.length}`);
      if (categories.length > 0) {
        console.log('   Primera:', categories[0].name);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCurrentUser();
