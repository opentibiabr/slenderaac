import { createConnection } from 'node:net';

/** Probe only the operator-configured endpoint, with a bounded connection time. */
export async function serverReachable(
	host: string,
	port: string,
): Promise<boolean> {
	if (!host.trim() || !/^\d+$/.test(port)) return false;
	const number = Number(port);
	if (!Number.isInteger(number) || number < 1 || number > 65535) return false;
	return new Promise((resolve) => {
		const socket = createConnection({ host, port: number });
		const finish = (online: boolean) => {
			clearTimeout(deadline);
			socket.destroy();
			resolve(online);
		};
		const deadline = setTimeout(() => finish(false), 1500);
		socket.once('connect', () => finish(true));
		socket.once('error', () => finish(false));
	});
}
