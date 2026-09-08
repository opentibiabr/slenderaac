export type ReferenceNode =
	| string
	| {
			tag: string;
			attrs: Record<string, string>;
			children: ReferenceNode[];
			imageHref?: string;
	  };

export type CipNewsReference = {
	sourceUrl: string;
	capturedAt: string;
	articles: {
		id: string;
		title: string;
		date: string;
		icon: string;
		category?: string;
		commentHref: string | null;
		body: ReferenceNode[];
	}[];
	ticker: { date: string; text: string; icon: string; category?: string }[];
	topbarStats: number[][];
	onlineCount: string;
	assets: Record<string, string>;
	premiumText: string;
	premiumButtonText?: string;
	pollText: string;
};

export type CipPresentation = {
	sourceUrl: string;
	capturedAt: string;
	links: Record<string, string>;
	navigation: Record<string, { label: string; href: string }[]>;
	footer: string;
	premiumText?: string;
	premiumButtonText?: string;
	pollText?: string;
	calendarColors?: Record<string, string>;
};

export type CipArticlePresentation = {
	icon: string;
	commentHref: string | null;
	body: ReferenceNode[];
};
