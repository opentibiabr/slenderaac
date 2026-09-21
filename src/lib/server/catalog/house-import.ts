import { parseHouseDefinitions } from '$lib/houses';

/** Import map metadata only; ownership and auction state stay in the database. */
export function importHouseDefinitions(xml: string) {
	const houses = [
		...xml.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<house\b([^>]*)\/?\s*>/g),
	].map((match) => {
		const attributes = Object.fromEntries(
			[...match[1].matchAll(/([a-z]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
				(attribute) => [attribute[1], attribute[2] ?? attribute[3]],
			),
		);
		const number = (key: string) =>
			/^\d+$/.test(attributes[key] ?? '') ? Number(attributes[key]) : NaN;
		if (
			attributes.guildhall !== undefined &&
			!['true', 'false', '1', '0'].includes(attributes.guildhall)
		)
			throw new Error('Invalid house type');
		return {
			id: number('houseid'),
			...(attributes.clientid !== undefined
				? { clientId: number('clientid') }
				: {}),
			...(attributes.beds !== undefined ? { bedCapacity: number('beds') } : {}),
			guildhall: ['true', '1'].includes(attributes.guildhall),
			entry: { x: number('entryx'), y: number('entryy'), z: number('entryz') },
		};
	});
	if (!houses.length) throw new Error('House definitions are empty');
	return parseHouseDefinitions(houses);
}
