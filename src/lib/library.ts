import type {
	InformationNode,
	InformationPresentation,
} from './information-content';

export type LibraryEntry = { race: string; name: string; image: string };

type LibraryCard = Omit<LibraryEntry, 'race'> & { race: string | null };

function libraryCards(presentation: InformationPresentation): LibraryCard[] {
	const entries: LibraryCard[] = [];
	const text = (nodes: InformationNode[]): string =>
		nodes
			.map((node) => (typeof node === 'string' ? node : text(node.children)))
			.join('')
			.trim();
	function visit(nodes: InformationNode[]) {
		for (const node of nodes) {
			if (typeof node === 'string') continue;
			if (node.attrs.class === 'CreatureEntry') {
				const link = node.children.find(
					(child) => typeof child !== 'string' && child.tag === 'a',
				);
				const image = (
					link && typeof link !== 'string' ? link.children : node.children
				).find((child) => typeof child !== 'string' && child.tag === 'img');
				let race: string | null = null;
				if (link && typeof link !== 'string') {
					try {
						race = new URL(
							link.attrs.href,
							'https://slender.invalid',
						).searchParams.get('race');
					} catch {
						continue;
					}
					if (!race || !/^[a-z0-9_]{1,80}$/.test(race)) continue;
				}
				if (image && typeof image !== 'string')
					entries.push({
						race,
						name: text(node.children),
						image: image.attrs.src,
					});
			} else visit(node.children);
		}
	}
	visit(presentation.body);
	return entries;
}

export function libraryEntries(
	presentation: InformationPresentation,
): LibraryEntry[] {
	return libraryCards(presentation).filter(
		(entry): entry is LibraryEntry => entry.race !== null,
	);
}

export function libraryPortraitForName(
	presentation: InformationPresentation,
	name: string,
): string | null {
	return (
		libraryCards(presentation).find(
			(entry) => entry.name.toLowerCase() === name.toLowerCase(),
		)?.image ?? null
	);
}
