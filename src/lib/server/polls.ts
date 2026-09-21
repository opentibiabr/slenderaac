import { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';

import { communityFormOpen } from '$lib/community-forms';
import { pollChoice, pollOptions, pollResults } from '$lib/polls';
import { communityFormFailure } from '$lib/server/community-forms';
import { prisma } from '$lib/server/prisma';

export async function currentPoll() {
	const now = new Date();
	return prisma.poll.findFirst({
		where: {
			published: true,
			starts_at: { lte: now },
			OR: [{ ends_at: null }, { ends_at: { gt: now } }],
		},
		select: { id: true, title: true },
		orderBy: [{ starts_at: 'desc' }, { id: 'asc' }],
	});
}

export async function loadPollResults(id: string, options: unknown) {
	const counts = await prisma.pollVote.groupBy({
		by: ['option_id'],
		where: { poll_id: id },
		_count: { _all: true },
	});
	return pollResults(
		pollOptions(options),
		counts.map((row) => ({ option_id: row.option_id, count: row._count._all })),
	);
}

export async function submitVote(
	pollId: string,
	accountId: number,
	data: FormData,
) {
	try {
		return await prisma.$transaction(
			async (tx) => {
				const poll = await tx.poll.findUnique({ where: { id: pollId } });
				if (!poll || !poll.published) throw error(404, 'Poll not found');
				if (!communityFormOpen(poll))
					return communityFormFailure(409, {
						global: ['This poll is closed.'],
					});
				if (data.get('form_version') !== poll.updated_at.toISOString())
					return communityFormFailure(409, {
						global: ['This poll has changed. Reload it before voting.'],
					});
				const option = pollChoice(data, pollOptions(poll.options));
				if (!option)
					return communityFormFailure(400, {
						global: ['Select one of the available options.'],
					});
				await tx.pollVote.create({
					data: { poll_id: pollId, account_id: accountId, option_id: option },
				});
				return { submitted: true };
			},
			{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
		);
	} catch (cause) {
		if (cause instanceof Prisma.PrismaClientKnownRequestError) {
			if (cause.code === 'P2002')
				return communityFormFailure(409, {
					global: ['Your vote has already been received.'],
				});
			if (cause.code === 'P2034')
				return communityFormFailure(409, {
					global: ['The poll changed while voting. Please try again.'],
				});
			if (cause.code === 'P2003')
				return communityFormFailure(403, {
					global: ['The account is no longer available. Please sign in again.'],
				});
		}
		throw cause;
	}
}
