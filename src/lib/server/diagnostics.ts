import { logOperation } from '$lib/server/logging';

import { env } from '$env/dynamic/private';

export const diagnosticsEnabled = env.SLENDER_DIAGNOSTICS === 'true';

export function diagnosticStep<T>(
	stage: string,
	work: () => T | PromiseLike<T>,
) {
	return logOperation(stage, work, {
		enabled: diagnosticsEnabled,
		level: 'debug',
	});
}
