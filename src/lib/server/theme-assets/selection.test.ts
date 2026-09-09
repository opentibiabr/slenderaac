import assert from 'node:assert/strict';
import { test } from 'node:test';

import { themeSelectionHref } from '$lib/themes/preview';
import { isThemeId, type ThemeId } from '$lib/themes/theme-ids';

import { isThemeSwitchingEnabled, resolveThemeSelection } from './selection';

const resolveId = (value: unknown): Promise<ThemeId | null> =>
	Promise.resolve(
		isThemeId(value) ? value : value === 'legacy-classic' ? 'classic' : null,
	);
const url = (path: string) => new URL(path, 'https://example.test');

void test('switching defaults to enabled and an invalid explicit flag fails closed', () => {
	for (const value of [undefined, '', ' ', 'true', ' TRUE '])
		assert.equal(isThemeSwitchingEnabled(value), true);
	for (const value of ['false', ' FALSE ', '0', 'tru'])
		assert.equal(isThemeSwitchingEnabled(value), false);
});

void test('explicit selection overrides the session preference and server default', async () => {
	for (const theme of ['classic', 'legbone'] as const) {
		const result = await resolveThemeSelection(
			{
				configuredTheme: theme === 'classic' ? 'legbone' : 'classic',
				preference: theme === 'classic' ? 'legbone' : 'classic',
				allowSwitching: true,
				url: url(`/characters?themePreview=${theme}`),
			},
			resolveId,
		);
		assert.deepEqual(result, { selectedTheme: theme, redirectTo: null });
	}
});

void test('navigation without preview retains the browser preference and rejects unknown cookies', async () => {
	for (const [preference, expected] of [
		['classic', 'classic'],
		['invalid', 'legbone'],
		[undefined, 'legbone'],
	] as const) {
		const result = await resolveThemeSelection(
			{
				configuredTheme: 'legbone',
				preference,
				allowSwitching: true,
				url: url('/characters?search=Knight'),
			},
			resolveId,
		);
		assert.equal(result.selectedTheme, expected);
		assert.equal(result.redirectTo, null);
	}
});

void test('locked selection ignores both a valid preview and an existing preference', async () => {
	for (const theme of ['classic', 'legbone'] as const) {
		let previewResolved = false;
		const result = await resolveThemeSelection(
			{
				configuredTheme: theme,
				allowSwitching: false,
				preference: theme === 'classic' ? 'legbone' : 'classic',
				url: url(
					'/highscores?skill=achievements&themePreview=legacy-classic&classicGrid=1&classicReference=1&classicDemo=1&vocation=2&vocation=3',
				),
			},
			async (value) => {
				if (value === 'legacy-classic') previewResolved = true;
				return resolveId(value);
			},
		);
		assert.deepEqual(result, {
			selectedTheme: theme,
			redirectTo: '/highscores?skill=achievements&vocation=2&vocation=3',
		});
		assert.equal(previewResolved, false);
	}
});

void test('locked clean URLs do not redirect and configured aliases still resolve', async () => {
	const result = await resolveThemeSelection(
		{
			configuredTheme: 'legacy-classic',
			allowSwitching: false,
			url: url('/characters'),
		},
		resolveId,
	);
	assert.deepEqual(result, { selectedTheme: 'classic', redirectTo: null });
});

void test('preview aliases canonicalize without losing page filters', async () => {
	const result = await resolveThemeSelection(
		{
			configuredTheme: 'legbone',
			allowSwitching: true,
			url: url('/highscores?skill=achievements&themePreview=legacy-classic'),
		},
		resolveId,
	);
	assert.deepEqual(result, {
		selectedTheme: 'classic',
		redirectTo: '/highscores?skill=achievements&themePreview=classic',
	});
});

void test('invalid theme values retain safe fallback behavior', async () => {
	for (const [configuredTheme, expected] of [
		[' CLASSIC ', 'classic'],
		[undefined, 'legbone'],
		['unknown', 'legbone'],
	] as const) {
		const result = await resolveThemeSelection(
			{
				configuredTheme,
				allowSwitching: true,
				url: url('/?themePreview=unknown'),
			},
			resolveId,
		);
		assert.deepEqual(result, { selectedTheme: expected, redirectTo: null });
	}
});

void test('switch links preserve route, duplicate filters and fragment while replacing the theme', () => {
	const current = url(
		'/highscores?skill=achievements&vocation=2&vocation=3&themePreview=classic&themePreview=classic#results',
	);
	const target = new URL(themeSelectionHref(current, 'legbone'), current);
	assert.equal(target.pathname, '/highscores');
	assert.equal(target.hash, '#results');
	assert.deepEqual(target.searchParams.getAll('vocation'), ['2', '3']);
	assert.equal(target.searchParams.get('skill'), 'achievements');
	assert.deepEqual(target.searchParams.getAll('themePreview'), ['legbone']);
	assert.equal(current.searchParams.get('themePreview'), 'classic');
});
