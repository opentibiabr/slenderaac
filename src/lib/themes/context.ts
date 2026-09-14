import { getContext, setContext } from 'svelte';
import { writable, type Readable, type Writable } from 'svelte/store';

import { themeDefinition, type ThemeDefinition } from '$lib/themes/registry';
import { type ThemeId } from '$lib/themes/profiles';

const THEME_CONTEXT = Symbol('slender-theme');

export type ThemeStore = Writable<ThemeDefinition>;

export function createThemeContext(theme: ThemeId): ThemeStore {
	const store = writable(themeDefinition(theme));
	setContext(THEME_CONTEXT, store);
	return store;
}

export function getThemeContext(): Readable<ThemeDefinition> {
	const store = getContext<Readable<ThemeDefinition>>(THEME_CONTEXT);
	if (!store) {
		throw new Error('Theme context is not available in this component tree');
	}
	return store;
}
