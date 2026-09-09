import fs from 'node:fs/promises';
import path from 'node:path';

import { dev } from '$app/environment';

import type {
	CipArticlePresentation,
	CipNewsReference,
	ReferenceNode,
} from '$lib/themes/cip-slender/reference-types';
import { referenceDate } from '$lib/server/news/dates';

import { env } from '$env/dynamic/private';

function validNodes(nodes: ReferenceNode[], depth = 0): boolean {
	return (
		depth < 24 &&
		Array.isArray(nodes) &&
		nodes.length < 10000 &&
		nodes.every((node) => {
			if (typeof node === 'string') return true;
			return (
				!!node &&
				typeof node.tag === 'string' &&
				!!node.attrs &&
				Object.values(node.attrs).every((value) => typeof value === 'string') &&
				validNodes(node.children, depth + 1)
			);
		})
	);
}

export function readArticlePresentation(
	value: unknown,
): CipArticlePresentation | null {
	if (!value || typeof value !== 'object') return null;
	const presentation = value as CipArticlePresentation;
	return typeof presentation.icon === 'string' &&
		presentation.icon.startsWith('/theme-assets/cip-slender/') &&
		(presentation.commentHref === null ||
			(typeof presentation.commentHref === 'string' &&
				/^https?:\/\//.test(presentation.commentHref))) &&
		validNodes(presentation.body)
		? presentation
		: null;
}

export async function loadNewsReference(
	url: URL,
): Promise<CipNewsReference | null> {
	if (
		!dev ||
		url.searchParams.get('themePreview') !== 'cip-slender' ||
		url.searchParams.get('cipReference') !== '1' ||
		!env.THEME_ASSETS_ROOT
	) {
		return null;
	}

	try {
		const file = path.join(
			env.THEME_ASSETS_ROOT,
			'cip-slender',
			'reference',
			'latest-news.json',
		);
		const reference = JSON.parse(
			await fs.readFile(file, 'utf8'),
		) as CipNewsReference;
		if (
			!reference ||
			!Array.isArray(reference.articles) ||
			!Array.isArray(reference.ticker) ||
			!reference.assets ||
			!Object.values(reference.assets).every(
				(value) =>
					typeof value === 'string' &&
					value.startsWith('/theme-assets/cip-slender/'),
			) ||
			!Array.isArray(reference.topbarStats) ||
			reference.topbarStats.length !== 2 ||
			!reference.topbarStats.every(
				(values) =>
					Array.isArray(values) &&
					values.length === 2 &&
					values.every(Number.isFinite),
			) ||
			typeof reference.onlineCount !== 'string' ||
			typeof reference.premiumText !== 'string' ||
			typeof reference.pollText !== 'string' ||
			!reference.articles.every(
				(article) =>
					article &&
					typeof article.id === 'string' &&
					typeof article.title === 'string' &&
					typeof article.date === 'string' &&
					Number.isFinite(referenceDate(article.date).getTime()) &&
					typeof article.icon === 'string' &&
					validNodes(article.body),
			) ||
			!reference.ticker.every(
				(item) =>
					item &&
					typeof item.date === 'string' &&
					Number.isFinite(referenceDate(item.date).getTime()) &&
					typeof item.text === 'string' &&
					typeof item.icon === 'string',
			)
		)
			return null;
		return reference;
	} catch {
		return null;
	}
}
