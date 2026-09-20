import Logger from 'pino';
import { dev } from '$app/environment';

const logger = Logger({
	level: dev ? 'debug' : 'info',
	// Dynamically enable the pretty transport if the flag is passed
	transport: dev
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:standard'
				}
			}
		: undefined
});

export default logger;
