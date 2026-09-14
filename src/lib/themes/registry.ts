import type { ComponentType } from 'svelte';

import ClassicAccountOverview from '$lib/components/ui/account/ClassicAccountOverview.svelte';
import ClassicCatalogDetails from '$lib/themes/classic/CatalogDetails.svelte';
import ClassicCatalogFilters from '$lib/themes/classic/CatalogFilters.svelte';
import ClassicCharacterList from '$lib/themes/classic/CharacterList.svelte';
import ClassicCharacterProfile from '$lib/themes/classic/CharacterProfile.svelte';
import ClassicGuildList from '$lib/themes/classic/GuildList.svelte';
import ClassicGuildProfile from '$lib/themes/classic/GuildProfile.svelte';
import ClassicHighscores from '$lib/themes/classic/Highscores.svelte';
import ClassicInformationTable from '$lib/themes/classic/InformationTable.svelte';
import ClassicLogin from '$lib/themes/classic/Login.svelte';
import ClassicNewsArticle from '$lib/themes/classic/NewsArticle.svelte';
import ClassicPagePanel from '$lib/themes/classic/PagePanel.svelte';
import ClassicRadioChoice from '$lib/themes/classic/RadioChoice.svelte';
import ClassicReferenceContent from '$lib/themes/classic/ReferenceContent.svelte';
import ClassicSectionNavigation from '$lib/themes/classic/SectionNavigation.svelte';
import ClassicShell from '$lib/themes/classic/Shell.svelte';
import ClassicSmallPanel from '$lib/themes/classic/SmallPanel.svelte';
import ClassicStatelessModal from '$lib/themes/classic/StatelessModal.svelte';
import ClassicTableFrame from '$lib/themes/classic/TableFrame.svelte';
import ClassicTableSurface from '$lib/themes/classic/TableSurface.svelte';
import LegboneCatalogDetails from '$lib/themes/legbone/CatalogDetails.svelte';
import LegboneCatalogFilters from '$lib/themes/legbone/CatalogFilters.svelte';
import LegboneCharacterList from '$lib/themes/legbone/CharacterList.svelte';
import LegboneInformationTable from '$lib/themes/legbone/InformationTable.svelte';
import LegboneLogin from '$lib/themes/legbone/Login.svelte';
import LegbonePagePanel from '$lib/themes/legbone/PagePanel.svelte';
import LegboneRadioChoice from '$lib/themes/legbone/RadioChoice.svelte';
import LegboneSectionNavigation from '$lib/themes/legbone/SectionNavigation.svelte';
import LegboneShell from '$lib/themes/legbone/Shell.svelte';
import LegboneSmallPanel from '$lib/themes/legbone/SmallPanel.svelte';
import LegboneStatelessModal from '$lib/themes/legbone/StatelessModal.svelte';
import LegboneTableFrame from '$lib/themes/legbone/TableFrame.svelte';
import LegboneTableSurface from '$lib/themes/legbone/TableSurface.svelte';
import {
	type ThemeId,
	type ThemeProfile,
	themeProfiles,
} from '$lib/themes/profiles';

export type ThemeDefinition = {
	id: ThemeId;
	name: string;
	profile: ThemeProfile;
	Shell: ComponentType;
	components: ThemeComponents;
};

export type ThemeComponents = {
	PagePanel: ComponentType;
	TableFrame: ComponentType;
	TableSurface: ComponentType;
	SmallPanel: ComponentType;
	SectionNavigation: ComponentType;
	RadioChoice: ComponentType;
	StatelessModal: ComponentType;
	InformationTable: ComponentType;
	CatalogFilters: ComponentType;
	CatalogDetails: ComponentType;
	CharacterList: ComponentType;
	NewsArticle: ComponentType;
	ReferenceContent: ComponentType;
	Login: ComponentType;
	AccountOverview: ComponentType;
	CharacterProfile: ComponentType;
	GuildList: ComponentType;
	GuildProfile: ComponentType;
	Highscores: ComponentType;
};

export const themeRegistry = {
	legbone: {
		id: 'legbone',
		name: themeProfiles.legbone.label,
		profile: themeProfiles.legbone,
		Shell: LegboneShell,
		components: {
			PagePanel: LegbonePagePanel,
			TableFrame: LegboneTableFrame,
			TableSurface: LegboneTableSurface,
			SmallPanel: LegboneSmallPanel,
			SectionNavigation: LegboneSectionNavigation,
			RadioChoice: LegboneRadioChoice,
			StatelessModal: LegboneStatelessModal,
			InformationTable: LegboneInformationTable,
			CatalogFilters: LegboneCatalogFilters,
			CatalogDetails: LegboneCatalogDetails,
			CharacterList: LegboneCharacterList,
			NewsArticle: ClassicNewsArticle,
			ReferenceContent: ClassicReferenceContent,
			Login: LegboneLogin,
			AccountOverview: ClassicAccountOverview,
			CharacterProfile: ClassicCharacterProfile,
			GuildList: ClassicGuildList,
			GuildProfile: ClassicGuildProfile,
			Highscores: ClassicHighscores,
		},
	},
	classic: {
		id: 'classic',
		name: themeProfiles.classic.label,
		profile: themeProfiles.classic,
		Shell: ClassicShell,
		components: {
			PagePanel: ClassicPagePanel,
			TableFrame: ClassicTableFrame,
			TableSurface: ClassicTableSurface,
			SmallPanel: ClassicSmallPanel,
			SectionNavigation: ClassicSectionNavigation,
			RadioChoice: ClassicRadioChoice,
			StatelessModal: ClassicStatelessModal,
			InformationTable: ClassicInformationTable,
			CatalogFilters: ClassicCatalogFilters,
			CatalogDetails: ClassicCatalogDetails,
			CharacterList: ClassicCharacterList,
			NewsArticle: ClassicNewsArticle,
			ReferenceContent: ClassicReferenceContent,
			Login: ClassicLogin,
			AccountOverview: ClassicAccountOverview,
			CharacterProfile: ClassicCharacterProfile,
			GuildList: ClassicGuildList,
			GuildProfile: ClassicGuildProfile,
			Highscores: ClassicHighscores,
		},
	},
} satisfies Record<ThemeId, ThemeDefinition>;

export function themeDefinition(theme: ThemeId): ThemeDefinition {
	return themeRegistry[theme];
}
