import assert from 'node:assert/strict';
import { test } from 'node:test';

import { catalogDisplayText } from './display-text';

void test('catalog display replacements match whole names once and keep proper names intact', () => {
	const text = catalogDisplayText({
		'Old Realm': '{{serverName}}',
		Heroes: '{{serverName}} players',
		'C++': 'language',
		'{{serverName}}': 'second replacement',
	});
	assert.equal(
		text('old realm has HEROES, and Heroesville uses C++.'),
		'{{serverName}} has {{serverName}} players, and Heroesville uses language.',
	);
	assert.throws(
		() => catalogDisplayText({ Realm: 'One', realm: 'Two' }),
		/duplicate/,
	);
	assert.throws(() => catalogDisplayText({ Realm: 123 }), /Invalid/);
});
