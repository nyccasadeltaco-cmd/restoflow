import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStripeFields1739600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasRestaurantStripe = await queryRunner.hasColumn(
      'restaurants',
      'stripe_account_id',
    );
    if (!hasRestaurantStripe) {
      await queryRunner.addColumn(
        'restaurants',
        new TableColumn({
          name: 'stripe_account_id',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    const hasOrderSession = await queryRunner.hasColumn(
      'orders',
      'stripe_session_id',
    );
    if (!hasOrderSession) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'stripe_session_id',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    const hasOrderPaymentIntent = await queryRunner.hasColumn(
      'orders',
      'stripe_payment_intent_id',
    );
    if (!hasOrderPaymentIntent) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'stripe_payment_intent_id',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    const hasOrderStripeAccount = await queryRunner.hasColumn(
      'orders',
      'stripe_account_id',
    );
    if (!hasOrderStripeAccount) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'stripe_account_id',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasOrderStripeAccount = await queryRunner.hasColumn(
      'orders',
      'stripe_account_id',
    );
    if (hasOrderStripeAccount) {
      await queryRunner.dropColumn('orders', 'stripe_account_id');
    }

    const hasOrderPaymentIntent = await queryRunner.hasColumn(
      'orders',
      'stripe_payment_intent_id',
    );
    if (hasOrderPaymentIntent) {
      await queryRunner.dropColumn('orders', 'stripe_payment_intent_id');
    }

    const hasOrderSession = await queryRunner.hasColumn(
      'orders',
      'stripe_session_id',
    );
    if (hasOrderSession) {
      await queryRunner.dropColumn('orders', 'stripe_session_id');
    }

    const hasRestaurantStripe = await queryRunner.hasColumn(
      'restaurants',
      'stripe_account_id',
    );
    if (hasRestaurantStripe) {
      await queryRunner.dropColumn('restaurants', 'stripe_account_id');
    }
  }
}
