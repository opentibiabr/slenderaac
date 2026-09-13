import { Prisma } from '@prisma/client';

import type { PublicHouse } from '$lib/houses';
import { loadHouseDefinitions } from '$lib/server/catalog';
import { prisma } from '$lib/server/prisma';

type HouseRow = {
	id: number;
	name: string;
	townId: number;
	town: string | null;
	size: number;
	rent: number;
	beds: number;
	ownerId: number;
	owner: string | null;
	paidUntil: number | bigint;
	bid: number;
	bidEnd: number;
};

export async function loadHouses(): Promise<PublicHouse[]> {
	const [columns, definitions] = await Promise.all([
		prisma.$queryRaw<{ name: string }[]>`SELECT COLUMN_NAME AS name
			FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'houses'`,
		loadHouseDefinitions(),
	]);
	const fields = new Set(columns.map((column) => column.name));
	// Current servers can retain obsolete compatibility columns. Prefer their live fields.
	const modern = fields.has('highest_bid') && fields.has('bid_end_date');
	if (!modern && !(fields.has('bid') && fields.has('bid_end')))
		throw new Error('Unsupported house auction schema');
	const auction = modern
		? Prisma.sql`h.highest_bid AS bid, h.bid_end_date AS bidEnd`
		: Prisma.sql`h.bid AS bid, h.bid_end AS bidEnd`;
	const rows = await prisma.$queryRaw<HouseRow[]>(Prisma.sql`
		SELECT h.id, h.name, h.town_id AS townId, t.name AS town,
			h.size, h.rent, h.beds, h.owner AS ownerId, p.name AS owner,
			${fields.has('paid') ? Prisma.sql`h.paid` : Prisma.sql`0`} AS paidUntil, ${auction}
		FROM houses h LEFT JOIN towns t ON t.id = h.town_id
		LEFT JOIN players p ON p.id = h.owner AND p.deletion = 0
		ORDER BY h.name, h.id`);
	const metadata = new Map(definitions.map((house) => [house.id, house]));
	return rows
		.filter((house) => metadata.has(house.id))
		.map((house) => ({
			id: house.id,
			name: house.name,
			townId: house.townId,
			town: house.town ?? `Town ${house.townId}`,
			size: house.size,
			rent: house.rent,
			beds: house.beds,
			owner: house.owner,
			rented: house.ownerId > 0,
			paidUntil: house.ownerId > 0 ? Number(house.paidUntil) : 0,
			bid: house.ownerId > 0 ? 0 : house.bid,
			bidEnd: house.ownerId > 0 ? 0 : house.bidEnd,
			...(metadata.has(house.id)
				? { definition: metadata.get(house.id)! }
				: {}),
		}));
}
