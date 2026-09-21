type LogLevel = 'debug' | 'info' | 'warn' | 'error';

let operationId = 0;

export function formatLogLine(
	level: LogLevel,
	scope: string,
	message: string,
	date = new Date(),
): string {
	const pad = (value: number, width = 2) => String(value).padStart(width, '0');
	const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
	return `[${day} ${time}] [${level}] [${scope}] ${message.replace(/[\r\n]/g, ' ').replaceAll('\u001b', ' ')}`;
}

export function log(level: LogLevel, scope: string, message: string): void {
	console[level](formatLogLine(level, scope, message));
}

// Do not print arbitrary exception messages: drivers can include credentials or SQL.
export function errorCode(error: unknown): string {
	if (error && typeof error === 'object' && 'code' in error) {
		const code = error.code;
		if (typeof code === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(code))
			return code;
	}
	return error instanceof Error && /^[A-Za-z0-9_-]{1,64}$/.test(error.name)
		? error.name
		: 'Error';
}

export function startLogOperation(scope: string, level: LogLevel = 'info') {
	const id = `${process.pid}.${++operationId}`;
	const started = performance.now();
	let finished = false;
	log(level, scope, `#${id} started`);
	return (outcome = 'completed', resultLevel = level) => {
		if (finished) return;
		finished = true;
		log(
			resultLevel,
			scope,
			`#${id} ${outcome} durationMs=${(performance.now() - started).toFixed(1)}`,
		);
	};
}

export async function logOperation<T>(
	scope: string,
	work: () => T | PromiseLike<T>,
	{ enabled = true, level = 'info' as LogLevel } = {},
): Promise<T> {
	if (!enabled) return work();
	const finish = startLogOperation(scope, level);
	try {
		const result = await work();
		finish();
		return result;
	} catch (error) {
		finish(`failed code=${errorCode(error)}`, 'error');
		throw error;
	}
}
