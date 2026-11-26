/** @param {string | undefined} reportUri */
export function browserCsp(reportUri) {
	/** @type {NonNullable<import('@sveltejs/kit').Config['kit']>['csp']} */
	const config = {
		mode: 'auto',
		directives: {
			'base-uri': ['self'],
			'object-src': ['none'],
		},
		reportOnly: {},
	};
	if (!reportUri) return config;

	// Only a same-origin path can be configured as the collector.
	if (!/^\/(?!\/)[a-zA-Z0-9_./~-]+$/.test(reportUri)) {
		throw new Error('CSP_REPORT_URI must be a same-origin path.');
	}

	config.reportOnly = {
		'default-src': ['self'],
		'base-uri': ['self'],
		'object-src': ['none'],
		'form-action': ['self'],
		'frame-ancestors': ['self'],
		'script-src': ['self', 'https://js.stripe.com', 'https://*.js.stripe.com'],
		'style-src': ['self'],
		'img-src': ['self', 'data:', 'https:'],
		'font-src': ['self', 'data:'],
		'connect-src': ['self', 'https://api.stripe.com'],
		'frame-src': [
			'https://js.stripe.com',
			'https://*.js.stripe.com',
			'https://hooks.stripe.com',
			'https://www.youtube.com',
		],
		'report-uri': [reportUri],
	};
	return config;
}
