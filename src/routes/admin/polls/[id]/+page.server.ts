import { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';

import { communityEditorValues } from '$lib/community-forms';
import { pollInput, pollOptions } from '$lib/polls';
import { communityFormFailure } from '$lib/server/community-forms';
import { loadPollResults } from '$lib/server/polls';
import { prisma } from '$lib/server/prisma';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const poll = await prisma.poll.findUnique({
		where: { id: params.id },
		include: { _count: { select: { votes: true } } },
	});
	if (!poll) throw error(404, 'Poll not found');
	return { poll, results: await loadPollResults(poll.id, poll.options) };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ params, request }) => {
		const data = await request.formData();
		const input = pollInput(data);
		if (!input)
			return communityFormFailure(
				400,
				{
					global: [
						'Enter a title, valid dates and between two and twenty distinct options.',
					],
				},
				communityEditorValues(data),
			);
		try {
			return await prisma.$transaction(
				async (tx) => {
					const poll = await tx.poll.findUnique({
						where: { id: params.id },
						include: { _count: { select: { votes: true } } },
					});
					if (!poll) throw error(404, 'Poll not found');
					if (
						poll._count.votes &&
						(poll.title !== input.title ||
							poll.description !== input.description ||
							JSON.stringify(pollOptions(poll.options)) !==
								JSON.stringify(input.options))
					)
						return communityFormFailure(
							409,
							{
								global: [
									'The question and options cannot change after the first vote. Create another poll.',
								],
							},
							communityEditorValues(data),
						);
					await tx.poll.update({ where: { id: params.id }, data: input });
					return { saved: true, errors: {} as Record<string, string[]> };
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
		} catch (cause) {
			if (
				cause instanceof Prisma.PrismaClientKnownRequestError &&
				cause.code === 'P2034'
			)
				return communityFormFailure(
					409,
					{
						global: ['This poll changed during your update. Please try again.'],
					},
					communityEditorValues(data),
				);
			throw cause;
		}
	},
} satisfies Actions;
