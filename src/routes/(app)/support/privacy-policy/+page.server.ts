import { loadSupportDocument } from '$lib/server/support-documents';

export const load = () =>
	loadSupportDocument('privacy-policy', 'Privacy Policy');
