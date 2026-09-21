import assert from 'node:assert/strict';
import { test } from 'node:test';

import { headlineFontStyle } from './headline';

void test('headline fonts accept only encoded local font assets', () => {
	assert.match(
		headlineFontStyle('/theme-assets/classic/fonts/headline.ttf?v=abc123'),
		/font-family:ClassicHeadline/,
	);
	assert.match(
		headlineFontStyle(
			'/theme-assets/classic/fonts/menu.ttf?v=abc123',
			'ClassicMenu',
		),
		/font-family:ClassicMenu/,
	);
	for (const value of [
		undefined,
		'https://example.org/font.ttf',
		'/theme-assets/classic/font.gif',
		'/theme-assets/classic/font.ttf?v="></style><script>',
		'/theme-assets/classic/font.ttf\n',
	]) {
		assert.equal(headlineFontStyle(value), '');
	}
});
