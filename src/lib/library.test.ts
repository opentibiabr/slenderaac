import assert from 'node:assert/strict';
import { test } from 'node:test';

import type {
	InformationNode,
	InformationPresentation,
} from './information-content';
import { libraryEntries, libraryPortraitForName } from './library';

const image: InformationNode = {
	tag: 'img',
	attrs: { src: '/theme-assets/classic/test.gif' },
	children: [],
};
function catalog(children: InformationNode[]): InformationPresentation {
	return {
		version: 1,
		id: 'catalog',
		headline: { src: '', width: 250, height: 28 },
		body: [{ tag: 'div', attrs: { class: 'CreatureEntry' }, children }],
	};
}

void test('unlinked catalog portraits remain usable without inventing detail links', () => {
	const document = catalog([image, 'Example Boss']);
	assert.deepEqual(libraryEntries(document), []);
	assert.equal(
		libraryPortraitForName(document, 'example boss'),
		'/theme-assets/classic/test.gif',
	);
	assert.equal(libraryPortraitForName(document, 'Unknown Boss'), null);
});

void test('creature entries retain valid races and reject malformed linked cards', () => {
	const linked = (href: string) =>
		catalog([
			{ tag: 'a', attrs: { href }, children: [image] },
			'Example Creature',
		]);
	const document = linked('/library/creatures?race=example_creature');
	assert.deepEqual(libraryEntries(document), [
		{
			race: 'example_creature',
			name: 'Example Creature',
			image: '/theme-assets/classic/test.gif',
		},
	]);
	assert.equal(
		libraryPortraitForName(document, 'Example Creature'),
		'/theme-assets/classic/test.gif',
	);
	for (const href of [
		'http://[invalid',
		'/library/creatures',
		'/library/creatures?race=../boss',
	]) {
		assert.deepEqual(libraryEntries(linked(href)), []);
	}
});
