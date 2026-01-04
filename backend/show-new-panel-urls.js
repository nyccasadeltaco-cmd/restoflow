const https = require('https');
const http = require('http');

// Configuración
const BACKEND_URL = 'http://localhost:3000';
const NEW_BASE_URL = 'http://localhost:65456';

// Lista de slugs conocidos
const RESTAURANT_SLUGS = [
  'super-tacos',
  'pizzeria-giovanny',
  'super-deli',
  'deli-la-opcion',
];

async function updateRestaurantPanelUrl(slug) {
  return new Promise((resolve, reject) => {
    // Primero obtener los datos del restaurante
    const getBrandingUrl = `${BACKEND_URL}/api/public/restaurants/${slug}/branding`;
    
    http.get(getBrandingUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const restaurant = JSON.parse(data);
            const newPanelUrl = `${NEW_BASE_URL}/#/r/${slug}/login`;
            
            console.log(`\n✅ ${restaurant.name}`);
            console.log(`   Slug: ${slug}`);
            console.log(`   Nueva URL: ${newPanelUrl}`);
            
            // Aquí normalmente harías un PATCH/PUT al backend para actualizar la URL
            // Como esto requiere autenticación, vamos a mostrar las URLs que deberían actualizarse
            
            resolve({
              id: restaurant.id,
              name: restaurant.name,
              slug: slug,
              newPanelUrl: newPanelUrl
            });
          } catch (e) {
            reject(new Error(`Error parsing JSON for ${slug}: ${e.message}`));
          }
        } else {
          reject(new Error(`Restaurant ${slug} not found (status ${res.statusCode})`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('📋 Actualizando URLs de paneles de restaurantes...\n');
  console.log(`Base URL: ${NEW_BASE_URL}`);
  console.log(`Nuevo formato: /#/r/:slug/login\n`);
  
  const results = [];
  
  for (const slug of RESTAURANT_SLUGS) {
    try {
      const result = await updateRestaurantPanelUrl(slug);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error con ${slug}:`, error.message);
    }
  }
  
  console.log('\n\n📊 RESUMEN DE URLs ACTUALIZADAS:');
  console.log('='.repeat(80));
  
  for (const r of results) {
    console.log(`\n🏪 ${r.name}`);
    console.log(`   📍 URL Panel: ${r.newPanelUrl}`);
  }
  
  console.log('\n\n✅ Proceso completado');
  console.log('\n📝 NOTA: Para actualizar las URLs en la BD, usa el Master Panel');
  console.log('   o ejecuta manualmente UPDATE restaurants SET "panelUrl" = ... WHERE slug = ...');
}

main();
