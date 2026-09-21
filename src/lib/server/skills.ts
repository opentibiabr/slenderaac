const skillColumns = {
	experience: 'experience',
	magic: 'maglevel',
	fist: 'skill_fist',
	club: 'skill_club',
	sword: 'skill_sword',
	axe: 'skill_axe',
	distance: 'skill_dist',
	shielding: 'skill_shielding',
	fishing: 'skill_fishing',
	balance: 'balance',
} as const;

type Skill = keyof typeof skillColumns;
type SkillColumn = (typeof skillColumns)[Skill];

export function isSkill(skill: string | null): skill is Skill {
	return skill !== null && Object.hasOwn(skillColumns, skill);
}

export function skillToColumn(skill: Skill): SkillColumn {
	return skillColumns[skill];
}
