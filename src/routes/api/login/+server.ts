import { json } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { authenticator } from 'otplib';
import parseDuration from 'parse-duration';

import { PlayerGroup, PlayerSex, vocationString } from '$lib/players';
import { requireEmailVerification } from '$lib/server/config';
import { prisma } from '$lib/server/prisma';
import { comparePassword } from '$lib/server/utils';
import { serverName } from '$lib/server/worlds';

import {
	DEPRECATED_USE_SHA1_PASSWORDS,
	FREE_PREMIUM,
	GAME_SESSION_EXPIRATION_TIME,
	PVP_TYPE,
	SERVER_ADDRESS,
	SERVER_PORT,
} from '$env/static/private';

import type { RequestHandler } from './$types';

const SESSION_DURATION =
	parseDuration(GAME_SESSION_EXPIRATION_TIME ?? '1d') ?? 3600 * 24;

type Params =
	| {
			type: 'cacheinfo' | 'boostedcreature' | 'eventschedule' | 'news';
	  }
	| LoginParams;

interface LoginParams {
	type: 'login';
	email: string;
	password: string;
	token?: string;
}

interface LoginSession {
	sessionkey: string;
	lastlogintime: string;
	ispremium: boolean;
	premiumuntil: number;
	status: string;
	returnernotification: boolean;
	showrewardnews: boolean;
	isreturner: boolean;
	fpstracking: boolean;
	optiontracking: boolean;
	emailcoderequest: boolean;
}

interface LoginWorld {
	id: number;
	name: string;
	externaladdress: string;
	externalport: number;
	externaladdressprotected: string;
	externalportprotected: number;
	externaladdressunprotected: string;
	externalportunprotected: number;
	previewstate: number;
	location: string;
	anticheatprotection: boolean;
	pvptype: number;
	restrictedstore: boolean;
}

interface LoginCharacter {
	worldid: number;
	name: string;
	ismale: boolean;
	tutorial: boolean;
	level: number;
	vocation: string;
	outfitid: number;
	headcolor: number;
	torsocolor: number;
	legscolor: number;
	detailcolor: number;
	addonsflags: number;
	ishidden: number;
	ismaincharacter: boolean;
	dailyrewardstate: number;
}

interface LoginResponse {
	session: LoginSession;
	playdata: {
		worlds: LoginWorld[];
		characters: LoginCharacter[];
	};
}

interface ErrorResponse {
	errorCode: number;
	errorMessage: string;
}

export const POST: RequestHandler = async ({ request }) => {
	const params = (await request.json()) as Params;
	switch (params.type) {
		case 'news':
			return json({});
		case 'cacheinfo':
			return json(await handleCacheInfo());
		case 'boostedcreature':
			return json(await handleBoostedCreature());
		case 'eventschedule':
			return json({});
		case 'login':
			return json(await handleLogin(params));
		default:
			// eslint-disable-next-line no-case-declarations
			const unknownParams: { type: string } = params;
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			throw new Error(`Unknown login type: ${unknownParams.type}`);
	}
};

async function handleCacheInfo() {
	const playersonline = await prisma.playerOnline.count({
		where: { player: { group_id: { lt: PlayerGroup.Gamemaster } } },
	});
	return {
		playersonline,
		twitchstreams: 0,
		twitchviewer: 0,
		gamingyoutubestreams: 0,
		gamingyoutubeviewer: 0,
	};
}

async function handleBoostedCreature() {
	const boostedCreature = await prisma.boostedCreature.findFirstOrThrow({
		select: { raceid: true },
	});
	const boostedBoss = await prisma.boostedBoss.findFirstOrThrow({
		select: { raceid: true },
	});
	return {
		boostedcreature: true,
		creatureraceid: Number(boostedCreature.raceid),
		bossraceid: Number(boostedBoss.raceid),
	};
}

async function handleLogin(
	params: LoginParams,
): Promise<LoginResponse | ErrorResponse> {
	const account = await prisma.accounts.findUnique({
		where: { email: params.email },
		include: {
			players: {
				select: {
					name: true,
					sex: true,
					istutorial: true,
					level: true,
					looktype: true,
					vocation: true,
					lookhead: true,
					lookbody: true,
					looklegs: true,
					lookfeet: true,
					lookaddons: true,
					is_main: true,
					isreward: true,
					settings: true,
				},
				where: { deletion: 0 },
			},
		},
	});
	if (!account || !comparePassword(params.password, account.password)) {
		return {
			errorCode: 3,
			errorMessage: 'Email or password is not correct.',
		};
	}

	if (requireEmailVerification && !account.is_verified) {
		return {
			errorCode: 5,
			errorMessage:
				'Your account has not been verified. Please check your email to verify your account.',
		};
	}

	if (account.token_secret && !params.token) {
		return {
			errorCode: 6,
			errorMessage: 'Two-factor token required for authentication',
		};
	}

	if (
		account.token_secret &&
		params.token &&
		!authenticator.check(params.token, account.token_secret)
	) {
		return {
			errorCode: 6,
			errorMessage: 'Two-factor token is not correct.',
		};
	}

	let sessionKey: string = crypto.randomUUID();
	const hashedSessionId = createHash('sha1').update(sessionKey).digest('hex');

	if (DEPRECATED_USE_SHA1_PASSWORDS === 'true') {
		sessionKey = `${params.email}\n${params.password}`;
	} else {
		await prisma.gameAccountSessions.create({
			data: {
				id: hashedSessionId,
				account_id: account.id,
				expires: Math.trunc((Date.now() + SESSION_DURATION) / 1000), // convert to seconds
			},
		});
	}

	const serverPort = parseInt(SERVER_PORT) ?? 7172;
	const pvptype = ['pvp', 'no-pvp', 'pvp-enforced'].indexOf(PVP_TYPE);
	const now = Math.trunc(Date.now() / 1000);

	return {
		session: {
			sessionkey: sessionKey,
			lastlogintime: '0', // TODO: implement last login
			ispremium: FREE_PREMIUM === 'true' ? true : account.lastday > now,
			premiumuntil: account.lastday,
			status: 'active',
			returnernotification: false,
			showrewardnews: true,
			isreturner: true,
			fpstracking: false,
			optiontracking: false,
			emailcoderequest: false,
		},
		playdata: {
			// TODO: multiple worlds
			worlds: [
				{
					id: 0,
					name: await serverName(),
					externaladdress: SERVER_ADDRESS,
					externalport: serverPort,
					externaladdressprotected: SERVER_ADDRESS,
					externalportprotected: serverPort,
					externaladdressunprotected: SERVER_ADDRESS,
					externalportunprotected: serverPort,
					previewstate: 0,
					location: 'USA',
					anticheatprotection: false,
					pvptype,
					restrictedstore: false,
				},
			],
			characters: account.players.map(
				(player): LoginCharacter => ({
					worldid: 0,
					name: player.name,
					ismale: player.sex === Number(PlayerSex.Male),
					tutorial: player.istutorial,
					level: player.level,
					vocation: vocationString(player.vocation),
					outfitid: player.looktype,
					headcolor: player.lookhead,
					torsocolor: player.lookbody,
					legscolor: player.looklegs,
					detailcolor: player.lookfeet,
					addonsflags: player.lookaddons,
					ishidden: player.settings?.hidden ? 1 : 0,
					ismaincharacter: player.is_main,
					dailyrewardstate: player.isreward ? 1 : 0,
				}),
			),
		},
	};
}
