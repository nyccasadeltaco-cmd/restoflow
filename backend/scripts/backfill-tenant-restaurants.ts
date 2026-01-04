import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource, IsNull } from 'typeorm';
import { ormConfig } from '../src/config/ormconfig';
import { Tenant } from '../src/modules/tenants/entities/tenant.entity';
import { Restaurant } from '../src/modules/restaurants/entities/restaurant.entity';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const config = ormConfig() as any;
  config.synchronize = false;
  const dataSource = new DataSource(config);
  await dataSource.initialize();

  const tenantRepo = dataSource.getRepository(Tenant);
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurants = await restaurantRepo.find({
    where: { tenantId: IsNull() },
    order: { createdAt: 'ASC' },
  });

  for (const restaurant of restaurants) {
    let tenant = await tenantRepo.findOne({ where: { slug: restaurant.slug } });
    if (!tenant) {
      tenant = tenantRepo.create({
        name: restaurant.name,
        slug: restaurant.slug,
        contactEmail: restaurant.email,
        contactPhone: restaurant.phone,
        isActive: true,
      });
      tenant = await tenantRepo.save(tenant);
    }

    restaurant.tenantId = tenant.id;
    await restaurantRepo.save(restaurant);

    if (!tenant.defaultRestaurantId) {
      tenant.defaultRestaurantId = restaurant.id;
      await tenantRepo.save(tenant);
    }
  }

  const tenantsMissingDefault = await tenantRepo.find({
    where: { defaultRestaurantId: IsNull() },
  });

  for (const tenant of tenantsMissingDefault) {
    const firstRestaurant = await restaurantRepo.findOne({
      where: { tenantId: tenant.id },
      order: { createdAt: 'ASC' },
    });
    if (firstRestaurant) {
      tenant.defaultRestaurantId = firstRestaurant.id;
      await tenantRepo.save(tenant);
    }
  }

  await dataSource.destroy();
  console.log('[backfill] completed');
}

run().catch((error) => {
  console.error('[backfill] failed', error);
  process.exit(1);
});
