<script lang="ts">
	import { page } from '$app/stores';

	import Tooltip from '$lib/components/information/Tooltip.svelte';
	import { mergeCalendarTooltipSections } from '$lib/components/information/tooltip-content';
	import TableFrame from '$lib/components/news/TableFrame.svelte';
	import TableSurface from '$lib/components/news/TableSurface.svelte';
	import { cipAsset } from '$lib/themes/cip-slender/theme';
	import { themePreviewHref } from '$lib/themes/preview';

	import type { PageData } from './$types';

	export let data: PageData;
	$: isCipTheme = $page.data.selectedTheme === 'cip-slender';

	const weekdays = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
	];

	$: themeAssets = $page.data.themeAssets as
		| Record<string, string | undefined>
		| null
		| undefined;
	$: seasonalIcon = cipAsset(themeAssets, 'eventScheduleIconSeasonal');
	function tooltipAttrs(title: string, description: string) {
		return {
			title,
			'tooltip-text': description,
			'arrow-src': themeAssets?.helperArrow ?? '',
			'ornament-src': themeAssets?.contentOrnament ?? '',
		};
	}

	function monthHref(currentUrl: URL, target: { month: number; year: number }) {
		const nextUrl = new URL(
			themePreviewHref(currentUrl, '/news/event-schedule'),
			currentUrl.origin,
		);

		nextUrl.searchParams.set('calendarmonth', String(target.month));
		nextUrl.searchParams.set('calendaryear', String(target.year));

		return `${nextUrl.pathname}${nextUrl.search}`;
	}
</script>

