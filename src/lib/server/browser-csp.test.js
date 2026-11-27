import assert from 'node:assert/strict';
import { test } from 'node:test';

import { browserCsp } from './browser-csp.js';

test('enforces only the baseline when no report collector is configured', () => {
	assert.deepEqual(browserCsp(''), {
		mode: 'auto',
		directives: { 'base-uri': ['self'], 'object-src': ['none'] },
		reportOnly: {},
	});
});

test('keeps the compatibility policy in report-only mode', () => {
	const baseline = browserCsp();
	const withReports = browserCsp('/internal/csp-reports');

	assert.deepEqual(withReports.directives, baseline.directives);
	assert.ok(withReports.reportOnly);
	assert.deepEqual(withReports.reportOnly['report-uri'], [
		'/internal/csp-reports',
	]);
	assert.ok(
		withReports.reportOnly['script-src']?.includes('https://js.stripe.com'),
	);
	assert.ok(
		withReports.reportOnly['frame-src']?.includes('https://www.youtube.com'),
	);
	assert.ok(!withReports.reportOnly['script-src']?.includes('unsafe-inline'));
});

test('rejects collector URLs outside the site and malformed paths', () => {
	for (const value of [
		'https://example.com/reports',
		'//example.com',
		'/has space',
		'/a;b',
		'/a\n',
	]) {
		assert.throws(() => browserCsp(value), /same-origin path/);
	}
});
