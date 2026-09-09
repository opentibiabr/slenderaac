import { Prisma } from '@prisma/client';
import { error, fail } from '@sveltejs/kit';

import { prisma } from '$lib/server/prisma';

export const questFormError = (message: string, status = 400) =>
	fail(status, { errors: { global: [message] } });

export async function questAdminWrite<T>(
	work: (tx: Prisma.TransactionClient) => Promise<T>,
) {
	try {
		return await prisma.$transaction(work, {
			isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
		});
	} catch (cause) {
		if (cause instanceof Prisma.PrismaClientKnownRequestError) {
			if (cause.code === 'P2002')
				return questFormError('This slug or event result already exists.', 409);
			if (cause.code === 'P2003')
				return questFormError(
					'Remove the linked results before deleting this calendar event.',
					409,
				);
			if (cause.code === 'P2034')
				return questFormError(
					'This record changed during your update. Please try again.',
					409,
				);
		}
		throw cause;
	}
}

export async function requireQuest(tx: Prisma.TransactionClient, id: string) {
	const quest = await tx.worldQuest.findUnique({ where: { id } });
	if (!quest) throw error(404, 'World quest not found');
	return quest;
}
