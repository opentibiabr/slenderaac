import { loadSupportDocument } from '$lib/server/support-documents';

export const load = () =>
	loadSupportDocument('service-agreement', 'Service Agreement');
