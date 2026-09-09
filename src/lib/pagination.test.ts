import assert from 'node:assert/strict';
import { test } from 'node:test';

import { paginationPages } from './pagination';

void test('small and empty rankings expose their actual pages without duplicate links', () => {
	assert.deepEqual(paginationPages(1, 0), [1]);
	assert.deepEqual(paginationPages(2, 3), [1, 2, 3]);
	assert.deepEqual(
		paginationPages(20, 20),
		Array.from({ length: 20 }, (_, i) => i + 1),
	);
});
void test('large rankings bound the link window while retaining the selected, first and last pages', () => {
	for (const page of [1, 2, 10, 50, 98, 100]) {
		const links = paginationPages(page, 100);
		const numbers = links.filter((n): n is number => n !== null);
		assert.equal(numbers[0], 1);
		assert.equal(numbers.at(-1), 100);
		assert.ok(numbers.includes(page));
		assert.ok(links.length <= 13);
		assert.equal(new Set(numbers).size, numbers.length);
		assert.deepEqual(
			numbers,
			[...numbers].sort((a, b) => a - b),
		);
	}
});
