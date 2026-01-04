import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOperatingHours1734000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'restaurants',
      new TableColumn({
        name: 'operating_hours',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('restaurants', 'operating_hours');
  }
}
