import { spawnSync } from 'node:child_process';

/** @param {string} cwd */
function audit(cwd) {
	const result = spawnSync(process.execPath, ['audit', '--json'], {
		cwd,
		encoding: 'utf8',
	});
	if (
		result.error ||
		result.signal ||
		(result.status !== 0 && result.status !== 1)
	) {
		throw new Error('Bun audit did not complete.');
	}

	let report;
	try {
		report = JSON.parse(result.stdout);
	} catch {
		throw new Error('Bun audit did not return an advisory report.');
	}
	if (!report || typeof report !== 'object' || Array.isArray(report)) {
		throw new Error('Bun audit returned an invalid advisory report.');
	}

	const findings = new Map();
	for (const [name, advisories] of Object.entries(report)) {
		if (!Array.isArray(advisories) || !advisories.length) {
			throw new Error('Bun audit returned an invalid advisory list.');
		}
		for (const advisory of advisories) {
			if (
				!Number.isSafeInteger(advisory?.id) ||
				!['low', 'moderate', 'high', 'critical'].includes(advisory.severity) ||
				typeof advisory.url !== 'string'
			) {
				throw new Error('Bun audit returned an invalid advisory.');
			}
			findings.set(JSON.stringify([name, advisory.id]), { name, ...advisory });
		}
	}
	if ((result.status === 0) !== (findings.size === 0)) {
		throw new Error('Bun audit returned an inconsistent result.');
	}
	return findings;
}

try {
	const baselineDirectory = process.argv[2];
	const candidate = audit(process.cwd());
	const baseline = baselineDirectory ? audit(baselineDirectory) : null;
	let introduced = 0;

	for (const [key, { name, severity, url }] of candidate) {
		const severe = severity === 'high' || severity === 'critical';
		const previousSeverity = baseline?.get(key)?.severity;
		const newSevere =
			baseline &&
			severe &&
			(!previousSeverity ||
				(previousSeverity !== 'high' && previousSeverity !== 'critical') ||
				(previousSeverity === 'high' && severity === 'critical'));
		if (newSevere) introduced += 1;
		console.log(`[${newSevere ? 'new ' : ''}${severity}] ${name} ${url}`);
	}
	console.log(`Dependency audit found ${candidate.size} advisories.`);
	if (baseline) {
		console.log(`New high or critical advisories: ${introduced}.`);
		if (introduced > 0) process.exitCode = 1;
	}
} catch (error) {
	const message = error instanceof Error ? error.message : 'Unknown error';
	console.error(`Dependency audit failed: ${message}`);
	process.exitCode = 2;
}
