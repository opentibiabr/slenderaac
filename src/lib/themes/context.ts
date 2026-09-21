import { getContext, setContext } from 'svelte';
import { type Readable, type Writable, writable } from 'svelte/store';

import { type ThemeId } from '$lib/themes/profiles';
import {
	type RegisteredThemeDefinition,
	themeDefinition,
} from '$lib/themes/registry';

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
