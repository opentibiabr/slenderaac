import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (value) =>
	value === 'about' || value === 'guides' || value === 'library';