<div class="event-schedule" class:event-schedule--default={!isCipTheme}>
	<TableFrame assets={themeAssets} minWidth={883} minHeight={590}>
		<svelte:fragment slot="caption">
			<div class="event-schedule__caption-row">
				<div class="event-schedule__month-nav">
					{#if data.previous}
						<a
							class="event-schedule__month-arrow event-schedule__month-arrow--previous"
							href={monthHref($page.url, data.previous)}
							aria-label="Previous month">«</a>
					{/if}
					<span>{data.monthName} {data.year}</span>
					{#if data.next}<a
							class="event-schedule__month-arrow event-schedule__month-arrow--next"
							href={monthHref($page.url, data.next)}
							aria-label="Next month">»</a
						>{/if}
				</div>
				<div class="event-schedule__timestamp">
					{data.generatedAtLabel}
				</div>
			</div>
		</svelte:fragment>
		<div class="event-schedule__inner">
			<TableSurface assets={themeAssets} width={862} bordered={false}>
				<table id="eventscheduletable" class="event-schedule__calendar">
					<thead>
						<tr>
							{#each weekdays as day}
								<th scope="col">{day}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each Array.from({ length: 6 }) as _, rowIndex}
							<tr>
								{#each data.cells.slice(rowIndex * 7, rowIndex * 7 + 7) as cell}
									{@const eventTooltipSections = mergeCalendarTooltipSections(
										cell.events.map((event) => ({
											title: event.label.replace(/^\*/, ''),
											description: event.description ?? '',
										})),
									)}
									<td
										class={`event-schedule__day${
											cell.inMonth ? '' : ' event-schedule__day--outside'
										}${cell.isToday ? ' event-schedule__day--today' : ''}`}>
										<div class="event-schedule__day-line">
											<span class="event-schedule__day-number"
												>{cell.day}
											</span>
											{#if cell.hasSeasonalIcon}
												<span
													class="event-schedule__seasonal"
													title={isCipTheme
														? undefined
														: cell.seasonalDescription}>
													{#if isCipTheme}<Tooltip
															calendar
															calendarSections={cell.seasonalTooltipSections}
															id={`calendar-tooltip-${cell.isoDate}-seasonal`}
															attrs={tooltipAttrs(
																'Seasonal event',
																cell.seasonalDescription,
															)}>
															{#if seasonalIcon}<img
																	src={seasonalIcon}
																	alt="" />{:else}<span aria-hidden="true"
																	>✦</span
																>{/if}
														</Tooltip>{:else if seasonalIcon}<img
															src={seasonalIcon}
															alt="Seasonal event" />{:else}<span
															role="img"
															aria-label="Seasonal event">✦</span
														>{/if}</span>
											{/if}
										</div>
										{#each cell.events as event, eventIndex}
											<div
												class="event-schedule__event"
												style:background-color={event.color}
												title={isCipTheme
													? undefined
													: event.description || event.label}>
												{#if isCipTheme}<Tooltip
														calendar
														calendarSections={eventTooltipSections}
														block
														id={`calendar-tooltip-${cell.isoDate}-event-${eventIndex}`}
														attrs={tooltipAttrs(
															event.label.replace(/^\*/, ''),
															event.description ?? '',
														)}>{event.label}</Tooltip
													>{:else}{event.label}{/if}
											</div>
										{/each}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</TableSurface>
		</div>
	</TableFrame>

	<p class="event-schedule__note">
		{#if data.demo && data.capturedMonth}* Events start/end at server save.
			Preview: Tibia.com reference events.
		{:else if data.demo}Preview: no reference events captured for this month.
		{:else}* Event starts/ends at server save of this day.{/if}
	</p>
</div>

<style>
	.event-schedule--default {
		width: 100%;
		min-width: 0;
	}

	.event-schedule--default .event-schedule__caption-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1rem;
	}

	.event-schedule--default .event-schedule__month-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.event-schedule--default .event-schedule__month-arrow {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background: rgb(var(--color-secondary-700));
		font-size: 1.125rem;
	}

	.event-schedule--default .event-schedule__timestamp {
		font-size: 0.75rem;
	}

	.event-schedule--default .event-schedule__calendar {
		width: 100%;
		min-width: 40rem;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.event-schedule--default .event-schedule__calendar th,
	.event-schedule--default .event-schedule__calendar td {
		padding: 0.375rem;
		border: 1px solid rgb(var(--color-surface-500));
	}

	.event-schedule--default .event-schedule__calendar th {
		background: rgb(var(--color-secondary-700));
		color: white;
	}

	.event-schedule--default .event-schedule__calendar td {
		height: 6rem;
		vertical-align: top;
	}

	.event-schedule--default .event-schedule__day--outside {
		background: rgb(var(--color-surface-500) / 0.2);
	}

	.event-schedule--default .event-schedule__day--today {
		box-shadow: inset 0 0 0 2px rgb(var(--color-primary-500));
	}

	.event-schedule--default .event-schedule__day-line {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.375rem;
		font-weight: 700;
	}

	.event-schedule--default .event-schedule__event {
		margin-bottom: 0.25rem;
		padding: 0.25rem;
		border-radius: 0.125rem;
		color: white;
		font-size: 0.75rem;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.event-schedule--default .event-schedule__note {
		margin-top: 0.75rem;
		font-size: 0.875rem;
	}

	:global(.theme-cip-slender) .event-schedule {
		width: calc(100% + 2px);
		margin: 0;
		color: rgb(90 40 0);
		font-family: Verdana, Arial, 'Times New Roman', sans-serif;
		font-size: 12px;
		line-height: normal;
	}

	:global(.theme-cip-slender) .event-schedule__caption-row {
		position: relative;
		width: 864px;
		height: 16px;
	}

	:global(.theme-cip-slender) .event-schedule__month-nav {
		position: absolute;
		top: 0;
		left: 340px;
		width: 150px;
		height: 16px;
		text-align: center;
		white-space: nowrap;
	}

	:global(.theme-cip-slender) .event-schedule__month-arrow {
		color: white;
		font-weight: 700;
		text-decoration: none;
	}

	:global(.theme-cip-slender) .event-schedule__month-arrow--previous {
		float: left;
	}

	:global(.theme-cip-slender) .event-schedule__month-arrow--next {
		float: right;
	}

	:global(.theme-cip-slender) .event-schedule__timestamp {
		position: absolute;
		top: 0;
		right: 5px;
		width: 178px;
		height: 16px;
		text-align: right;
		white-space: nowrap;
	}

	:global(.theme-cip-slender) .event-schedule__inner {
		box-sizing: content-box;
		position: relative;
		width: 862px;
		height: 541px;
		margin: 5px 0 0 3px;
		padding: 5px;
		font-size: 10pt;
	}

	:global(.theme-cip-slender) .event-schedule__calendar {
		position: relative;
		z-index: 1;
		width: 862px;
		height: 538px;
		border-collapse: collapse;
		table-layout: fixed;
		color: rgb(90 40 0);
		font-family: Verdana, Arial, 'Times New Roman', sans-serif;
		font-size: 10pt;
		line-height: normal;
	}

	:global(.theme-cip-slender) .event-schedule__calendar th,
	:global(.theme-cip-slender) .event-schedule__calendar td {
		box-sizing: border-box;
		width: 123px;
		border: 1px solid rgb(250 240 215);
		padding: 1px;
	}

	:global(.theme-cip-slender) .event-schedule__calendar th {
		height: 27px;
		background: rgb(95 77 65);
		color: white;
		font-size: 10pt;
		font-weight: 700;
		text-align: center;
		vertical-align: middle;
	}

	:global(.theme-cip-slender) .event-schedule__calendar td {
		height: 85px;
		background: rgb(231 209 175);
		color: rgb(90 40 0);
		font-size: 10pt;
		font-weight: 400;
		vertical-align: top;
		overflow: hidden;
		background-clip: padding-box;
	}

	:global(.theme-cip-slender)
		.event-schedule__calendar
		td.event-schedule__day--outside {
		background: rgb(212 192 161);
	}

	:global(.theme-cip-slender)
		.event-schedule__calendar
		td.event-schedule__day--today {
		background: rgb(243 229 208);
	}

	:global(.theme-cip-slender) .event-schedule__day-line {
		margin: 0 0 2px 3px;
		font-weight: 700;
		line-height: normal;
		white-space: nowrap;
	}

	:global(.theme-cip-slender) .event-schedule__day-number {
		vertical-align: text-bottom;
	}
	:global(.theme-cip-slender) .event-schedule__seasonal {
		vertical-align: middle;
	}

	:global(.theme-cip-slender) .event-schedule__day-line img {
		display: inline;
		vertical-align: baseline;
		width: 11px;
		height: 11px;
		image-rendering: pixelated;
	}

	:global(.theme-cip-slender) .event-schedule__event {
		height: auto;
		box-sizing: content-box;
		width: 100%;
		margin: 0 0 2px;
		padding: 1% 1% 1% 3px;
		overflow: hidden;
		color: white;
		font-size: 10pt;
		font-weight: 700;
		line-height: normal;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.theme-cip-slender)
		.event-schedule__day--outside
		.event-schedule__event {
		color: rgb(212 192 161);
	}

	:global(.theme-cip-slender) .event-schedule__note {
		margin: 15px 0 0;
		color: rgb(90 40 0);
		font-size: 12px;
		line-height: normal;
	}
</style>
