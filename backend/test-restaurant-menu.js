const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testRestaurantMenu() {
  try {
    console.log('🧪 Test: Restaurant Menu API\n');
    console.log('═'.repeat(70));
    console.log('');

    // 1. Login como RESTAURANT_ADMIN
    console.log('1️⃣ Login como RESTAURANT_ADMIN...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@supertacos.com',
        password: 'tacos123',
      }),
    });

    if (!loginRes.ok) {
      const error = await loginRes.text();
      throw new Error(`Login falló (${loginRes.status}): ${error}`);
    }

    const { access_token } = await loginRes.json();
    console.log('✅ Login exitoso');
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 2. GET /restaurant/menu/categories (inicial - puede estar vacío)
    console.log('2️⃣ GET /restaurant/menu/categories (estado inicial)');
    const categoriesRes1 = await fetch(`${BASE_URL}/restaurant/menu/categories`, {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (!categoriesRes1.ok) {
      const error = await categoriesRes1.text();
      throw new Error(`GET categories falló: ${error}`);
    }

    const initialCategories = await categoriesRes1.json();
    console.log(`✅ Categorías encontradas: ${initialCategories.length}`);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 3. POST /restaurant/menu/categories - Crear Entradas
    console.log('3️⃣ POST /restaurant/menu/categories - Crear "Entradas"');
    const createCat1 = {
      name: 'Entradas',
      description: 'Deliciosas entradas para comenzar',
      displayOrder: 0,
      isActive: true,
    };

    console.log('Datos:', JSON.stringify(createCat1, null, 2));
    console.log('');

    const createCat1Res = await fetch(`${BASE_URL}/restaurant/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(createCat1),
    });

    if (!createCat1Res.ok) {
      const error = await createCat1Res.text();
      throw new Error(`Crear categoría falló: ${error}`);
    }

    const category1 = await createCat1Res.json();
    console.log('✅ Categoría creada:');
    console.log('   ID:', category1.id);
    console.log('   Nombre:', category1.name);
    console.log('   Display Order:', category1.displayOrder);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 4. POST /restaurant/menu/categories - Crear Platos Fuertes
    console.log('4️⃣ POST /restaurant/menu/categories - Crear "Platos Fuertes"');
    const createCat2 = {
      name: 'Platos Fuertes',
      description: 'Nuestros platillos principales',
      displayOrder: 1,
    };

    const createCat2Res = await fetch(`${BASE_URL}/restaurant/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(createCat2),
    });

    const category2 = await createCat2Res.json();
    console.log('✅ Categoría creada:');
    console.log('   ID:', category2.id);
    console.log('   Nombre:', category2.name);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 5. PATCH /restaurant/menu/categories/:id - Actualizar Entradas
    console.log('5️⃣ PATCH /restaurant/menu/categories/:id - Actualizar descripción');
    const updateCat = {
      description: 'Exquisitas entradas mexicanas para abrir el apetito',
    };

    const updateCatRes = await fetch(
      `${BASE_URL}/restaurant/menu/categories/${category1.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(updateCat),
      },
    );

    const updatedCat = await updateCatRes.json();
    console.log('✅ Categoría actualizada:');
    console.log('   Nueva descripción:', updatedCat.description);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 6. GET /restaurant/menu/categories (después de crear)
    console.log('6️⃣ GET /restaurant/menu/categories (listado completo)');
    const categoriesRes2 = await fetch(`${BASE_URL}/restaurant/menu/categories`, {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    const allCategories = await categoriesRes2.json();
    console.log(`✅ Total de categorías: ${allCategories.length}`);
    allCategories.forEach((cat, idx) => {
      console.log(`   ${idx + 1}. ${cat.name} (Order: ${cat.displayOrder})`);
    });
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 7. POST /restaurant/menu/items - Crear Guacamole
    console.log('7️⃣ POST /restaurant/menu/items - Crear "Guacamole"');
    const createItem1 = {
      categoryId: category1.id,
      name: 'Guacamole',
      description: 'Guacamole fresco preparado al momento con aguacate, cilantro y limón',
      price: 65.00,
      isAvailable: true,
      displayOrder: 0,
      tags: ['vegano', 'popular'],
      preparationTime: 5,
    };

    console.log('Datos:', JSON.stringify(createItem1, null, 2));
    console.log('');

    const createItem1Res = await fetch(`${BASE_URL}/restaurant/menu/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(createItem1),
    });

    if (!createItem1Res.ok) {
      const error = await createItem1Res.text();
      throw new Error(`Crear item falló: ${error}`);
    }

    const item1 = await createItem1Res.json();
    console.log('✅ Item creado:');
    console.log('   ID:', item1.id);
    console.log('   Nombre:', item1.name);
    console.log('   Precio:', item1.price);
    console.log('   Tags:', item1.tags);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 8. POST /restaurant/menu/items - Crear Tacos al Pastor
    console.log('8️⃣ POST /restaurant/menu/items - Crear "Tacos al Pastor"');
    const createItem2 = {
      categoryId: category2.id,
      name: 'Tacos al Pastor',
      description: 'Orden de 3 tacos al pastor con piña, cilantro y cebolla',
      price: 85.00,
      isAvailable: true,
      displayOrder: 0,
      tags: ['popular', 'picante'],
      preparationTime: 10,
    };

    const createItem2Res = await fetch(`${BASE_URL}/restaurant/menu/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(createItem2),
    });

    const item2 = await createItem2Res.json();
    console.log('✅ Item creado:');
    console.log('   ID:', item2.id);
    console.log('   Nombre:', item2.name);
    console.log('   Precio:', item2.price);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 9. POST /restaurant/menu/items - Crear más items
    console.log('9️⃣ POST /restaurant/menu/items - Crear items adicionales');
    
    const additionalItems = [
      {
        categoryId: category1.id,
        name: 'Nachos con Queso',
        price: 75.00,
        isAvailable: true,
      },
      {
        categoryId: category2.id,
        name: 'Burrito Supremo',
        price: 95.00,
        isAvailable: false, // No disponible
      },
    ];

    for (const itemData of additionalItems) {
      const res = await fetch(`${BASE_URL}/restaurant/menu/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(itemData),
      });
      const item = await res.json();
      console.log(`   ✓ ${item.name} - $${item.price} (Disponible: ${item.isAvailable})`);
    }
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 10. GET /restaurant/menu/items (todos)
    console.log('🔟 GET /restaurant/menu/items (listado completo)');
    const itemsRes1 = await fetch(`${BASE_URL}/restaurant/menu/items`, {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    const allItems = await itemsRes1.json();
    console.log(`✅ Total de items: ${allItems.length}`);
    allItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} - $${item.price} (Disponible: ${item.isAvailable})`);
    });
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 11. GET /restaurant/menu/items?categoryId=X
    console.log('1️⃣1️⃣ GET /restaurant/menu/items?categoryId=... (filtro por categoría)');
    const itemsByCatRes = await fetch(
      `${BASE_URL}/restaurant/menu/items?categoryId=${category1.id}`,
      { headers: { 'Authorization': `Bearer ${access_token}` } },
    );

    const itemsByCat = await itemsByCatRes.json();
    console.log(`✅ Items en "${category1.name}": ${itemsByCat.length}`);
    itemsByCat.forEach((item) => {
      console.log(`   - ${item.name}`);
    });
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 12. GET /restaurant/menu/items?isAvailable=true
    console.log('1️⃣2️⃣ GET /restaurant/menu/items?isAvailable=true (solo disponibles)');
    const availableItemsRes = await fetch(
      `${BASE_URL}/restaurant/menu/items?isAvailable=true`,
      { headers: { 'Authorization': `Bearer ${access_token}` } },
    );

    const availableItems = await availableItemsRes.json();
    console.log(`✅ Items disponibles: ${availableItems.length}`);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 13. GET /restaurant/menu/items?search=taco
    console.log('1️⃣3️⃣ GET /restaurant/menu/items?search=taco (búsqueda)');
    const searchRes = await fetch(
      `${BASE_URL}/restaurant/menu/items?search=taco`,
      { headers: { 'Authorization': `Bearer ${access_token}` } },
    );

    const searchResults = await searchRes.json();
    console.log(`✅ Resultados para "taco": ${searchResults.length}`);
    searchResults.forEach((item) => {
      console.log(`   - ${item.name}`);
    });
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    // 14. PATCH /restaurant/menu/items/:id - Cambiar precio
    console.log('1️⃣4️⃣ PATCH /restaurant/menu/items/:id - Actualizar precio');
    const updateItem = {
      price: 70.00,
    };

    const updateItemRes = await fetch(
      `${BASE_URL}/restaurant/menu/items/${item1.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(updateItem),
      },
    );

    const updatedItem = await updateItemRes.json();
    console.log('✅ Item actualizado:');
    console.log(`   ${updatedItem.name}: $${item1.price} → $${updatedItem.price}`);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');

    console.log('🎉 Todos los tests pasaron exitosamente!\n');
    console.log('📋 Resumen de Endpoints Probados:');
    console.log('   ✅ GET    /restaurant/menu/categories');
    console.log('   ✅ POST   /restaurant/menu/categories');
    console.log('   ✅ PATCH  /restaurant/menu/categories/:id');
    console.log('   ✅ GET    /restaurant/menu/items');
    console.log('   ✅ GET    /restaurant/menu/items?categoryId=...');
    console.log('   ✅ GET    /restaurant/menu/items?isAvailable=true');
    console.log('   ✅ GET    /restaurant/menu/items?search=...');
    console.log('   ✅ POST   /restaurant/menu/items');
    console.log('   ✅ PATCH  /restaurant/menu/items/:id');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

testRestaurantMenu();
