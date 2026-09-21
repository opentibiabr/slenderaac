import { loadEnv, type Plugin } from 'vite';

import { log, startLogOperation } from './logging';

export function devDiagnostics(): Plugin {
	return {
		name: 'slender-diagnostics',
		apply: 'serve',
		configureServer(server) {
			const enabled =
				loadEnv(server.config.mode, server.config.envDir, 'SLENDER_DIAGNOSTICS')
					.SLENDER_DIAGNOSTICS === 'true';
			log('info', 'dev', `Starting Vite; diagnostics=${enabled}`);
			server.httpServer?.once('listening', () => {
				log('info', 'dev', 'HTTP listener ready');
			});
			if (!enabled) return;
			// Run before framework middleware to include first-request module loading.
			server.middlewares.use((request, response, next) => {
				const pathname = (request.url ?? '').split('?', 1)[0];
				const kind = request.headers.accept?.includes('text/html')
					? 'document'
					: pathname.endsWith('/__data.json')
						? 'data'
						: pathname.startsWith('/api/')
							? 'api'
							: null;
				if (kind) {
					const finish = startLogOperation(
						`http.${kind} ${request.method ?? 'GET'}`,
						'debug',
					);
					response.once('finish', () =>
						finish(`completed status=${response.statusCode}`),
					);
					response.once('close', () =>
						finish('connection closed before completion', 'warn'),
					);
				}
				next();
			});
		},
	};
}
