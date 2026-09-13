import { Prisma } from '@prisma/client';
import { error, fail, redirect } from '@sveltejs/kit';
import invariant from 'tiny-invariant';

import { newsCategory, newsDate, newsType } from '$lib/news';
import { prisma } from '$lib/server/prisma';
import { requireLogin } from '$lib/server/session';
import { stringValidator, validate } from '$lib/server/validations';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const news = await prisma.news.findFirst({
		where: { id: params.id },
	});
	if (!news) throw error(404, 'News not found');
	return { news };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ locals, request, params }) => {
		requireLogin(locals, 'admin');

		const data = await request.formData();
		const previous = await prisma.news.findUnique({
			where: { id: params.id },
			select: { content: true, created_at: true },
		});
		if (!previous) throw error(404, 'News not found');
		const method = data.get('_method');
		if (method === 'DELETE') {
			await prisma.news.delete({ where: { id: params.id } });
			throw redirect(302, '/admin/news');
		}
		if (method === 'PUBLISH') {
			await prisma.news.update({
				where: { id: params.id },
				data: { published: data.get('published') === 'on' },
			});
			return { success: true };
		}

		const title = data.get('title');
		const content = data.get('content');
		const published = data.get('published');
		const type = newsType(data.get('type'));
		const category = newsCategory(data.get('category'));
		const created_at = newsDate(data.get('date'));
		if (!type || !category || !created_at)
			return fail(400, {
				errors: {
					global: ['Choose a valid type, category and publication date.'],
				} as Record<string, string[]>,
			});

		const errors = await validate(
			{
				title: [stringValidator],
				content: [stringValidator],
			},
			data,
		);

		if (Object.keys(errors).length > 0) {
			return fail(400, { invalid: true, errors: errors });
		}

		if (title) {
			invariant(typeof title === 'string', 'Name must be a string');
		}
		if (content) {
			invariant(typeof content === 'string', 'Name must be a string');
		}

		const author = await prisma.players.findFirst({
			where: {
				account_id: locals.session?.accountId,
				is_main: true,
			},
		});

		if (!author) {
			return fail(400, {
				invalid: true,
				errors: { global: ['No main character found'] } as Record<
					string,
					string[]
				>,
			});
		}

		try {
			await prisma.news.update({
				where: { id: params.id },
				data: {
					type,
					category,
					created_at:
						previous.created_at.toISOString().slice(0, 10) ===
						created_at.toISOString().slice(0, 10)
							? previous.created_at
							: created_at,
					...(typeof content === 'string' && content !== previous?.content
						? { presentation: Prisma.DbNull }
						: {}),
					...(title ? { title } : {}),
					...(content ? { content } : {}),
					published: published === 'on',
				},
			});
		} catch (e) {
			console.error(e);
			return fail(500, {
				errors: { global: ['Failed to update news article'] } as Record<
					string,
					string[]
				>,
			});
		}

		throw redirect(302, '/admin/news');
	},
} satisfies Actions;
