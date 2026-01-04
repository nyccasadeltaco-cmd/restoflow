/**
 * Mock Data Generator for RestoFlow Client Development
 * 
 * Ejecutar: node generate-mock-data.js > mock-data.json
 */

const { v4: uuidv4 } = require('uuid');

// Coordenadas de ejemplo (Manhattan, NYC)
const BASE_LAT = 40.7589;
const BASE_LNG = -73.9851;

// Generar ubicación aleatoria cerca de la base
function randomLocation(maxDistanceKm = 5) {
  const kmToDegreesLat = 1 / 111;
  const kmToDegreesLng = 1 / (111 * Math.cos(BASE_LAT * Math.PI / 180));
  
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * maxDistanceKm;
  
  const lat = BASE_LAT + (Math.sin(angle) * distance * kmToDegreesLat);
  const lng = BASE_LNG + (Math.cos(angle) * distance * kmToDegreesLng);
  
  return { lat, lng, distanceKm: distance };
}

// Calcular ETA simple
function calculateETA(distanceKm) {
  const prepTime = 15 + Math.floor(Math.random() * 10); // 15-25 min
  const deliveryTime = Math.ceil(distanceKm * 5); // 5 min/km
  return prepTime + deliveryTime;
}

// Generar stores
function generateStores(count = 20) {
  const types = ['restaurant', 'deli'];
  const names = [
    "Giuseppe's Pizza",
    "Burger Palace",
    "Sushi Express",
    "Taco Loco",
    "The Greek Corner",
    "Dragon Wok",
    "Pasta & Co",
    "BBQ House",
    "Veggie Delight",
    "Coffee & Sandwiches",
    "Mediterranean Grill",
    "Thai Basil",
    "El Asador",
    "Curry House",
    "The French Bistro",
    "Poke Bowl",
    "Steakhouse 47",
    "Ramen Bar",
    "Mexican Cantina",
    "Italian Kitchen"
  ];
  
  return names.slice(0, count).map((name, index) => {
    const location = randomLocation();
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: uuidv4(),
      name,
      type,
      latitude: location.lat,
      longitude: location.lng,
      isActive: true,
      isRegistered: true,
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=FF6B35&color=fff`,
      coverImageUrl: `https://picsum.photos/seed/${index}/800/400`,
      description: `${type === 'restaurant' ? 'Amazing restaurant' : 'Quick deli'} serving delicious food since ${1980 + Math.floor(Math.random() * 40)}`,
      rating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 500),
      etaMinutes: calculateETA(location.distanceKm),
      serviceRadiusKm: 5 + Math.random() * 5,
      distanceKm: location.distanceKm
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

// Generar menu items
function generateMenuItems(storeId, categories = ['Pizzas', 'Burgers', 'Appetizers', 'Drinks']) {
  const items = [];
  
  categories.forEach((category, catIndex) => {
    const itemCount = 3 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < itemCount; i++) {
      const hasModifiers = Math.random() > 0.5;
      
      const item = {
        id: uuidv4(),
        name: `${category} Special ${i + 1}`,
        description: `Delicious ${category.toLowerCase()} made with fresh ingredients`,
        price: 8 + Math.random() * 20,
        imageUrl: `https://picsum.photos/seed/${catIndex * 10 + i}/400/300`,
        category,
        available: Math.random() > 0.1, // 90% available
        modifiers: hasModifiers ? generateModifiers() : []
      };
      
      items.push(item);
    }
  });
  
  return items;
}

// Generar modifiers
function generateModifiers() {
  const modifiers = [];
  
  // Size modifier (required)
  modifiers.push({
    id: uuidv4(),
    name: 'Size',
    required: true,
    maxSelections: 1,
    options: [
      { id: uuidv4(), name: 'Small', priceModifier: 0 },
      { id: uuidv4(), name: 'Medium', priceModifier: 2 },
      { id: uuidv4(), name: 'Large', priceModifier: 4 }
    ]
  });
  
  // Toppings (optional)
  if (Math.random() > 0.5) {
    modifiers.push({
      id: uuidv4(),
      name: 'Add-ons',
      required: false,
      maxSelections: 3,
      options: [
        { id: uuidv4(), name: 'Extra cheese', priceModifier: 1.5 },
        { id: uuidv4(), name: 'Bacon', priceModifier: 2 },
        { id: uuidv4(), name: 'Avocado', priceModifier: 2.5 }
      ]
    });
  }
  
  return modifiers;
}

// Generar mock data completo
function generateMockData() {
  const stores = generateStores(15);
  
  const storesWithMenus = stores.map(store => ({
    ...store,
    menu: generateMenuItems(store.id)
  }));
  
  return {
    stores: storesWithMenus,
    metadata: {
      generatedAt: new Date().toISOString(),
      baseLocation: {
        latitude: BASE_LAT,
        longitude: BASE_LNG,
        name: 'Manhattan, NYC'
      },
      storeCount: stores.length,
      totalMenuItems: storesWithMenus.reduce((sum, s) => sum + s.menu.length, 0)
    }
  };
}

// Export
const mockData = generateMockData();
console.log(JSON.stringify(mockData, null, 2));
