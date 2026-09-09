import type { ComponentType } from 'svelte';

import type { ThemeId } from '$lib/themes/theme-ids';
import ClassicShell from '$lib/themes/classic/Shell.svelte';
import LegboneShell from '$lib/themes/legbone/Shell.svelte';

type ThemeDefinition = {
	Shell: ComponentType;
};

export const themeRegistry = {
	legbone: {
		Shell: LegboneShell,
	},
	classic: {
		Shell: ClassicShell,
	},
} satisfies Record<ThemeId, ThemeDefinition>;
