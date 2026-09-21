import test from 'node:test';
import assert from 'node:assert/strict';

import { scanSource } from './check-themes.mjs';

test('accepts profile-driven presentation and semantic surface classes', () => {
	assert.deepEqual(
		scanSource(
			'src/routes/(app)/example/+page.svelte',
			`$theme.profile.presentation.pageSurface === 'ornate'\n.layout-surface-ornate .panel {}`,
		),
		[],
	);
});

test('rejects concrete theme comparisons', () => {
	const violations = scanSource(
		'src/routes/(app)/example/+page.svelte',
		`if (selectedTheme === 'classic') {}`,
	);
	assert.deepEqual(
		violations.map(({ rule }) => rule),
		['concrete-theme-comparison'],
	);
});

test('rejects implementation imports outside the theme subsystem', () => {
	const violations = scanSource(
		'src/lib/components/example.svelte',
		`import ClassicShell from '$lib/themes/classic/Shell.svelte';`,
	);
	assert.deepEqual(
		violations.map(({ rule }) => rule),
		['theme-implementation-import'],
	);
});

test('rejects theme-named selectors outside the theme subsystem', () => {
	const violations = scanSource(
		'src/lib/components/example.svelte',
		`:global(.theme-legbone) .panel {}`,
	);
	assert.deepEqual(
		violations.map(({ rule }) => rule),
		['theme-named-selector'],
	);
});

test('allows concrete implementation details inside a theme directory', () => {
	assert.deepEqual(
		scanSource(
			'src/lib/themes/classic/Shell.svelte',
			`if (selectedTheme === 'classic') {}\n.theme-classic .panel {}`,
		),
		[],
	);
});
