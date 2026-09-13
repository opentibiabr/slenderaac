import { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';

import { helpEntryInput, helpQuery, helpTopics } from '$lib/help';
import { communityFormFailure } from '$lib/server/community-forms';
import { prisma } from '$lib/server/prisma';

const publicEntry = { published: true, topic: { in: Object.keys(helpTopics) } };
const summary = { id: true, slug: true, title: true, topic: true };
export const helpPageSize = 20;

export async function loadHelp(parameters: URLSearchParams) {
	const selection = helpQuery(parameters);
	if (!selection) throw error(400, 'Invalid help query');
	const { topic, article, query, page } = selection;
	const entry = article
		? await prisma.helpEntry.findFirst({
				where: { ...publicEntry, slug: article },
				select: { ...summary, content: true, updated_at: true },
			})
		: null;
	if (article && !entry) throw error(404, 'Help article not found');
	const where: Prisma.HelpEntryWhereInput = {
		...publicEntry,
		...(topic ? { topic } : {}),
		AND: query
			.split(' ')
			.filter(Boolean)
			.map((word) => ({
				OR: [{ title: { contains: word } }, { content: { contains: word } }],
			})),
	};
	const listing = !article && (!!topic || !!query);
	const total = listing ? await prisma.helpEntry.count({ where }) : 0;
	const pages = Math.max(1, Math.ceil(total / helpPageSize));
	if (listing && page > pages) throw error(404, 'Help page not found');
	const [entries, featured, viewed] = await Promise.all([
		listing
			? prisma.helpEntry.findMany({
					where,
					select: summary,
					orderBy: [{ title: 'asc' }, { id: 'asc' }],
					take: helpPageSize,
					skip: (page - 1) * helpPageSize,
				})
			: [],
		!listing && !entry
			? prisma.helpEntry.findMany({
					where: { ...publicEntry, featured: true },
					select: summary,
					orderBy: [{ updated_at: 'desc' }, { id: 'asc' }],
					take: 6,
				})
			: [],
		!listing && !entry
			? prisma.helpEntry.findMany({
					where: { ...publicEntry, views: { gt: 0 } },
					select: summary,
					orderBy: [{ views: 'desc' }, { id: 'asc' }],
					take: 6,
				})
			: [],
	]);
	return {
		...selection,
		listing,
		entry,
		entries,
		featured,
		viewed,
		total,
		pages,
	};
}

export async function recordHelpView(slug: string) {
	const count = await prisma.$executeRaw`
    UPDATE slender_help_entries SET views = views + 1
    WHERE slug = ${slug} AND published = true AND topic IN (${Prisma.join(Object.keys(helpTopics))})
  `;
	return { count };
}

export async function saveHelpEntry(input: FormData, id?: string) {
	const parsed = helpEntryInput(input);
	if (!parsed.valid)
		return communityFormFailure(400, parsed.errors, parsed.values);
	try {
		if (id) {
			const version = new Date(parsed.values.version);
			if (Number.isNaN(version.getTime()))
				return communityFormFailure(
					400,
					{ global: ['Reload the article before saving.'] },
					parsed.values,
				);
			const result = await prisma.helpEntry.updateMany({
				where: { id, updated_at: version },
				data: parsed.data,
			});
			if (!result.count)
				return communityFormFailure(
					409,
					{
						global: [
							'This article has changed or was deleted. Reload before saving.',
						],
					},
					parsed.values,
				);
			return { saved: id };
		}
		const entry = await prisma.helpEntry.create({ data: parsed.data });
		return { saved: entry.id };
	} catch (cause) {
		if (
			cause instanceof Prisma.PrismaClientKnownRequestError &&
			cause.code === 'P2002'
		)
			return communityFormFailure(
				409,
				{ slug: ['This address is already in use.'] },
				parsed.values,
			);
		throw cause;
	}
}
