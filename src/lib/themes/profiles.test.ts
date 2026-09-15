import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	DEFAULT_THEME_ID,
	isThemeId,
	normalizeTheme,
	themeAssetPack,
	themeIds,
	themeProfiles,
	validateThemeProfiles,
} from './profiles';

void test('theme profiles are the source of truth for built-in IDs', () => {
	assert.deepEqual(themeIds, Object.keys(themeProfiles));
	assert.equal(DEFAULT_THEME_ID, 'legbone');
	assert.deepEqual(themeProfiles.legbone.label, 'Legbone');
	assert.deepEqual(themeProfiles.classic.label, 'Classic');
});

void test('profile asset references point to registered themes', () => {
	assert.doesNotThrow(validateThemeProfiles);
	for (const profile of Object.values(themeProfiles)) {
		for (const source of Object.values(profile.assets)) {
			assert.ok(source === null || isThemeId(source));
		}
	}
	assert.equal(themeAssetPack('classic', 'chromePack'), 'classic');
	assert.equal(themeAssetPack('legbone', 'chromePack'), null);
	assert.equal(themeAssetPack('legbone', 'catalogArtworkPack'), 'classic');
});

void test('theme normalization keeps the safe default for invalid values', () => {
	assert.equal(normalizeTheme(' CLASSIC '), 'classic');
	assert.equal(normalizeTheme('legbone'), 'legbone');
	assert.equal(normalizeTheme('unknown'), DEFAULT_THEME_ID);
	assert.equal(normalizeTheme(undefined), DEFAULT_THEME_ID);
});
