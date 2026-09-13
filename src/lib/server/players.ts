import type { Players, PlayerSettings, Prisma } from '@prisma/client';

import {
	isPlayerPronoun,
	isPlayerSex,
	isPlayerVocation,
	type Player,
	PlayerGroup,
	PlayerPronoun,
	PlayerSex,
	PlayerVocation,
	type Skills,
} from '$lib/players';
import { prisma } from '$lib/server/prisma';
import { parseDate, toTitleCase } from '$lib/utils';

export const MountStorageKey = 10000000 + 2001 + 10;

export const PlayerSelectForList = {
	id: true,
	name: true,
	pronoun: true,
	sex: true,
	vocation: true,
	level: true,
	experience: true,
	balance: true,
	is_main: true,
	looktype: true,
	lookaddons: true,
	lookhead: true,
	lookbody: true,
	looklegs: true,
	lookfeet: true,
	deletion: true,

	maglevel: true,
	skill_fist: true,
	skill_club: true,
	skill_sword: true,
	skill_axe: true,
	skill_dist: true,
	skill_shielding: true,
	skill_fishing: true,

	storage: {
		select: {
			value: true,
		},
		where: {
			key: MountStorageKey,
		},
	},

	online: {
		select: { player_id: true },
	},

	guild_membership: {
		select: {
			nick: true,
			guild: { select: { name: true } },
			rank: { select: { name: true } },
		},
	},

	guild_invites: {
		select: {
			guild: { select: { name: true } },
		},
	},
};

export async function getTemplate(vocation: PlayerVocation): Promise<Players> {
	const vocationName = toTitleCase(PlayerVocation[vocation]);
	const characterName = `~~${vocationName} Template`;

	const template = await prisma.players.findUnique({
		where: {
			name: characterName,
		},
	});
	if (template) {
		return template;
	}

	const createData: Partial<Prisma.PlayersCreateInput> =
		vocation === PlayerVocation.None
			? {
					level: 1,
					health: 150,
					healthmax: 150,
					experience: 0,
					mana: 55,
					manamax: 55,
					cap: 400,
					town_id: 3,
				}
			: {
					level: 8,
					health: 185,
					healthmax: 185,
					experience: 4200,
					mana: 90,
					manamax: 90,
					cap: 470,
					town_id: 8,
				};

	return await prisma.players.create({
		data: {
			account: {
				connectOrCreate: {
					where: {
						name: 'Template Account',
					},
					create: {
						name: 'Template Account',
						email: 'template',
						password: 'template',
					},
				},
			},
			name: characterName,
			vocation,
			soul: 100,
			looktype: 128,
			lookbody: 113,
			lookfeet: 115,
			lookhead: 95,
			looklegs: 39,
			group_id: PlayerGroup.Gamemaster,
			conditions: Buffer.from([]),
			...createData,
		},
	});
}

export async function generateCharacterInput({
	name,
	pronoun,
	sex,
	startingTown,
	tutorial,
}: {
	name: string;
	pronoun: PlayerPronoun;
	sex: PlayerSex;
	startingTown: number;
	tutorial: boolean;
}) {
	const vocation = PlayerVocation.None;
	const template = await getTemplate(vocation);
	return {
		level: template.level,
		vocation: template.vocation,
		health: template.health,
		healthmax: template.healthmax,
		experience: template.experience,
		mana: template.mana,
		manamax: template.manamax,
		cap: template.cap,
		soul: template.soul,
		looktype: sex === PlayerSex.Male ? 128 : 136,
		lookaddons: template.lookaddons,
		lookhead: template.lookhead,
		lookbody: template.lookbody,
		looklegs: template.looklegs,
		lookfeet: template.lookfeet,
		conditions: template.conditions,
		name,
		sex,
		pronoun,
		group_id: PlayerGroup.Normal,
		town_id: startingTown,
		istutorial: tutorial,
	};
}

type PlayerWithData = Players & {
	online: { player_id: number } | null;
	storage: { value: number }[];
	town: { name: string };
	settings?: PlayerSettings | null;
	guild_membership?: {
		nick: string;
		guild: { name: string };
		rank: { name: string };
	} | null;
	guild_invites: {
		guild: { name: string };
	}[];
};

type PlayerWithoutOptionals = Pick<
	PlayerWithData,
	| 'id'
	| 'name'
	| 'pronoun'
	| 'sex'
	| 'vocation'
	| 'level'
	| 'is_main'
	| 'looktype'
	| 'lookaddons'
	| 'lookhead'
	| 'lookbody'
	| 'looklegs'
	| 'lookfeet'
	| 'deletion'
	| 'storage'
	| 'online'
	| 'guild_membership'
	| 'guild_invites'
	| 'skill_fist'
	| 'skill_club'
	| 'skill_sword'
	| 'skill_axe'
	| 'skill_dist'
	| 'skill_shielding'
	| 'skill_fishing'
	| 'maglevel'
>;

export function dbToPlayer(
	player: Partial<PlayerWithData> & PlayerWithoutOptionals,
): Player {
	return {
		id: player.id,
		name: player.name,
		level: player.level,
		experience: player.experience,
		looktype: player.looktype,
		lookaddons: player.lookaddons,
		lookhead: player.lookhead,
		lookbody: player.lookbody,
		looklegs: player.looklegs,
		lookfeet: player.lookfeet,
		deletion:
			player.deletion && player.deletion > 0
				? parseDate(player.deletion)
				: null,
		online: Boolean(player.online),
		vocation: isPlayerVocation(player.vocation)
			? player.vocation
			: PlayerVocation.None,
		pronoun: isPlayerPronoun(player.pronoun)
			? player.pronoun
			: PlayerPronoun.Unset,
		sex: isPlayerSex(player.sex) ? player.sex : PlayerSex.Female,
		mount: (player.storage && player.storage[0]?.value) ?? 0,
		isMain: Boolean(player.is_main),
		townName: (player.town && player.town.name) ?? null,
		lastLogin: player.lastlogin ? parseDate(player.lastlogin) : null,
		settings: player.settings ?? undefined,
		guild: player.guild_membership
			? {
					nick: player.guild_membership.nick,
					name: player.guild_membership.guild.name,
					rank: player.guild_membership.rank.name,
				}
			: null,
		guildInvtes: player.guild_invites
			? player.guild_invites.map((invite) => invite.guild.name)
			: [],
	};
}

export function dbToSkills(player: PlayerWithoutOptionals): Skills {
	return {
		magic: player.maglevel,
		fist: player.skill_fist,
		club: player.skill_club,
		sword: player.skill_sword,
		axe: player.skill_axe,
		distance: player.skill_dist,
		shielding: player.skill_shielding,
		fishing: player.skill_fishing,
	};
}
