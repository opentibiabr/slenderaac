import type { ComponentType } from 'svelte';

import type { ThemeId } from '$lib/themes/theme-ids';
import CipSlenderShell from '$lib/themes/cip-slender/Shell.svelte';
import LegboneShell from '$lib/themes/legbone/Shell.svelte';

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
