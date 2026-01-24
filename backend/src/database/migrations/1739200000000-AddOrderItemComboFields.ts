import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemComboFields1739200000000 implements MigrationInterface {
  name = 'AddOrderItemComboFields1739200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS "itemType" varchar(20) NOT NULL DEFAULT 'menu_item';
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS "comboId" uuid NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS "displayName" text NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS "displayDescription" text NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN "menuItemId" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN "menuItemId" SET NOT NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS "displayDescription";
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS "displayName";
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS "comboId";
    `);
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN IF EXISTS "itemType";
    `);
  }
}
