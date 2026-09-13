import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importAchievementCatalog } from './achievement-import';

const registration = `
for id, item in pairs(ACHIEVEMENTS) do
 local secret = item.secret or false
 local grade = item.grade or 0
 local points = item.points or 0
 Game.registerAchievement(id, item.name, item.description, secret, grade, points)
end`;
const definition =
	'ACHIEVEMENTS = {[9] = {name = "Explorer", description = "A naïve explorer\\nA new line", grade = 1, points = 2}}';

void test('literal achievement registration preserves IDs, UTF-8 and defaults without executing helper functions', () => {
	const [entry] = importAchievementCatalog(
		definition + registration + '\nfunction Player.helper() dangerous() end',
	);
	assert.equal(entry.id, 9);
	assert.equal(entry.secret, false);
	assert.equal(entry.description, 'A naïve explorer\nA new line');
	assert.throws(() => importAchievementCatalog(definition), /registration/);
	assert.throws(
		() =>
			importAchievementCatalog(
				definition.replace('points = 2', 'points = dynamic()') + registration,
			),
		/literal expression/,
	);
	assert.throws(
		() =>
			importAchievementCatalog(
				definition + '\nACHIEVEMENTS[9].points = 8' + registration,
			),
		/explicit export/,
	);
	assert.throws(
		() =>
			importAchievementCatalog(
				definition +
					registration.replace(
						'Game.registerAchievement',
						'item.points = 8\n Game.registerAchievement',
					),
			),
		/mutations/,
	);
	assert.throws(
		() =>
			importAchievementCatalog(
				definition +
					registration.replace(
						'secret, grade, points)',
						'secret, points, grade)',
					),
			),
		/arguments/,
	);
});

void test('registration rejects conditional, mutating, shadowed and indirect execution', () => {
	const call =
		'Game.registerAchievement(id, item.name, item.description, secret, grade, points)';
	for (const replacement of [
		`if item.secret then ${call} end`,
		`change(item)\n${call}`,
		`logger.trace(change(item))\n${call}`,
		`return\n${call}`,
		`local item = item.points or 0\n${call}`,
		`goto continue\n${call}\n::continue::`,
	])
		assert.throws(() =>
			importAchievementCatalog(
				definition + registration.replace(call, replacement),
			),
		);
	assert.throws(() =>
		importAchievementCatalog('local pairs = 0\n' + definition + registration),
	);
	assert.throws(() =>
		importAchievementCatalog(
			'local value = 0, mutateRegistrations()\n' + definition + registration,
		),
	);
	assert.throws(() =>
		importAchievementCatalog(
			definition + registration + '\nfunction ACHIEVEMENTS() end',
		),
	);
	const guarded = registration
		.replace(
			' local secret',
			` if item.name == nil then logger.error(string.format("Missing %s", id)) goto continue end\n if item.description == nil then logger.error("Missing description") goto continue end\n local secret`,
		)
		.replace('\nend', '\n::continue::\nend');
	assert.equal(importAchievementCatalog(definition + guarded).length, 1);
	assert.equal(
		importAchievementCatalog(
			definition +
				'\nACHIEVEMENT_FIRST = 1\nACHIEVEMENT_LAST = #ACHIEVEMENTS\n' +
				guarded,
		).length,
		1,
	);
});
