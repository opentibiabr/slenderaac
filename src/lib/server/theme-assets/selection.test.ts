import assert from 'node:assert/strict';
import { test } from 'node:test';

import { layoutLoginHref, layoutSelectionHref } from '$lib/themes/navigation';
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

void test('layout requests override the cookie and leave a clean canonical URL', async () => {
	for (const theme of ['classic', 'legbone'] as const) {
		const result = await resolveThemeSelection(
			{
				configuredTheme: theme === 'classic' ? 'legbone' : 'classic',
				preference: theme === 'classic' ? 'legbone' : 'classic',
				allowSwitching: true,
				url: url(`/characters?layout=${theme}&search=Knight`),
			},
			resolveId,
		);
		assert.deepEqual(result, {
			selectedTheme: theme,
			redirectTo: '/characters?search=Knight',
			preferenceUpdate: theme,
		});
	}
});

void test('clean navigation retains the browser preference and rejects unknown cookies', async () => {
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
		assert.equal(result.preferenceUpdate, undefined);
	}
});

void test('locked selection ignores requests and an existing preference', async () => {
	for (const theme of ['classic', 'legbone'] as const) {
		let selectionResolved = false;
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
				if (value === 'legacy-classic') selectionResolved = true;
				return resolveId(value);
			},
		);
		assert.deepEqual(result, {
			selectedTheme: theme,
			redirectTo: '/highscores?skill=achievements&vocation=2&vocation=3',
			preferenceUpdate: null,
		});
		assert.equal(selectionResolved, false);
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
	assert.deepEqual(result, {
		selectedTheme: 'classic',
		redirectTo: null,
		preferenceUpdate: null,
	});
});

void test('legacy preview URLs update the cookie and canonicalize cleanly', async () => {
	for (const key of ['layout', 'themePreview']) {
		const result = await resolveThemeSelection(
			{
				configuredTheme: 'legbone',
				allowSwitching: true,
				url: url(
					`/highscores?skill=achievements&${key}=legacy-classic&classicGrid=1`,
				),
			},
			resolveId,
		);
		assert.deepEqual(result, {
			selectedTheme: 'classic',
			redirectTo: '/highscores?skill=achievements&classicGrid=1',
			preferenceUpdate: 'classic',
		});
	}
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
		assert.deepEqual(result, {
			selectedTheme: expected,
			redirectTo: '/',
			preferenceUpdate: undefined,
		});
	}
});

void test('switch links preserve page state and use one transient layout parameter', () => {
	const current = url(
		'/highscores?skill=achievements&vocation=2&vocation=3&themePreview=classic&themePreview=classic#results',
	);
	const target = new URL(layoutSelectionHref(current, 'legbone'), current);
	assert.equal(target.pathname, '/highscores');
	assert.equal(target.hash, '#results');
	assert.deepEqual(target.searchParams.getAll('vocation'), ['2', '3']);
	assert.equal(target.searchParams.get('skill'), 'achievements');
	assert.equal(target.searchParams.get('layout'), 'legbone');
	assert.equal(target.searchParams.has('themePreview'), false);
	assert.equal(current.searchParams.get('themePreview'), 'classic');
});

void test('login redirects carry layout state only while a selection is pending', () => {
	assert.equal(
		layoutLoginHref(url('/characters?search=Knight')),
		'/account/login',
	);
	const target = new URL(
		layoutLoginHref(url('/characters?layout=classic&search=Knight')),
		'https://example.test',
	);
	assert.equal(target.pathname, '/account/login');
	assert.equal(target.searchParams.get('layout'), 'classic');
	assert.equal(
		target.searchParams.get('returnTo'),
		'/characters?layout=classic&search=Knight',
	);
});
