import fs from 'node:fs/promises';
import path from 'node:path';

import type { ServedFile } from '$lib/server/file-response';
import { localMediaFile, resolveLocalMediaRoot } from '$lib/server/local-media';

type SoundtrackFile = ServedFile;

export type SoundtrackTrack = {
	id: string;
	title: string;
	audio: SoundtrackFile | null;
	image: SoundtrackFile | null;
};

export type SoundtrackCatalog = {
	tracks: SoundtrackTrack[];
	archive: SoundtrackFile | null;
};

type ManifestTrack = {
	id: string;
	title: string;
	audio: string;
	image?: string;
};

type Manifest = {
	version: 1;
	archive?: string;
	tracks: ManifestTrack[];
};

const audioTypes: Record<string, string> = {
	'.flac': 'audio/flac',
	'.m4a': 'audio/mp4',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg',
	'.wav': 'audio/wav',
};
const imageTypes: Record<string, string> = {
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
};
const archiveTypes: Record<string, string> = { '.zip': 'application/zip' };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function parseManifest(value: unknown): Manifest | null {
	if (
		!isRecord(value) ||
		value.version !== 1 ||
		!Array.isArray(value.tracks) ||
		value.tracks.length > 100 ||
		(value.archive !== undefined && typeof value.archive !== 'string')
	)
		return null;

	const seen = new Set<string>();
	const tracks: ManifestTrack[] = [];
	for (const candidate of value.tracks) {
		if (
			!isRecord(candidate) ||
			typeof candidate.id !== 'string' ||
			!/^[a-z0-9][a-z0-9-]{0,63}$/.test(candidate.id) ||
			seen.has(candidate.id) ||
			typeof candidate.title !== 'string' ||
			candidate.title.trim().length === 0 ||
			candidate.title.length > 120 ||
			typeof candidate.audio !== 'string' ||
			(candidate.image !== undefined && typeof candidate.image !== 'string')
		)
			return null;
		seen.add(candidate.id);
		tracks.push({
			id: candidate.id,
			title: candidate.title.trim(),
			audio: candidate.audio,
			image: candidate.image,
		});
	}

	return {
		version: 1,
		archive: value.archive,
		tracks,
	};
}

export async function loadSoundtrackCatalog(
	configuredRoot: string | undefined,
): Promise<SoundtrackCatalog | null> {
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
			tracks: await Promise.all(
				manifest.tracks.map(async (track) => ({
					id: track.id,
					title: track.title,
					audio: await localMediaFile(rootReal, track.audio, audioTypes),
					image: await localMediaFile(rootReal, track.image, imageTypes),
				})),
			),
			archive: await localMediaFile(rootReal, manifest.archive, archiveTypes),
		};
	} catch {
		return null;
	}
}
