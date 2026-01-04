import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddTenantDomainsTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenant_domains',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'tenant_id', type: 'integer', isNullable: false },
          { name: 'domain', type: 'varchar', isUnique: true, isNullable: false },
          { name: 'status', type: 'varchar', length: '16', default: "'pending'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      })
    );
    await queryRunner.createForeignKey(
      'tenant_domains',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tenant_domains');
  }
}
