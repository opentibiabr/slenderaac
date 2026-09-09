import { featurePages } from './site-pages';

/** Reference websites supply presentation data, never application destinations. */
export function isReferenceWebsite(url: URL): boolean {
	const hostname = url.hostname.replace(/\.$/, '');
	return ['tibia.com'].some(
		(domain) => hostname === domain || hostname.endsWith(`.${domain}`),
	);
}

export const unavailableFeatures: Record<string, string> = {
	library: 'Library',
	spells: 'Spells',
	achievements: 'Achievements',
	worldquests: 'World Quests',
	maps: 'Maps',
	genesis: 'Genesis',
	soundtrack: 'Soundtrack',
	leaderboards: 'Leaderboards',
	wheelofdestinyplanner: 'Wheel of Destiny Planner',
	killstatistics: 'Kill Statistics',
	houses: 'Houses',
	polls: 'Polls',
	feedbackform: 'Feedback Form',
	fansites: 'Fansites',
	resellers: 'Resellers',
	forum: 'Forum',
	worldboards: 'World Boards',
	tradeboards: 'Trade Boards',
	communityboards: 'Community Boards',
	supportboards: 'Support Boards',
	guildboards: 'Guild Boards',
	fankit: 'Fankit',
	currentcharactertrades: 'Current Auctions',
	pastcharactertrades: 'Auction History',
	ownbids: 'My Bids',
	owncharactertrades: 'My Auctions',
	watchedcharactertrades: 'My Watched Auctions',
	gethelp: 'Get Help',
	parentsguide: "Parents' Guide",
	legaldocuments: 'Legal Documents',
	agreement: 'Service Agreement',
	privacy: 'Privacy Policy',
	resource: 'Resource',
};

export function unavailableHref(feature: string): string {
	if (Object.hasOwn(featurePages, feature)) return featurePages[feature].path;
	return `/unavailable?feature=${Object.hasOwn(unavailableFeatures, feature) ? feature : 'resource'}`;
}

export function referenceSiteDestination(
	url: URL,
	downloadHref?: string,
): string {
	const section = url.pathname.split('/').filter(Boolean)[0] ?? '';
	const subtopic = url.searchParams.get('subtopic') ?? '';
	const path = (pathname: string, keys: string[] = []) => {
		const query = new URLSearchParams();
		for (const key of keys) {
			const value = url.searchParams.get(key);
			if (value !== null) query.set(key, value);
		}
		return `${pathname}${query.size ? `?${query.toString()}` : ''}${url.hash}`;
	};
	if (section === '' || section === 'mmorpg') return '/';
	if (section === 'news') {
		if (subtopic === 'newsarchive') return path('/news/archive');
		if (subtopic === 'eventcalendar') return path('/news/event-schedule');
		return '/';
	}
	if (
		section === 'library' &&
		['creatures', 'boostablebosses'].includes(subtopic)
	)
		return path(
			`/library/${subtopic === 'creatures' ? 'creatures' : 'boostable-bosses'}`,
			['race'],
		);
	if (section === 'account') {
		if (subtopic === 'createaccount') return '/account/signup';
		if (subtopic === 'downloadclient') {
			if (downloadHref) {
				try {
					const target = new URL(downloadHref, 'https://slender.invalid');
					if (
						['http:', 'https:'].includes(target.protocol) &&
						!isReferenceWebsite(target)
					)
						return downloadHref;
				} catch {
					/* Use the local download page for an invalid destination. */
				}
			}
			return '/download';
		}
		if (subtopic === 'lostaccount') return '/account/lost';
		if (subtopic === 'redirectlogin') return '/shop';
		return '/account';
	}
	if (section === 'community') {
		if (subtopic === 'characters') {
			const name = url.searchParams.get('name');
			return name ? `/characters/${encodeURIComponent(name)}` : '/characters';
		}
		if (subtopic === 'worlds') return '/online';
		if (subtopic === 'highscores') return '/highscores';
		if (subtopic === 'guilds') return '/guilds';
	}
	if (section === 'support' && subtopic === 'tibiarules') return '/pages/rules';
	if (section === 'support' && subtopic === 'legaldocuments')
		return unavailableHref(url.searchParams.get('page') ?? subtopic);
	if (section === 'forum' && url.searchParams.get('announcementid') === '87')
		return unavailableHref('fankit');
	return unavailableHref(subtopic || section);
}
