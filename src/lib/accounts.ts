import type { Player } from '$lib/players';

export type DailyRewardState = 'collected' | 'uncollected' | 'unknown';

export type AccountCharacter = Player & {
	dailyReward: DailyRewardState;
};

export type AccountInfo = {
	name: string;
	email: string;
	createdAt: Date;
	lastLogin: Date;
	isPremium: boolean;
	premiumGranted: boolean;
	premiumDays: number;
	premiumExpiresAt?: Date;
	coins: number;
	coinsTransferable: number;
	isVerified: boolean;
	is2faEnabled: boolean;
	newEmail?: string;
};
export enum AccountType {
	Normal = 1,
	Tutor,
	SeniorTutor,
	GameMaster,
	CommunityManager,
	God,
}

export const isAccountType = (value: unknown): value is AccountType =>
	typeof value === 'number' && Object.hasOwn(AccountType, value);
