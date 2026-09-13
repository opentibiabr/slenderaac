import type { ComponentType } from 'svelte';

import type { ThemeId } from '$lib/themes/theme-ids';
import ClassicShell from '$lib/themes/classic/Shell.svelte';
import LegboneShell from '$lib/themes/legbone/Shell.svelte';

type ThemeDefinition = {
	name: string;
	Shell: ComponentType;
};

export const themeRegistry = {
	legbone: {
		name: 'Legbone',
		Shell: LegboneShell,
	},
	classic: {
		name: 'Classic',
		Shell: ClassicShell,
	},
} satisfies Record<ThemeId, ThemeDefinition>;
