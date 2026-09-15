import { featurePages } from '$lib/site-pages';
import { unavailableFeatures, unavailableHref } from '$lib/source-navigation';

const link = (label: string, href: string) => ({ label, href });
const features = (...ids: string[]) =>
	ids.map((id) =>
		link(
			featurePages[id]?.title ?? unavailableFeatures[id],
			unavailableHref(id),
		),
	);

export function siteNavigation(serverName: string, downloadHref = '/download') {
	return {
		news: [
			link('Latest News', '/'),
			link('News Archive', '/news/archive'),
			link('Event Schedule', '/news/event-schedule'),
		],
		about: [
			link(`About ${serverName}`, '/about/server'),
			link('Screenshots', '/about/screenshots'),
			link('Game Features', '/about/game-features'),
			link('Premium Features', '/about/premium-features'),
			link('About OpenTibiaBR', '/about/company'),
		],
		guides: [
			link('Quickstart', '/guides/quickstart'),
			link('Manual', '/guides/manual'),
			link('Security Hints', '/guides/security-hints'),
		],
		library: [
			link('Creatures', '/library/creatures'),
			link('Boostable Bosses', '/library/boostable-bosses'),
			...features(
				'spells',
				'achievements',
				'worldquests',
				'experiencetable',
				'maps',
				'genesis',
				'soundtrack',
			),
		],
		community: [
			link('Characters', '/characters'),
			...features('worlds'),
			link('Highscores', '/highscores'),
			...features(
				'leaderboards',
				'wheelofdestinyplanner',
				'killstatistics',
				'houses',
			),
			link('Guilds', '/guilds'),
			...features('polls', 'feedbackform', 'fansites', 'resellers'),
		],
		forum: features(
			'worldboards',
			'tradeboards',
			'communityboards',
			'supportboards',
			'guildboards',
			'cmpostarchive',
		),
		account: [
			link('Account Management', '/account'),
			link('Create Account', '/account/signup'),
			link('Download Client', downloadHref),
			link('Webshop', '/shop'),
			link('Lost Account', '/account/lost'),
		],
		characterTrade: features(
			'currentcharactertrades',
			'pastcharactertrades',
			'ownbids',
			'owncharactertrades',
			'watchedcharactertrades',
		),
		support: [
			...features('gethelp'),
			link(`${serverName} Rules`, '/pages/rules'),
			...features('parentsguide', 'legaldocuments'),
		],
	};
}
