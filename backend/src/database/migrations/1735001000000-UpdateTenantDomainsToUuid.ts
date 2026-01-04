import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class UpdateTenantDomainsToUuid1735001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.tenant_domains') IS NOT NULL THEN
          ALTER TABLE tenant_domains RENAME TO tenant_domains_legacy;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.tenant_domains_legacy') IS NOT NULL THEN
          ALTER TABLE tenant_domains_legacy DROP CONSTRAINT IF EXISTS "PK_5ade9ab3ed3d7eebef7a8ea5bdd";
          ALTER TABLE tenant_domains_legacy DROP CONSTRAINT IF EXISTS "UQ_114ca3e45874f37ae9fef0ea6b5";
        END IF;
      END $$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'tenant_domains',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'domain', type: 'varchar', isUnique: true, isNullable: false },
          { name: 'status', type: 'varchar', length: '16', default: "'pending'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'tenant_domains',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tenant_domains');

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.tenant_domains_legacy') IS NOT NULL THEN
          ALTER TABLE tenant_domains_legacy RENAME TO tenant_domains;
        END IF;
      END $$;
    `);
  }
}
