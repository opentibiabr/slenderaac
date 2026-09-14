import { getContext, setContext } from 'svelte';
import { writable, type Readable, type Writable } from 'svelte/store';

import {
	themeDefinition,
	type RegisteredThemeDefinition,
} from '$lib/themes/registry';
import { type ThemeId } from '$lib/themes/profiles';

const THEME_CONTEXT = Symbol('slender-theme');

export type ThemeStore = Writable<RegisteredThemeDefinition>;

export function createThemeContext(theme: ThemeId): ThemeStore {
	const store = writable(themeDefinition(theme));
	setContext(THEME_CONTEXT, store);
	return store;
}

export function getThemeContext(): Readable<RegisteredThemeDefinition> {
	const store = getContext<Readable<RegisteredThemeDefinition>>(THEME_CONTEXT);
	if (!store) {
		throw new Error('Theme context is not available in this component tree');
	}
	return store;
}
