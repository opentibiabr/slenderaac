import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	configuredSiteLinks,
	screenshotPageHref,
	websiteHref,
} from './site-links';

void test('server-owned destinations have no implicit third-party defaults', () => {
	assert.deepEqual(configuredSiteLinks({}), {
		twitch: null,
		youtube: null,
		facebook: null,
		trailer: null,
	});
	assert.equal(
		configuredSiteLinks({
			PUBLIC_YOUTUBE_URL: 'https://example.org/channel',
			other: 'https://other.example',
		}).youtube,
		'https://example.org/channel',
	);
});

void test('website destinations reject credentials and executable schemes', () => {
	for (const value of [
		undefined,
		'',
		'javascript:alert(1)',
		'//example.org',
		'https://user:password@example.org',
		'data:text/html,test',
	])
		assert.equal(websiteHref(value), null);
	assert.equal(
		websiteHref('https://example.org/path?q=1#section'),
		'https://example.org/path?q=1#section',
	);
});

void test('presentation metadata can select a screenshot but cannot change its destination', () => {
	assert.equal(
		screenshotPageHref(
			'https://external.example/wrong?currentscreenshot=11&other=ignored',
		),
		'/about/screenshots?currentscreenshot=11',
	);
	for (const value of [
		undefined,
		'https://external.example/wrong',
		'//external.example?currentscreenshot=script',
		'/?currentscreenshot=1234567',
	])
		assert.equal(screenshotPageHref(value), '/about/screenshots');
});
