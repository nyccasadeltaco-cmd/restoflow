import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemComboFields1739200000000 implements MigrationInterface {
  name = 'AddOrderItemComboFields1739200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS item_type varchar(20) NOT NULL DEFAULT 'menu_item';
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS combo_id uuid NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS display_name text NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS display_description text NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN menu_item_id DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN menu_item_id SET NOT NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS display_description;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS display_name;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS combo_id;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS item_type;
    `);
  }
}
