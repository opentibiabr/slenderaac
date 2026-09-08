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
	{
		id: 'screenshots',
		section: 'about',
		slug: 'screenshots',
		title: 'Screenshots',
		source: 'https://www.tibia.com/abouttibia/?subtopic=screenshots',
		summary:
			'Explore scenes from the game world, discover new places and plan your next adventure.',
	},
	{
		id: 'gamefeatures',
		section: 'about',
		slug: 'game-features',
		title: 'Game Features',
		source: 'https://www.tibia.com/abouttibia/?subtopic=gamefeatures',
		summary:
			'Develop your character, learn spells, explore cities and dungeons, complete quests and join other players in guilds. Create an account to discover the game.',
	},
	{
		id: 'premiumfeatures',
		section: 'about',
		slug: 'premium-features',
		title: 'Premium Features',
		source: 'https://www.tibia.com/abouttibia/?subtopic=premiumfeatures',
		summary:
			'Premium status can unlock additional areas, spells and other game features. Visit the shop to see the options available on this server.',
	},
	{
		id: 'aboutcipsoft',
		section: 'about',
		slug: 'cipsoft',
		title: 'About CipSoft',
		source: 'https://www.tibia.com/abouttibia/?subtopic=aboutcipsoft',
		summary:
			'CipSoft is the developer of Tibia. Visit the company website for information about its games, team and services.',
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
