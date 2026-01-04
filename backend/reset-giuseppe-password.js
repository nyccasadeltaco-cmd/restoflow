const http = require('http');

// IDs del screenshot de Supabase
const GIUSEPPE_USER_ID = '12566e48-bf7b-4f25-94e9-5caf130ba23f';
const NEW_PASSWORD = 'giovanny123';

// Credenciales del SUPER_ADMIN
const ADMIN_EMAIL = 'admin@plataforma.com';
const ADMIN_PASSWORD = 'admin123';

async function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function login(email, password) {
  const postData = JSON.stringify({ email, password });
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  return httpRequest(options, postData);
}

async function resetPassword(userId, newPassword, token) {
  const postData = JSON.stringify({ newPassword });
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/users/${userId}/reset-password`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  return httpRequest(options, postData);
}

async function main() {
  console.log('\n🔐 RESETEAR CONTRASEÑA DE GIUSEPPE\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Login como SUPER_ADMIN
    console.log('\n1️⃣  Autenticando como SUPER_ADMIN...');
    const loginResult = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    
    if (loginResult.statusCode !== 200 && loginResult.statusCode !== 201) {
      console.error('❌ Error al autenticar:', loginResult.body);
      return;
    }
    
    const token = loginResult.body.accessToken;
    console.log('   ✅ Autenticado correctamente');
    
    // 2. Resetear contraseña
    console.log('\n2️⃣  Reseteando contraseña de Giuseppe...');
    console.log(`   User ID: ${GIUSEPPE_USER_ID}`);
    console.log(`   Nueva contraseña: ${NEW_PASSWORD}`);
    
    const result = await resetPassword(GIUSEPPE_USER_ID, NEW_PASSWORD, token);
    
    if (result.statusCode === 200) {
      console.log('\n✅ ¡CONTRASEÑA ACTUALIZADA EXITOSAMENTE!\n');
      console.log('='.repeat(60));
      console.log('\n📋 CREDENCIALES PARA LOGIN:\n');
      console.log('   Email:    giuseppe@dongiuseppe.com');
      console.log(`   Password: ${NEW_PASSWORD}`);
      console.log('\n🌐 URL DEL PANEL:\n');
      console.log('   http://localhost:65456/#/r/pizzeria-giovanny/login');
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      console.error('\n❌ Error al resetear contraseña:');
      console.error('   Status:', result.statusCode);
      console.error('   Respuesta:', result.body);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Asegúrate de que el backend esté corriendo en http://localhost:3000');
  }
}

main();
