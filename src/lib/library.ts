import type {
	InformationNode,
	InformationPresentation,
} from './information-content';

export type LibraryEntry = { race: string; name: string; image: string };

export function libraryEntries(
	presentation: InformationPresentation,
): LibraryEntry[] {
	const entries: LibraryEntry[] = [];
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
				if (!link || typeof link === 'string') continue;
				const image = link.children.find(
					(child) => typeof child !== 'string' && child.tag === 'img',
				);
				let race: string | null;
				try {
					race = new URL(
						link.attrs.href,
						'https://slender.invalid',
					).searchParams.get('race');
				} catch {
					continue;
				}
				if (
					race &&
					/^[a-z0-9_]{1,80}$/.test(race) &&
					image &&
					typeof image !== 'string'
				)
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
