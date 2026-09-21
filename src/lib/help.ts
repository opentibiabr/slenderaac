export const helpTopics = {
	account: 'Account',
	payments: 'Payments',
	coins: '{{serverName}} Coins',
	gameplay: 'Gameplay',
	technical: 'Technical',
	rules: 'Rules',
};

export type HelpTopic = keyof typeof helpTopics;
export const isHelpTopic = (value: string): value is HelpTopic =>
	Object.hasOwn(helpTopics, value);

export function helpQuery(parameters: URLSearchParams) {
	const topic = parameters.get('topic') ?? '';
	const article = parameters.get('article') ?? '';
	const query = (parameters.get('q') ?? '').trim().replace(/\s+/g, ' ');
	const page = parameters.get('page') ?? '1';
	if (
		(topic && !isHelpTopic(topic)) ||
		(article && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article)) ||
		article.length > 80 ||
		query.length > 50 ||
		!/^[1-9]\d{0,3}$/.test(page)
	)
		return null;
	return { topic, article, query, page: Number(page) };
}

export function helpEntryInput(input: FormData) {
	const values = Object.fromEntries(
		[
			'title',
			'slug',
			'topic',
			'content',
			'version',
			'published',
			'featured',
		].map((key) => [
			key,
			typeof input.get(key) === 'string' ? String(input.get(key)).trim() : '',
		]),
	);
	const errors: Record<string, string[]> = {};
	if (!values.title || values.title.length > 160)
		errors.title = ['Enter a title of up to 160 characters.'];
	if (
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug) ||
		values.slug.length > 80
	)
		errors.slug = [
			'Use lowercase words separated by hyphens (up to 80 characters).',
		];
	if (!isHelpTopic(values.topic)) errors.topic = ['Choose a topic.'];
	if (!values.content || values.content.length > 20000)
		errors.content = ['Enter an answer of up to 20,000 characters.'];
	return {
		values,
		errors,
		valid: Object.keys(errors).length === 0,
		data: {
			title: values.title,
			slug: values.slug,
			topic: values.topic,
			content: values.content,
			published: input.get('published') === 'on',
			featured: input.get('featured') === 'on',
		},
	};
}
