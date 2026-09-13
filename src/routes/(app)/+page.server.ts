import { error } from '@sveltejs/kit';

import { referenceDate } from '$lib/server/news/dates';
import { prisma } from '$lib/server/prisma';
import {
	loadNewsReference,
	readArticlePresentation,
} from '$lib/server/theme-assets/news-reference';

import type { PageServerLoad } from './$types';

export const load = (async ({ url, parent }) => {
	const requestedId = url.searchParams.get('news') || null;
	const requestedTicker = url.searchParams.get('ticker');
	const classicReference =
		!requestedId || requestedId.startsWith('classic-reference-')
			? await loadNewsReference(url)
			: null;
	if (classicReference) {
		if (requestedId) {
			classicReference.articles = classicReference.articles.filter(
				(article) => article.id === requestedId,
			);
			if (!classicReference.articles.length) throw error(404, 'News not found');
		}
		return {
			title: 'Latest News',
			classicReference,
			tickers: [],
			articles: classicReference.articles.map((article) => ({
				id: article.id,
				title: article.title,
				created_at: referenceDate(article.date),
				content: '',
				author: { name: 'Server' },
				category: article.category ?? 'community',
				presentation: {
					icon: article.icon,
					commentHref: article.commentHref,
					body: article.body,
				},
			})),
		};
	}
	const layout = await parent();
	const [news, recentTickers] = await Promise.all([
		prisma.news.findMany({
			where: {
				published: true,
				...(requestedId
					? { id: requestedId }
					: { type: { in: ['news', 'article'] } }),
			},
			include: { author: { select: { name: true } } },
			orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
			take: requestedId ? 1 : layout.selectedTheme === 'classic' ? 8 : 5,
		}),
		prisma.news.findMany({
			where: { published: true, type: 'ticker' },
			select: {
				id: true,
				title: true,
				content: true,
				created_at: true,
				category: true,
			},
			orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
			take: 5,
		}),
	]);
	if (requestedId && !news.length) throw error(404, 'News not found');
	let tickers = recentTickers;
	if (
		requestedTicker &&
		!/^\d+$/.test(requestedTicker) &&
		!tickers.some((item) => item.id === requestedTicker)
	) {
		const selected = await prisma.news.findFirst({
			where: { id: requestedTicker, published: true, type: 'ticker' },
			select: {
				id: true,
				title: true,
				content: true,
				created_at: true,
				category: true,
			},
		});
		if (!selected) throw error(404, 'News ticker not found');
		tickers = [selected, ...tickers.slice(0, 4)];
	}
	return {
		title: 'Latest News',
		classicReference: null,
		tickers,
		articles: news.map((article) => ({
			...article,
			presentation: readArticlePresentation(article.presentation),
		})),
	};
}) satisfies PageServerLoad;
