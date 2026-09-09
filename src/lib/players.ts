import type { PlayerSettings } from '@prisma/client';

import type { GuildMembership } from '$lib/guilds';
import type { Item } from '$lib/items';
import type { Outfit } from '$lib/outfits';
import { $_ } from '$lib/utils';

export type PlayerItem = Item;

export type Skills = {
	magic: number;
	fist: number;
	club: number;
	sword: number;
	axe: number;
	distance: number;
	shielding: number;
	fishing: number;
};

export type Player = {
	id: number;
	name: string;
	level: number;
	experience?: bigint;
	balance?: bigint;
	vocation: PlayerVocation;
	sex: PlayerSex;
	pronoun: PlayerPronoun;
	online: boolean;
	deletion: Date | null;
	isMain: boolean;
	townName: string | null;
	lastLogin: Date | null;

	guild?: GuildMembership | null;
	guildInvtes: string[];

	settings?: PlayerSettings;
} & Outfit;

export type PlayerWithRank = Player & {
	rank: number;
	skill: string;
};

export enum PlayerSex {
	Female = 0,
	Male,
}

export enum PlayerPronoun {
	Unset = 0,
	They,
	She,
	He,
	Ze,
	Name,
}

export enum PlayerVocation {
	None = 0,
	Sorcerer,
	Druid,
	Paladin,
	Knight,
	MasterSorcerer,
	ElderDruid,
	RoyalPaladin,
	EliteKnight,
	Monk,
	ExaltedMonk,
}

export const vocationFilters = [
	'all',
	'none',
	'knight',
	'paladin',
	'sorcerer',
	'druid',
	'monk',
] as const;

export function vocationIds(vocation: string): PlayerVocation[] {
	switch (vocation.toLowerCase()) {
		case 'none':
			return [PlayerVocation.None];
		case 'sorcerer':
			return [PlayerVocation.Sorcerer, PlayerVocation.MasterSorcerer];
		case 'druid':
			return [PlayerVocation.Druid, PlayerVocation.ElderDruid];
		case 'paladin':
			return [PlayerVocation.Paladin, PlayerVocation.RoyalPaladin];
		case 'knight':
			return [PlayerVocation.Knight, PlayerVocation.EliteKnight];
		case 'monk':
			return [PlayerVocation.Monk, PlayerVocation.ExaltedMonk];
		default:
			return [];
	}
}

export enum PlayerGroup {
	Normal = 1,
	Tutor,
	Seniortutor,
	Gamemaster,
	Communitymanager,
	God,
}

export const allPronouns = [
	PlayerPronoun.Unset,
	PlayerPronoun.They,
	PlayerPronoun.She,
	PlayerPronoun.He,
	PlayerPronoun.Ze,
	PlayerPronoun.Name,
];

export function parsePlayerSex(value: unknown): PlayerSex {
	if (typeof value === 'string') {
		value = parseInt(value);
	}
	if (isPlayerSex(value)) {
		return value;
	}
	return PlayerSex.Female;
}

export function parsePlayerPronoun(value: unknown): PlayerPronoun {
	if (typeof value === 'string') {
		value = parseInt(value);
	}
	if (isPlayerPronoun(value)) {
		return value;
	}
	return PlayerPronoun.Unset;
}

export function isPlayerSex(value: unknown): value is PlayerSex {
	if (typeof value != 'number') {
		return false;
	}
	const sex = value as PlayerSex;
	return sex === PlayerSex.Female || sex === PlayerSex.Male;
}

export function isPlayerPronoun(value: unknown): value is PlayerPronoun {
	if (typeof value != 'number') {
		return false;
	}
	const pronoun = value as PlayerPronoun;
	return (
		pronoun === PlayerPronoun.Unset ||
		pronoun === PlayerPronoun.They ||
		pronoun === PlayerPronoun.She ||
		pronoun === PlayerPronoun.He ||
		pronoun === PlayerPronoun.Ze ||
		pronoun === PlayerPronoun.Name
	);
}

export function isPlayerVocation(value: unknown): value is PlayerVocation {
	if (typeof value != 'number') {
		return false;
	}
	const vocation = value as PlayerVocation;
	return (
		vocation === PlayerVocation.None ||
		vocation === PlayerVocation.Sorcerer ||
		vocation === PlayerVocation.Druid ||
		vocation === PlayerVocation.Paladin ||
		vocation === PlayerVocation.Knight ||
		vocation === PlayerVocation.MasterSorcerer ||
		vocation === PlayerVocation.ElderDruid ||
		vocation === PlayerVocation.RoyalPaladin ||
		vocation === PlayerVocation.EliteKnight ||
		vocation === PlayerVocation.Monk ||
		vocation === PlayerVocation.ExaltedMonk
	);
}

export function sexString(playerSex: PlayerSex): string {
	return {
		[PlayerSex.Female]: $_('sexes.female'),
		[PlayerSex.Male]: $_('sexes.male'),
	}[playerSex];
}

export function pronounString(playerPronoun: PlayerPronoun): string {
	return {
		[PlayerPronoun.Unset]: $_('pronouns.unset'),
		[PlayerPronoun.They]: $_('pronouns.they'),
		[PlayerPronoun.She]: $_('pronouns.she'),
		[PlayerPronoun.He]: $_('pronouns.he'),
		[PlayerPronoun.Ze]: $_('pronouns.ze'),
		[PlayerPronoun.Name]: $_('pronouns.name'),
	}[playerPronoun];
}

export function vocationString(playerVocation: PlayerVocation): string {
	return {
		[PlayerVocation.None]: $_('vocations.none'),
		[PlayerVocation.Sorcerer]: $_('vocations.sorcerer'),
		[PlayerVocation.Druid]: $_('vocations.druid'),
		[PlayerVocation.Paladin]: $_('vocations.paladin'),
		[PlayerVocation.Knight]: $_('vocations.knight'),
		[PlayerVocation.MasterSorcerer]: $_('vocations.master-sorcerer'),
		[PlayerVocation.ElderDruid]: $_('vocations.elder-druid'),
		[PlayerVocation.RoyalPaladin]: $_('vocations.royal-paladin'),
		[PlayerVocation.EliteKnight]: $_('vocations.elite-knight'),
		[PlayerVocation.Monk]: $_('vocations.monk'),
		[PlayerVocation.ExaltedMonk]: $_('vocations.exalted-monk'),
	}[playerVocation];
}

const validOutfitKeys = [
	'looktype',
	'lookaddons',
	'lookhead',
	'lookbody',
	'looklegs',
	'lookfeet',
	'mount',
	'resize',
];

export function outfitURL({
	resize,
	...params
}: {
	looktype: number;
	lookaddons?: number;
	lookhead?: number;
	lookbody?: number;
	looklegs?: number;
	lookfeet?: number;
	mount?: number;
	resize?: boolean;
}): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (!validOutfitKeys.includes(key)) {
			continue;
		}
		search.append(key, (value ?? 0).toString());
	}
	if (resize) {
		search.append('resize', '1');
	}
	return `/api/outfits?${search.toString()}`;
}

export function getPronoun(character: {
	pronoun: PlayerPronoun;
	name: string;
	sex: PlayerSex;
}) {
	if (character.pronoun === PlayerPronoun.Name) {
		return $_('pronouns.name');
	}
	const pronoun =
		character.pronoun != PlayerPronoun.Unset
			? character.pronoun
			: character.sex === PlayerSex.Female
				? PlayerPronoun.She
				: PlayerPronoun.He;
	return pronounString(pronoun);
}
