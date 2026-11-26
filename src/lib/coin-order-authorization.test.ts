import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

import * as steps from './payments';

type Route = typeof import('../routes/(app)/shop/coins/+page.server');
type LoadEvent = Parameters<Route['load']>[0];
type CreateEvent = Parameters<Route['actions']['createIntent']>[0];

// Run the page's handlers with in-memory records and no app hooks or network.
const source = readFileSync(
	new URL('../routes/(app)/shop/coins/+page.server.ts', import.meta.url),
	'utf8',
);
const routeCode = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;

function routeFixture(accountId = 1) {
	const statuses = {
		PENDING: 'PENDING',
		FAILED_ATTEMPT: 'FAILED_ATTEMPT',
		COMPLETED: 'COMPLETED',
	};
	const order = { status: statuses.PENDING, amount: 100, account_id: 1 };
	const orders = new Map([
		['pi_owner', { ...order, payment_token: 'pi_owner' }],
		['cs_owner', { ...order, payment_token: 'cs_owner' }],
	]);
	const lookup = ({
		where,
	}: {
		where: { payment_token: string; account_id?: number };
	}) => {
		const match = orders.get(where.payment_token);
		return where.account_id === undefined ||
			match?.account_id === where.account_id
			? (match ?? null)
			: null;
	};
	const createdOrders: unknown[] = [];
	const intentReads: string[] = [];
	const headers = new Headers();
	const price = { toString: () => '1.99' };
	const modules = new Map<string, unknown>([
		['@prisma/client', { CoinOrderStatus: statuses }],
		[
			'@sveltejs/kit',
			{
				error: (status: number, body: unknown) => ({ status, body }),
				redirect: (status: number, location: string) => ({ status, location }),
			},
		],
		[
			'tiny-invariant',
			(condition: unknown, message: string) => assert.ok(condition, message),
		],
		['$env/static/public', { PUBLIC_TITLE: 'Shop' }],
		['$lib/payments', steps],
		[
			'$lib/server/config',
			{ enableStripeCheckout: true, enableStripeCustom: true },
		],
		[
			'$lib/server/prisma',
			{
				prisma: {
					coinOffers: {
						findMany: () => [],
						findUniqueOrThrow: () => ({ price, amount: 100, currency: 'USD' }),
					},
					coinOrders: {
						findUnique: lookup,
						findUniqueOrThrow: lookup,
						create: (args: unknown) => createdOrders.push(args),
					},
				},
			},
		],
		['$lib/server/session', { requireLogin: () => undefined }],
		[
			'$lib/server/stripe',
			{
				stripe: {
					paymentIntents: {
						create: () => ({ id: 'pi_owner', client_secret: 'fixture-secret' }),
						retrieve: (token: string) => {
							intentReads.push(token);
							return { client_secret: 'fixture-secret' };
						},
					},
				},
			},
		],
		['$lib/server/worlds', { serverName: () => 'Test' }],
		['$lib/themes/navigation', { layoutLoginHref: () => '/account/login' }],
		['$lib/utils', { groupBy: () => ({}) }],
	]);
	const route = {} as Route;
	runInNewContext(routeCode, {
		exports: route,
		require: (name: string) => {
			assert.ok(modules.has(name), `Unexpected route dependency ${name}`);
			return modules.get(name);
		},
		URL,
	});
	const url = (query = '') =>
		new URL(`/shop/coins${query}`, 'https://test.invalid');
	const locals: App.Locals = {
		session: {
			accountId,
			email: 'buyer@example.invalid',
			type: 1,
			expires: Number.MAX_SAFE_INTEGER,
		},
	};
	return {
		createdOrders,
		headers,
		intentReads,
		load: (query: string) =>
			route.load({
				locals,
				url: url(query),
				depends: () => undefined,
				setHeaders: (values: Record<string, string>) => {
					for (const [name, value] of Object.entries(values))
						headers.set(name, value);
				},
			} as LoadEvent),
		createIntent: () => {
			const request = new Request(url(), {
				method: 'POST',
				body: new URLSearchParams({
					offerId: 'offer',
					paymentMethod: 'stripe',
				}),
			});
			return route.actions.createIntent({
				request,
				url: url(),
				locals,
			} as CreateEvent);
		},
	};
}

const paymentQuery = '?step=payment&offerId=offer&paymentMethod=stripe&token=';

void test('unowned and missing orders fail identically before any Stripe request', async () => {
	const other = routeFixture(2);
	for (const query of [
		'?step=confirmation&token=',
		'?step=confirmation&payment_intent=',
		'?token=',
		paymentQuery,
	]) {
		for (const token of ['pi_owner', 'pi_missing']) {
			await assert.rejects(other.load(query + token), {
				status: 404,
				body: { message: 'Order not found' },
			});
		}
	}
	assert.deepEqual(other.intentReads, []);
});

void test('the owner can confirm Checkout and PaymentIntent orders without receiving a query secret', async () => {
	const owner = routeFixture();
	for (const query of [
		'?step=confirmation&token=cs_owner&clientSecret=untrusted',
		'?step=confirmation&payment_intent=pi_owner&payment_intent_client_secret=untrusted',
	]) {
		const data = await owner.load(query);
		assert.equal(data.order?.status, 'PENDING');
		assert.equal(data.order?.amount, 100);
		assert.equal(data.clientSecret, null);
	}
	assert.deepEqual(owner.intentReads, []);
	assert.equal(owner.headers.get('cache-control'), 'private, no-store');
});

void test('the custom payment redirect carries only the ID and the owner gets the server-side secret', async () => {
	const owner = routeFixture();
	await assert.rejects(owner.createIntent(), {
		status: 302,
		location:
			'/shop/coins/?step=payment&paymentMethod=stripe&token=pi_owner&offerId=offer',
	});
	assert.equal(owner.createdOrders.length, 1);
	const payment = await owner.load(
		paymentQuery + 'pi_owner&clientSecret=untrusted',
	);
	assert.equal(payment.clientSecret, 'fixture-secret');
	assert.deepEqual(owner.intentReads, ['pi_owner']);
	assert.equal(owner.headers.get('cache-control'), 'private, no-store');
});
