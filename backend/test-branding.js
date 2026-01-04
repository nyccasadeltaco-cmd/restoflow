const fetch = require('node-fetch');

async function testBranding() {
  console.log('🧪 Testing Restaurant Branding Endpoints\n');

  const restaurants = ['super-tacos', 'don-giuseppe', 'el-pastor'];

  for (const slug of restaurants) {
    try {
      const response = await fetch(`http://localhost:3000/api/public/restaurants/${slug}/branding`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`✅ ${slug}:`);
        console.log(`   Name: ${data.name}`);
        console.log(`   Logo: ${data.logoUrl || 'No logo'}`);
        console.log(`   Primary Color: ${data.primaryColor || 'Default'}`);
        console.log('');
      } else {
        console.log(`❌ ${slug}: Status ${response.status}`);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ ${slug}: ${error.message}`);
      console.log('');
    }
  }
}

testBranding();
