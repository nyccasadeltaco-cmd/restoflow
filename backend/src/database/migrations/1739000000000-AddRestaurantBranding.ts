import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRestaurantBranding1739000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasColumn('restaurants', 'branding');
    if (exists) return;
    await queryRunner.addColumn(
      'restaurants',
      new TableColumn({
        name: 'branding',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('restaurants', 'branding');
  }
}
