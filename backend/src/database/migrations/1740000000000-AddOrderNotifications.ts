import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddOrderNotifications1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'orderId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '20',
            default: "'SMS'",
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '30',
            default: "'TWILIO'",
          },
          {
            name: 'toPhone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'template',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'providerStatus',
            type: 'varchar',
            length: '40',
            isNullable: true,
          },
          {
            name: 'providerMessageSid',
            type: 'varchar',
            length: '80',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'payload',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'order_notifications',
      new TableIndex({
        name: 'IDX_order_notifications_provider_message_sid',
        columnNames: ['providerMessageSid'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'order_notifications',
      'IDX_order_notifications_provider_message_sid',
    );
    await queryRunner.dropTable('order_notifications');
  }
}

