export type InformationSection = 'about' | 'guides';

export type InformationPage = {
	id: string;
	section: InformationSection;
	slug: string;
	title: string;
	source: string;
	summary: string;
	minimumBodyWidth?: number;
};

export const informationPages: InformationPage[] = [
	{
		id: 'whatistibia',
		minimumBodyWidth: 785,
		section: 'about',
		slug: 'what-is-tibia',
		title: 'What Is Tibia?',
		source: 'https://www.tibia.com/abouttibia/?subtopic=whatistibia',
		summary:
			'Explore a multiplayer fantasy world, develop your character and adventure with other players. Create an account to begin, or read the game guides to learn more.',
	},
];

export function informationPath(page: InformationPage): string {
	return `/${page.section}/${page.slug}`;
}

export function informationPageForPath(pathname: string) {
	return informationPages.find(
		(page) => informationPath(page) === pathname.replace(/\/$/, ''),
	);
}

/** Keep source deep links usable as their built-in equivalents become available. */
export function informationDestination(href: string): string {
	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return href;
	}
	if (url.protocol !== 'https:' || url.hostname !== 'www.tibia.com')
		return href;
	const page = informationPages.find((entry) => {
		const source = new URL(entry.source);
		return (
			source.pathname === url.pathname &&
			source.searchParams.get('subtopic') === url.searchParams.get('subtopic')
		);
	});
	if (!page) return href;
	url.searchParams.delete('subtopic');
	return `${informationPath(page)}${url.search}${url.hash}`;
}
