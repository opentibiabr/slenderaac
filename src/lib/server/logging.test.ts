import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatLogLine, logOperation, startLogOperation } from './logging';

void test('console lines use local calendar time, milliseconds and one physical line', () => {
	assert.equal(
		formatLogLine(
			'info',
			'startup',
			'ready\nnext\r\u001b[31m',
			new Date(2026, 8, 13, 21, 22, 26, 417),
		),
		'[2026-09-13 21:22:26.417] [info] [startup] ready next  [31m',
	);
});

void test('operation logs preserve results and rejections without logging secret error messages', async () => {
	const lines: string[] = [];
	const info = console.info;
	const error = console.error;
	console.info = console.error = (line: string) => {
		lines.push(line);
	};
	try {
		const result = { ok: true };
		assert.equal(
			await logOperation('success', () => Promise.resolve(result)),
			result,
		);
		const failure = Object.assign(
			new Error('mysql://username:secret@host/private'),
			{ code: 'P1001' },
		);
		await assert.rejects(
			logOperation('failure', () => Promise.reject(failure)),
			(error: unknown) => error === failure,
		);
		assert.equal(lines.length, 4);
		assert.match(lines[1], /completed durationMs=\d+\.\d$/);
		assert.match(lines[3], /\[error\].*failed code=P1001 durationMs=/);
		assert.doesNotMatch(lines.join('\n'), /username|secret|private/);
		lines.length = 0;
		assert.equal(
			await logOperation('disabled', () => Promise.resolve(result), {
				enabled: false,
			}),
			result,
		);
		await assert.rejects(
			logOperation('disabled', () => Promise.reject(failure), {
				enabled: false,
			}),
			(error: unknown) => error === failure,
		);
		assert.equal(lines.length, 0);
	} finally {
		console.info = info;
		console.error = error;
	}
});

void test('finish and connection-close events cannot complete the same operation twice', () => {
	const lines: string[] = [];
	const info = console.info;
	console.info = (line: string) => {
		lines.push(line);
	};
	try {
		const finish = startLogOperation('http.document');
		finish('completed status=200');
		finish('connection closed');
		assert.equal(lines.length, 2);
		assert.equal(
			lines[0].match(/#\d+\.\d+/)?.[0],
			lines[1].match(/#\d+\.\d+/)?.[0],
		);
		assert.match(lines[1], /completed status=200 durationMs=/);
	} finally {
		console.info = info;
	}
});
