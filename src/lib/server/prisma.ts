import 'dotenv/config';

import { PrismaClient } from '@prisma/client';

import { resolveDatabaseConfiguration } from '$lib/server/database-source.js';
import { log } from '$lib/server/logging';

export const databaseConfiguration = resolveDatabaseConfiguration(process.env);
log(
	'info',
	'database.config',
	`source=${databaseConfiguration.source} database=${JSON.stringify(databaseConfiguration.database)}`,
);
if (databaseConfiguration.warning)
	log('warn', 'database.config', databaseConfiguration.warning);

export const prisma = new PrismaClient({
	datasourceUrl: databaseConfiguration.url,
});
