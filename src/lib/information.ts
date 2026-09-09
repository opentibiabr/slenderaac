import {
	isReferenceWebsite,
	referenceSiteDestination,
} from './source-navigation';

export type InformationSection = 'about' | 'guides' | 'library';

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
		id: 'creatures',
		section: 'library',
		slug: 'creatures',
		title: 'Creatures',
		source: 'https://www.tibia.com/library/?subtopic=creatures',
		summary: 'No creatures have been added to this server’s library yet.',
	},
	{
		id: 'boostablebosses',
		section: 'library',
		slug: 'boostable-bosses',
		title: 'Boostable Bosses',
		source: 'https://www.tibia.com/library/?subtopic=boostablebosses',
		summary: 'No bosses have been added to this server’s library yet.',
	},
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
		id: 'company',
		section: 'about',
		slug: 'company',
		title: 'About the Server',
		source: 'https://www.tibia.com/abouttibia/',
		summary:
			'Learn about this server, its team and the services available to players.',
	},
	{
		id: 'quickstart',
		section: 'guides',
		slug: 'quickstart',
		title: 'Quickstart',
		minimumBodyWidth: 1020,
		source: 'https://www.tibia.com/gameguides/?subtopic=quickstart',
		summary:
			'Create an account, download the configured game client and choose your character. Follow the in-game introduction to learn movement, combat and communication.',
	},
	{
		id: 'manual',
		section: 'guides',
		slug: 'manual',
		title: 'Manual',
		source: 'https://www.tibia.com/gameguides/?subtopic=manual',
		summary:
			'Use the game manual to learn about the interface, characters, combat, communication and account features. Server-specific settings may change the available features.',
	},
	{
		id: 'securityhints',
		section: 'guides',
		slug: 'security-hints',
		title: 'Security Hints',
		source: 'https://www.tibia.com/gameguides/?subtopic=securityhints',
		summary:
			'Keep your account credentials private, choose a unique password and protect your email account. Use the account security options available on this server and keep your devices updated.',
	},
];

export const manualSections = [
	'introduction',
	'starting',
	'interface',
	'controls',
	'controls_communication',
	'controls_trading',
	'characters',
	'world',
	'combat',
	'magic',
	'quests',
	'achievements',
	'houses',
	'guilds',
	'store',
	'products',
	'accounts',
	'support',
	'forum',
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
export function informationDestination(
	href: string,
	downloadHref?: string,
): string {
	let url: URL;
	try {
		url = new URL(href, 'https://slender.invalid');
	} catch {
		return href;
	}
	if (!isReferenceWebsite(url)) return href;
	const page = informationPages.find((entry) => {
		const source = new URL(entry.source);
		return (
			source.pathname.replace(/\/$/, '') === url.pathname.replace(/\/$/, '') &&
			source.searchParams.get('subtopic') === url.searchParams.get('subtopic')
		);
	});
	if (!page) return referenceSiteDestination(url, downloadHref);
	url.searchParams.delete('subtopic');
	return `${informationPath(page)}${url.search}${url.hash}`;
}
