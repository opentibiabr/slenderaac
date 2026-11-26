import type { CoinOrders, PrismaClient } from '@prisma/client';

import { CoinTransactionType } from '$lib/coinTransactions';

const openStatuses = ['PENDING', 'FAILED_ATTEMPT'] as const;

export function updateStripeCoinOrderStatus(
	prisma: PrismaClient,
	paymentToken: string,
	status: 'PENDING' | 'FAILED_ATTEMPT' | 'CANCELED',
) {
	return prisma.coinOrders.updateMany({
		where: {
			payment_token: paymentToken,
			stripe_fulfillment_enabled: true,
			status: { in: [...openStatuses] },
		},
		data: { status },
	});
}

export function fulfillStripeCoinOrder(
	prisma: PrismaClient,
	order: Pick<CoinOrders, 'id' | 'account_id' | 'amount'>,
) {
	return prisma.$transaction(async (transaction) => {
		const { count } = await transaction.coinOrders.updateMany({
			where: {
				id: order.id,
				stripe_fulfillment_enabled: true,
				status: { in: [...openStatuses] },
			},
			data: { status: 'COMPLETED' },
		});
		if (count === 0) return;

		await transaction.coinsTransactions.create({
			data: {
				account: { connect: { id: order.account_id } },
				description: `Purchase of ${order.amount} coins`,
				amount: order.amount,
				type: CoinTransactionType.CoinAdd,
			},
		});
		await transaction.accounts.update({
			where: { id: order.account_id },
			data: { coins_transferable: { increment: order.amount } },
		});
	});
}
