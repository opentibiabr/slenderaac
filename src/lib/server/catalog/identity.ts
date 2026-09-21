export function catalogSlug(name: string) {
	return name
		.normalize('NFKD')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');
}
