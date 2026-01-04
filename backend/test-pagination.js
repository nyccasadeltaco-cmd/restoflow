// Test script para verificar la paginación
const fetch = require('node-fetch');

async function testPagination() {
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@plataforma.com',
        password: 'master123',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✓ Login successful');

    // 2. Get restaurants
    console.log('\n2. Getting restaurants...');
    const restaurantsResponse = await fetch('http://localhost:3000/api/master/restaurants?page=1&limit=20', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!restaurantsResponse.ok) {
      throw new Error(`Get restaurants failed: ${restaurantsResponse.statusText}`);
    }

    const restaurantsData = await restaurantsResponse.json();
    console.log('\n✓ Response received:');
    console.log(JSON.stringify(restaurantsData, null, 2));

    // 3. Check types
    console.log('\n3. Checking types:');
    console.log(`  - page type: ${typeof restaurantsData.meta.page}`);
    console.log(`  - limit type: ${typeof restaurantsData.meta.limit}`);
    console.log(`  - total type: ${typeof restaurantsData.meta.total}`);
    console.log(`  - totalPages type: ${typeof restaurantsData.meta.totalPages}`);

    if (typeof restaurantsData.meta.page === 'number' && typeof restaurantsData.meta.limit === 'number') {
      console.log('\n✅ SUCCESS! page and limit are now numbers');
    } else {
      console.log('\n❌ FAILED! page and limit are still strings');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPagination();
