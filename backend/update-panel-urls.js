const fetch = require('node-fetch');

async function updateRestaurantPanelUrls() {
  try {
    console.log('🔄 Updating panel URLs for existing restaurants...\n');

    // Obtener todos los restaurantes
    const response = await fetch('http://localhost:3000/api/master/restaurants?limit=100');
    const result = await response.json();
    
    if (!result.data || result.data.length === 0) {
      console.log('No restaurants found');
      return;
    }

    console.log(`Found ${result.data.length} restaurants\n`);

    for (const restaurant of result.data) {
      const panelUrl = `http://localhost:65456/#/login?r=${restaurant.slug}`;
      
      console.log(`📝 ${restaurant.name}`);
      console.log(`   Slug: ${restaurant.slug}`);
      console.log(`   Panel URL: ${panelUrl}`);
      
      // Actualizar el restaurante con la URL del panel
      const updateResponse = await fetch(
        `http://localhost:3000/api/master/restaurants/${restaurant.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ panelUrl }),
        }
      );

      if (updateResponse.ok) {
        console.log(`   ✅ Updated\n`);
      } else {
        console.log(`   ❌ Failed: ${updateResponse.status}\n`);
      }
    }

    console.log('✅ All restaurants updated!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateRestaurantPanelUrls();
