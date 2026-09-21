import { errorCode, log, startLogOperation } from '$lib/server/logging';
import { databaseConfiguration, prisma } from '$lib/server/prisma';

/** One read-only startup check; query failures stay outside request handling. */
export async function checkDatabaseConfiguration(
	diagnostics = false,
): Promise<void> {
	if (databaseConfiguration.source !== 'SERVER_CONFIG_FILE' && !diagnostics)
		return;
	const finish = startLogOperation(
		'database.identity',
		diagnostics ? 'debug' : 'info',
	);
	try {
		const identity = await prisma.$queryRaw<
			{ database: string | null; host: string; port: string }[]
		>`SELECT DATABASE() AS \`database\`, @@hostname AS host, CAST(@@port AS CHAR) AS port`;
		if (diagnostics)
			log('debug', 'database.identity', JSON.stringify(identity));
		if (identity[0]?.database !== databaseConfiguration.database) {
			finish(
				'The connected database differs from the resolved configuration. Check the database proxy and restart the website.',
				'warn',
			);
			return;
		}
		finish(
			`database=${JSON.stringify(databaseConfiguration.database)} source=${databaseConfiguration.source}`,
		);
	} catch (error) {
		finish(
			`Could not verify the database code=${errorCode(error)}. Check server access and credentials.`,
			'warn',
		);
	}
}
