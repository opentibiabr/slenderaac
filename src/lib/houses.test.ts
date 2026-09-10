import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	houseFilters,
	houseHref,
	parseHouseDefinitions,
	type PublicHouse,
	selectHouses,
} from './houses';
import { importHouseDefinitions } from './server/catalog/house-import';
import { availableFeatureHref } from './site-pages';

const definition = { id: 1, guildhall: false, entry: { x: 100, y: 200, z: 7 } };
const house: PublicHouse = {
	id: 1,
	name: 'A',
	townId: 1,
	town: 'Town',
	size: 10,
	rent: 100,
	beds: 1,
	owner: null,
	rented: false,
	paidUntil: 0,
	bid: 0,
	bidEnd: 0,
	definition,
};

void test('map metadata validates identifiers and coordinates without importing private state', () => {
	assert.deepEqual(
		parseHouseDefinitions([{ ...definition, owner: 42, internal_bid: 10000 }]),
		[definition],
	);
	assert.throws(() => parseHouseDefinitions([definition, definition]));
	assert.throws(() =>
		parseHouseDefinitions([{ ...definition, entry: { x: 1, y: 2, z: 16 } }]),
	);
	assert.throws(() => parseHouseDefinitions([{ ...definition, id: -1 }]));
});

void test('house XML keeps map and client identities separate and ignores comments', () => {
	assert.deepEqual(
		importHouseDefinitions(
			`<!-- <house houseid="99" /> --><houses><house name="A's home" houseid="1" clientid="401" entryx="100" entryy="200" entryz="7" guildhall="true"/></houses>`,
		),
		[{ ...definition, clientId: 401, guildhall: true }],
	);
	assert.throws(() => importHouseDefinitions('<houses />'));
	assert.throws(() =>
		importHouseDefinitions(
			'<houses><house houseid="1" entryx="1" entryy="1" entryz="7" guildhall="nope" /></houses>',
		),
	);
});

void test('town, occupancy and house type filters intersect and omit unclassified map entries', () => {
	const entries = [
		house,
		{ ...house, id: 2, rented: true, owner: 'Owner' },
		{ ...house, id: 3, definition: { ...definition, id: 3, guildhall: true } },
		{ ...house, id: 4, town: 'Other' },
		{ ...house, id: 5, definition: undefined },
	];
	const filters = houseFilters(new URLSearchParams('town=Town'), ['Town']);
	assert.deepEqual(
		selectHouses(entries, filters).map((h) => h.id),
		[1, 2],
	);
	assert.deepEqual(
		selectHouses(entries, { ...filters, state: 'rented' }).map((h) => h.id),
		[2],
	);
	assert.deepEqual(
		selectHouses(entries, { ...filters, type: 'guildhalls' }).map((h) => h.id),
		[3],
	);
});

void test('numeric sorting is descending, deadlines ascending with no deadline last', () => {
	const entries = [
		house,
		{ ...house, id: 2, size: 20, bidEnd: 200 },
		{ ...house, id: 3, size: 15, bidEnd: 100 },
	];
	const filters = houseFilters(new URLSearchParams('town=Town&order=size'), []);
	assert.deepEqual(
		selectHouses(entries, filters).map((h) => h.id),
		[2, 3, 1],
	);
	assert.deepEqual(
		selectHouses(entries, { ...filters, order: 'end' }).map((h) => h.id),
		[3, 2, 1],
	);
});

void test('local detail, back and old menu links retain filters and theme selection', () => {
	const query = new URLSearchParams(
		'world=Canary&town=Ab%27Dendriel&themePreview=classic&order=rent',
	);
	const detail = new URL(houseHref(query, 42), 'https://local.invalid');
	assert.equal(detail.searchParams.get('houseid'), '42');
	assert.equal(houseHref(detail.searchParams), houseHref(query));
	assert.equal(
		availableFeatureHref(
			new URL(
				'https://local.invalid/unavailable?feature=houses&themePreview=classic',
			),
		),
		'/houses?themePreview=classic',
	);
});
