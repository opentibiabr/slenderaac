import assert from 'node:assert/strict';
import { test } from 'node:test';

import { outfitFrameData } from './outfit-animation';

void test('optional outfit frames reject malformed responses without exposing remote or invalid images', () => {
	const valid = { image: 'data:image/png;base64,AA==', duration: 100 };
	assert.deepEqual(outfitFrameData({ frames: [valid] }), [valid]);
	for (const value of [
		null,
		{},
		{ frames: 'invalid' },
		{ frames: [null] },
		{ frames: [{ ...valid, duration: 0 }] },
		{ frames: [{ ...valid, duration: NaN }] },
		{ frames: [{ ...valid, image: 'https://example.invalid/image.png' }] },
		{ frames: Array(129).fill(valid) },
	])
		assert.deepEqual(outfitFrameData(value), []);
});
