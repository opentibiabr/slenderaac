import assert from 'node:assert/strict';
import { test } from 'node:test';

import { classicLayoutForPath } from './layout';
import { classicNativePage } from './native-pages';

void test('future routes inherit the shared native content treatment', () => {
	assert.equal(classicLayoutForPath('/library/future-page/'), 'compact');
	const page = classicNativePage('/library/future-page/');
	assert.ok(page);
	assert.equal(page.headline, '');
	assert.equal(page.paperMinHeight, 387);
	assert.equal(page.headlineWidth, undefined);
	assert.equal(page.headlineHeight, undefined);
});

void test('specialized news and information pages preserve their content ownership', () => {
	for (const path of [
		'/',
		'/news/archive',
		'/news/event-schedule',
		'/guides/manual',
		'/about/server',
	])
		assert.equal(classicNativePage(path), null, path);
	assert.equal(classicLayoutForPath('/'), 'news');
	assert.equal(classicLayoutForPath('/news/archive/'), 'compact');
	assert.equal(classicLayoutForPath('/news/event-schedule'), 'compact-wide');
	assert.equal(
		classicNativePage('/characters/')?.headline,
		'headlineCharacters',
	);
	assert.equal(
		classicNativePage('/account/signup/')?.headline,
		'headlineCreateAccount',
	);
});
