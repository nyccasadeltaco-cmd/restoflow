import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPanelUrlToRestaurants1733793600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'restaurants',
      new TableColumn({
        name: 'panel_url',
        type: 'text',
        isNullable: true,
      }),
    );

    // Actualizar restaurantes existentes con su panelUrl
    const restaurants = await queryRunner.query(
      'SELECT id, slug FROM restaurants',
    );

    for (const restaurant of restaurants) {
      const panelUrl = `http://localhost:65456/#/login?r=${restaurant.slug}`;
      await queryRunner.query(
        'UPDATE restaurants SET panel_url = $1 WHERE id = $2',
        [panelUrl, restaurant.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('restaurants', 'panel_url');
  }
}
