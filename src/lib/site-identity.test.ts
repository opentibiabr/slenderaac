import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	serverMarkupText,
	serverText,
	serverTextAttributes,
} from './site-identity';

void test('server identity expands display tokens once without interpreting replacement text', () => {
	const identity = {
		name: 'A&B $& {{serverWebsite}}',
		website: 'https://game.example',
	};
	assert.equal(
		serverText(
			'About {{serverName}}. Visit {{serverWebsite}}. OpenTibiaBR.',
			identity,
		),
		'About A&B $& {{serverWebsite}}. Visit https://game.example. OpenTibiaBR.',
	);
});

void test('configuration cannot introduce markup into rendered articles', () => {
	assert.equal(
		serverMarkupText('Play {{serverName}} &amp; friends', {
			name: '<img src=x onerror=alert(1)>',
			website: 'https://game.example',
		}),
		'Play &lt;img src=x onerror=alert(1)&gt; &amp; friends',
	);
});

void test('server identity leaves link destinations and anchors unchanged', () => {
	const attrs = {
		title: 'Play {{serverName}}',
		alt: '{{serverName}} account',
		'tooltip-text': 'Only sign in at {{serverWebsite}}',
		href: '/manual?section={{serverName}}#original-anchor',
		id: 'original-anchor',
		src: '/theme-assets/classic/label.png',
	};
	const result = serverTextAttributes(attrs, {
		name: 'Canary',
		website: 'https://game.example',
	});
	assert.equal(result.title, 'Play Canary');
	assert.equal(result.alt, 'Canary account');
	assert.equal(result['tooltip-text'], 'Only sign in at https://game.example');
	assert.equal(result.href, attrs.href);
	assert.equal(result.id, attrs.id);
	assert.equal(result.src, attrs.src);
	assert.equal(attrs.title, 'Play {{serverName}}');
});
