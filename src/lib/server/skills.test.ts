import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isSkill, skillToColumn } from './skills';

void test('ranking query identifiers select their database columns without translating the identifier', () => {
	const expected = {
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
	};
	for (const [value, column] of Object.entries(expected)) {
		assert.ok(isSkill(value));
		assert.equal(skillToColumn(value), column);
	}
});

void test('unknown, translated and inherited keys are not ranking identifiers', () => {
	for (const value of [
		null,
		'',
		'Magic',
		'maglevel',
		'magia',
		'experiência',
		'saldo',
		'constructor',
		'__proto__',
		'toString',
	])
		assert.equal(isSkill(value), false, String(value));
});
