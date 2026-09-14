import type { ComponentType } from 'svelte';

import ClassicShell from '$lib/themes/classic/Shell.svelte';
import LegboneShell from '$lib/themes/legbone/Shell.svelte';
import {
	themeProfiles,
	type ThemeId,
	type ThemeProfile,
} from '$lib/themes/profiles';


export type ThemeDefinition = {
	id: ThemeId;
	name: string;
	profile: ThemeProfile;
	Shell: ComponentType;
};

export const themeRegistry = {
	legbone: {
		id: 'legbone',
		name: themeProfiles.legbone.label,
		profile: themeProfiles.legbone,
		Shell: LegboneShell,
	},
	classic: {
		id: 'classic',
		name: themeProfiles.classic.label,
		profile: themeProfiles.classic,
		Shell: ClassicShell,
	},
} satisfies Record<ThemeId, ThemeDefinition>;

export function themeDefinition(theme: ThemeId): ThemeDefinition {
	return themeRegistry[theme];
}
