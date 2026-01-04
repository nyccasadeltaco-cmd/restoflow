import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTenantRelationToRestaurants1735001100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'restaurants',
      new TableColumn({
        name: 'tenant_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'restaurants',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'default_restaurant_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'tenants',
      new TableForeignKey({
        columnNames: ['default_restaurant_id'],
        referencedTableName: 'restaurants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const restaurantsTable = await queryRunner.getTable('restaurants');
    const tenantIdFk = restaurantsTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes('tenant_id'),
    );
    if (tenantIdFk) {
      await queryRunner.dropForeignKey('restaurants', tenantIdFk);
    }
    await queryRunner.dropColumn('restaurants', 'tenant_id');

    const tenantsTable = await queryRunner.getTable('tenants');
    const defaultRestaurantFk = tenantsTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes('default_restaurant_id'),
    );
    if (defaultRestaurantFk) {
      await queryRunner.dropForeignKey('tenants', defaultRestaurantFk);
    }
    await queryRunner.dropColumn('tenants', 'default_restaurant_id');
  }
}
