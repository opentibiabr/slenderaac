export type TooltipSection = { title: string; text: string };

export function mergeCalendarTooltipSections(
	events: { title: string; description: string }[],
): TooltipSection[] {
	const seen = new Set<string>();
	return events.flatMap((event) =>
		calendarTooltipSections(event.description, event.title).filter(
			(section) => {
				const key = JSON.stringify([
					section.title.replace(/:$/, '').trim(),
					section.text.replace(/\s+/g, ' ').trim(),
				]);
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			},
		),
	);
}

export function calendarTooltipSections(
	description: string,
	title: string,
): TooltipSection[] {
	const text = description.replace(/\r\n?/g, '\n').trim();
	const sections = text.split(/\n\s*\n/).map((block) => {
		const [heading, ...lines] = block.split('\n');
		return { title: heading.trim(), text: lines.join('\n').trim() };
	});
	if (
		sections.every(
			(section) => section.title.endsWith(':') && section.text.startsWith('•'),
		)
	)
		return sections;
	const prefix = `${title}:\n`;
	return [
		{
			title,
			text:
				text === title || text === `${title}:`
					? ''
					: text.startsWith(prefix)
						? text.slice(prefix.length)
						: text,
		},
	];
}
