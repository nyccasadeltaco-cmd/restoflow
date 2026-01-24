import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeaturedAndCombos1739100000000 implements MigrationInterface {
  name = 'AddFeaturedAndCombos1739100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS featured_sections (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id uuid NOT NULL,
        key varchar(64) NOT NULL,
        title varchar(120) NOT NULL,
        is_enabled boolean NOT NULL DEFAULT true,
        sort_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_featured_sections_restaurant_key
      ON featured_sections (restaurant_id, key);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS featured_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id uuid NOT NULL,
        section_key varchar(64) NOT NULL,
        type varchar(32) NOT NULL,
        ref_id uuid NULL,
        title_override varchar(120) NULL,
        subtitle_override varchar(180) NULL,
        image_url_override text NULL,
        price_override numeric(10,2) NULL,
        cta_label varchar(40) NOT NULL DEFAULT 'Order',
        is_active boolean NOT NULL DEFAULT true,
        sort_order int NOT NULL DEFAULT 0,
        starts_at timestamptz NULL,
        ends_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_featured_items_restaurant_section
      ON featured_items (restaurant_id, section_key, is_active);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS combos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id uuid NOT NULL,
        name varchar(120) NOT NULL,
        description text NULL,
        price numeric(10,2) NOT NULL,
        image_url text NULL,
        is_available boolean NOT NULL DEFAULT true,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_combos_restaurant
      ON combos (restaurant_id, is_active);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS combo_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        combo_id uuid NOT NULL,
        menu_item_id uuid NOT NULL,
        quantity int NOT NULL DEFAULT 1,
        is_optional boolean NOT NULL DEFAULT false,
        group_key varchar(80) NULL,
        min_select int NULL,
        max_select int NULL,
        sort_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_combo_items_combo
      ON combo_items (combo_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS combo_items;');
    await queryRunner.query('DROP TABLE IF EXISTS combos;');
    await queryRunner.query('DROP TABLE IF EXISTS featured_items;');
    await queryRunner.query('DROP TABLE IF EXISTS featured_sections;');
  }
}
