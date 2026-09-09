import assert from 'node:assert/strict';
import { test } from 'node:test';

import { informationDestination } from './information';
import { isReferenceWebsite } from './source-navigation';
import { themePreviewHref } from './themes/preview';

const current = new URL(
	'https://aac.example/guides/quickstart?themePreview=cip-slender&cipReference=1&cipGrid=1&cipDemo=1',
);

void test('creature list and detail links stay local with their selected race and preview', () => {
	for (const source of [
		'https://www.tibia.com',
		'http://tibia.com',
		'//www.tibia.com',
		'https://www.tibia.com.',
	]) {
		const target = new URL(
			themePreviewHref(
				current,
				`${source}/library/?subtopic=creatures&race=acidblob#details`,
			),
			current,
		);
		assert.equal(target.origin, current.origin);
		assert.equal(target.pathname, '/library/creatures');
		assert.equal(target.searchParams.get('race'), 'acidblob');
		assert.equal(target.hash, '#details');
		for (const [key, value] of current.searchParams)
			assert.equal(target.searchParams.get(key), value);
	}
});

void test('unknown reference features never fall through to their source website', () => {
	for (const family of [
		'library',
		'forum',
		'community',
		'charactertrade',
		'support',
		'future-module',
	]) {
		const target = new URL(
			themePreviewHref(
				current,
				`https://www.tibia.com/${family}/?subtopic=future-feature&redirect=https://www.tibia.com/`,
			),
			current,
		);
		assert.equal(target.origin, current.origin);
		assert.equal(target.pathname, '/unavailable');
		assert.equal(target.searchParams.get('feature'), 'resource');
		assert.equal(target.searchParams.get('redirect'), null);
	}
});

void test('account, payment and recovery references use existing local flows', () => {
	assert.equal(
		informationDestination(
			'https://www.tibia.com/account/?subtopic=createaccount',
		),
		'/account/signup',
	);
	assert.equal(
		informationDestination(
			'https://www.tibia.com/account/?subtopic=lostaccount',
		),
		'/account/lost',
	);
	assert.equal(
		informationDestination(
			'https://www.tibia.com/account/index.php?subtopic=redirectlogin&redirect=https://www.tibia.com/account/',
		),
		'/shop',
	);
	assert.equal(
		informationDestination(
			'https://www.tibia.com/community/?subtopic=characters&name=A%26B',
		),
		'/characters/A%26B',
	);
});

void test('existing information chapters and image selection retain queries and fragments', () => {
	assert.equal(
		informationDestination(
			'https://www.tibia.com/gameguides/?subtopic=manual&section=controls#move',
		),
		'/guides/manual?section=controls#move',
	);
	assert.equal(
		informationDestination(
			'https://www.tibia.com/abouttibia/?subtopic=screenshots&currentscreenshot=11',
		),
		'/about/screenshots?currentscreenshot=11',
	);
});

void test('downloads use configured services and never fall back to the official client', () => {
	const source = 'https://www.tibia.com/account/?subtopic=downloadclient';
	assert.equal(informationDestination(source), '/download');
	assert.equal(
		informationDestination(source, 'javascript:alert(1)'),
		'/download',
	);
	assert.equal(informationDestination(source, '/client.zip'), '/client.zip');
	assert.equal(
		informationDestination(source, 'https://downloads.example/client.zip'),
		'https://downloads.example/client.zip',
	);
	assert.equal(
		informationDestination(
			source,
			'https://www.tibia.com/account/?subtopic=downloadclient',
		),
		'/download',
	);
});

void test('social, configured external and ordinary local navigation preserve their destinations', () => {
	for (const href of [
		'https://www.youtube.com/@cipsoft',
		'https://www.facebook.com/tibia',
		'https://downloads.example/client.zip',
	])
		assert.equal(themePreviewHref(current, href), href);
	assert.equal(
		themePreviewHref(new URL('https://aac.example/'), '/characters'),
		'/characters',
	);
	assert.equal(
		themePreviewHref(current, '/guilds?name=test').startsWith(
			'/guilds?name=test&',
		),
		true,
	);
});

void test('source host detection handles aliases without matching unrelated hostnames', () => {
	assert.equal(isReferenceWebsite(new URL('https://secure.tibia.com/')), true);
	assert.equal(isReferenceWebsite(new URL('https://www.tibia.com./')), true);
	assert.equal(
		isReferenceWebsite(new URL('https://tibia.com.example/')),
		false,
	);
	assert.equal(
		informationDestination('https://www.cipsoft.com/en/'),
		'/about/cipsoft',
	);
});
