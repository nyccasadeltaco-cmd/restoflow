const http = require('http');

// Este script usa el backend que ya está corriendo
const BACKEND_URL = 'http://localhost:3000';

const restaurantSlugs = [
  'super-tacos',
  'pizzeria-giovanny',
  'super-deli',
  'deli-la-opcion'
];

async function checkBranding(slug) {
  return new Promise((resolve, reject) => {
    http.get(`${BACKEND_URL}/api/public/restaurants/${slug}/branding`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('\n🏪 RESTAURANTES DISPONIBLES PARA LOGIN:\n');
  console.log('='.repeat(80));

  for (const slug of restaurantSlugs) {
    const branding = await checkBranding(slug);
    
    if (branding) {
      console.log(`\n📍 ${branding.name}`);
      console.log(`   Slug: ${slug}`);
      console.log(`   URL Panel: http://localhost:65456/#/r/${slug}/login`);
      console.log(`   Color: ${branding.primaryColor || 'No definido'}`);
      console.log(`   ---`);
      console.log(`   ℹ️  Para login, usa el email y password del usuario admin de este restaurante`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 NOTA IMPORTANTE:\n');
  console.log('   El login usa la tabla "users" de la base de datos.');
  console.log('   Cada usuario RESTAURANT_ADMIN está vinculado a UN restaurante.');
  console.log('   El email y password deben coincidir con lo que está en la BD.\n');
  console.log('   Si no recuerdas las credenciales, puedes:');
  console.log('   1. Verificar en Supabase → tabla "users"');
  console.log('   2. Usar el Master Panel para ver/editar usuarios');
  console.log('   3. Resetear la contraseña de un usuario específico\n');
}

main();
