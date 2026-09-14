import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	themeRegistry,
	type ThemeComponents,
	type ThemeDefinition,
} from './registry';
import { themeProfiles, type ThemeProfile } from './profiles';

const contractFixture: ThemeDefinition = {
	profile: {
		...themeProfiles.legbone,
		label: 'Contract Fixture',
	} satisfies ThemeProfile,
	components: {
		...themeRegistry.legbone.components,
	},
};

// @ts-expect-error every renderer is required by the contract
const incompleteComponents: ThemeComponents = {
	PagePanel: themeRegistry.legbone.components.PagePanel,
};

void test('a third theme can reuse a complete renderer map explicitly', () => {
	assert.equal(contractFixture.profile.label, 'Contract Fixture');
	assert.equal(
		contractFixture.components.PagePanel,
		themeRegistry.legbone.components.PagePanel,
	);
	assert.equal(
		incompleteComponents.PagePanel,
		themeRegistry.legbone.components.PagePanel,
	);
});
