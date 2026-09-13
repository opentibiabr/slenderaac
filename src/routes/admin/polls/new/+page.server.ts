import { redirect } from '@sveltejs/kit';

import { communityEditorValues } from '$lib/community-forms';
import { pollInput } from '$lib/polls';
import { communityFormFailure } from '$lib/server/community-forms';
import { prisma } from '$lib/server/prisma';

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
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
		const poll = await prisma.poll.create({ data: input });
		throw redirect(303, `/admin/polls/${poll.id}`);
	},
} satisfies Actions;
