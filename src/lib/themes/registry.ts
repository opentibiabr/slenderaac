import LegboneShell from '$lib/themes/legbone/Shell.svelte';
import CipSlenderShell from '$lib/themes/cip-slender/Shell.svelte';

import type { ComponentType } from 'svelte';

import type { ThemeId } from '$lib/themes/theme-ids';

type ThemeDefinition = {
	Shell: ComponentType;
};

export const themeRegistry = {
	legbone: {
		Shell: LegboneShell,
	},
	'cip-slender': {
		Shell: CipSlenderShell,
	},
} satisfies Record<ThemeId, ThemeDefinition>;
