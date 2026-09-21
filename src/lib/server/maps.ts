import fs from 'node:fs/promises';
import path from 'node:path';

import type { ServedFile } from '$lib/server/file-response';
import { localMediaFile, resolveLocalMediaRoot } from '$lib/server/local-media';

export type MapPlace = {
	id: string;
	name: string;
	description: string | null;
	x: number | null;
	y: number | null;
	image: ServedFile | null;
};

export type MapGroup = {
	label: string | null;
	places: MapPlace[];
};

export type MapSection = {
	title: string;
	groups: MapGroup[];
};

export type MapCatalog = {
	overview: ServedFile | null;
	highResolution: ServedFile | null;
	sections: MapSection[];
};

type ManifestPlace = Omit<MapPlace, 'description' | 'image'> & {
	description?: string;
	image?: string;
};

type ManifestGroup = {
	label?: string;
	places: ManifestPlace[];
};

type ManifestSection = {
	title: string;
	groups: ManifestGroup[];
};

type Manifest = {
	version: 1;
	overview: string;
	highResolution?: string;
	sections: ManifestSection[];
};

const imageTypes: Record<string, string> = {
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, maximum: number): string | null {
	return typeof value === 'string' &&
		value.trim().length > 0 &&
		value.length <= maximum
		? value.trim()
		: null;
}

function coordinate(value: unknown): number | null {
	return typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= 0 &&
		value <= 100
		? value
		: null;
}

function parseManifest(value: unknown): Manifest | null {
	if (
		!isRecord(value) ||
		value.version !== 1 ||
		!text(value.overview, 240) ||
		(value.highResolution !== undefined && !text(value.highResolution, 240)) ||
		!Array.isArray(value.sections) ||
		value.sections.length > 30
	)
		return null;

	const ids = new Set<string>();
	let placeCount = 0;
	const sections: ManifestSection[] = [];
	for (const section of value.sections) {
		if (
			!isRecord(section) ||
			!text(section.title, 80) ||
			!Array.isArray(section.groups) ||
			section.groups.length > 20
		)
			return null;
		const groups: ManifestGroup[] = [];
		for (const group of section.groups) {
			if (
				!isRecord(group) ||
				(group.label !== undefined && !text(group.label, 80)) ||
				!Array.isArray(group.places)
			)
				return null;
			const places: ManifestPlace[] = [];
			for (const place of group.places) {
				placeCount += 1;
				if (
					placeCount > 250 ||
					!isRecord(place) ||
					typeof place.id !== 'string' ||
					!/^[a-z0-9][a-z0-9-]{0,63}$/.test(place.id) ||
					ids.has(place.id) ||
					!text(place.name, 120) ||
					(place.description !== undefined && !text(place.description, 2000)) ||
					(place.image !== undefined && !text(place.image, 240))
				)
					return null;
				const x = coordinate(place.x);
				const y = coordinate(place.y);
				if (
					(place.x !== undefined || place.y !== undefined) &&
					(x === null || y === null)
				)
					return null;
				ids.add(place.id);
				places.push({
					id: place.id,
					name: text(place.name, 120)!,
					description:
						place.description === undefined
							? undefined
							: text(place.description, 2000)!,
					x,
					y,
					image:
						place.image === undefined ? undefined : text(place.image, 240)!,
				});
			}
			groups.push({
				label: group.label === undefined ? undefined : text(group.label, 80)!,
				places,
			});
		}
		sections.push({ title: text(section.title, 80)!, groups });
	}

	return {
		version: 1,
		overview: text(value.overview, 240)!,
		highResolution:
			value.highResolution === undefined
				? undefined
				: text(value.highResolution, 240)!,
		sections,
	};
}

export async function loadMapCatalog(
	configuredRoot: string | undefined,
): Promise<MapCatalog | null> {
	try {
		const rootReal = await resolveLocalMediaRoot(configuredRoot);
		if (!rootReal) return null;
		const manifestPath = path.join(rootReal, 'manifest.json');
		const manifestStats = await fs.lstat(manifestPath);
		if (
			manifestStats.isSymbolicLink() ||
			!manifestStats.isFile() ||
			manifestStats.size > 1024 * 1024
		)
			return null;
		const manifest = parseManifest(
			JSON.parse(await fs.readFile(manifestPath, 'utf8')),
		);
		if (!manifest) return null;

		return {
			overview: await localMediaFile(rootReal, manifest.overview, imageTypes),
			highResolution: await localMediaFile(
				rootReal,
				manifest.highResolution,
				imageTypes,
			),
			sections: await Promise.all(
				manifest.sections.map(async (section) => ({
					title: section.title,
					groups: await Promise.all(
						section.groups.map(async (group) => ({
							label: group.label ?? null,
							places: await Promise.all(
								group.places.map(async (place) => ({
									id: place.id,
									name: place.name,
									description: place.description ?? null,
									x: place.x,
									y: place.y,
									image: await localMediaFile(
										rootReal,
										place.image,
										imageTypes,
									),
								})),
							),
						})),
					),
				})),
			),
		};
	} catch {
		return null;
	}
}

export function mapPlaces(catalog: MapCatalog): MapPlace[] {
	return catalog.sections.flatMap((section) =>
		section.groups.flatMap((group) => group.places),
	);
}
