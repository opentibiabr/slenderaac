import LegboneShell from '$lib/themes/legbone/Shell.svelte';

import type { ComponentType } from 'svelte';

import type { ThemeId } from '$lib/themes/theme-ids';

type ThemeDefinition = {
	Shell: ComponentType;
};

export const themeRegistry = {
	legbone: {
		Shell: LegboneShell,
	},
} satisfies Partial<Record<ThemeId, ThemeDefinition>> & {
	legbone: ThemeDefinition;
};
