import {
	directoryDetails,
	type DirectoryKind,
	type DirectoryRecord,
} from '$lib/directories';
import { prisma } from '$lib/server/prisma';

const publicSelect = {
	id: true,
	kind: true,
	name: true,
	url: true,
	description: true,
	promoted: true,
	featured: true,
	details: true,
} as const;

export async function loadDirectory(
	kind: DirectoryKind,
): Promise<DirectoryRecord[]> {
	const entries = await prisma.directoryEntry.findMany({
		where: { kind, published: true },
		select: publicSelect,
		orderBy: [{ promoted: 'desc' }, { name: 'asc' }, { id: 'asc' }],
	});
	const publicEntries = entries.map((entry) => ({
		...entry,
		details: directoryDetails(entry.details),
	}));
	const names = publicEntries
		.map((entry) => entry.details.contactCharacter)
		.filter(Boolean);
	const players = names.length
		? await prisma.players.findMany({
				where: { name: { in: names }, deletion: 0 },
				select: { name: true },
			})
		: [];
	const contacts = new Set(players.map((player) => player.name.toLowerCase()));
	return publicEntries.map((entry) => ({
		...entry,
		contactExists: contacts.has(entry.details.contactCharacter.toLowerCase()),
	}));
}

export async function featuredFansite() {
	const entry = await prisma.directoryEntry.findFirst({
		where: { kind: 'fansite', published: true, featured: true },
		select: publicSelect,
		orderBy: [{ promoted: 'desc' }, { name: 'asc' }, { id: 'asc' }],
	});
	return entry
		? {
				id: entry.id,
				name: entry.name,
				url: entry.url,
				logoAsset: directoryDetails(entry.details).logoAsset,
			}
		: null;
}

export async function checkDirectoryCharacter(name: string) {
	if (!name) return true;
	const player = await prisma.players.findFirst({
		where: { name, deletion: 0 },
		select: { id: true },
	});
	return !!player;
}
