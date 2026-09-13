/** Build a font-face rule only from an encoded local font asset URL. */
export function headlineFontStyle(
	value: unknown,
	family: 'ClassicHeadline' | 'ClassicMenu' = 'ClassicHeadline',
): string {
	if (
		typeof value !== 'string' ||
		!/^\/theme-assets\/classic\/(?:[a-zA-Z0-9._~!$&()+,;=:@%-]+\/)*[a-zA-Z0-9._~!$&()+,;=:@%-]+\.ttf(?:\?v=[a-zA-Z0-9._~!$&()+,;=:@%-]+)?$/.test(
			value,
		)
	)
		return '';
	return `@font-face{font-family:${family};src:url("${value}") format("truetype");font-style:normal;font-weight:400;font-display:swap;}`;
}
