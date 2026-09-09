<script lang="ts">
	import {
		faCheckCircle,
		faCircle,
		faCircleExclamation,
		faCircleXmark,
	} from '@fortawesome/free-solid-svg-icons';
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import { CoinOrderStatus } from '$lib/shop';
	import { themePreviewHref } from '$lib/themes/preview';

	import { PUBLIC_SUPPORT_EMAIL, PUBLIC_TITLE } from '$env/static/public';

	export let status: CoinOrderStatus;
	export let amount: number;

	const MAX_TRIES = 10;
	let tries = 0;

	onMount(() => {
		const interval = setInterval(async () => {
			await invalidate('shop:order');
			tries++;
			if (
				status === CoinOrderStatus.COMPLETED ||
				status === CoinOrderStatus.CANCELED ||
				tries >= MAX_TRIES
			) {
				clearInterval(interval);
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});

	const nonFinalStatus: CoinOrderStatus[] = [
		CoinOrderStatus.PENDING,
		CoinOrderStatus.FAILED_ATTEMPT,
	];
	$: isFinal = !nonFinalStatus.includes(status);
	$: processing = !isFinal && tries < MAX_TRIES;

	$: headerText = {
		[CoinOrderStatus.PENDING]: processing
			? $_('shop.status.pending.processing')
			: $_('shop.status.pending.done'),
		[CoinOrderStatus.FAILED_ATTEMPT]: processing
			? $_('shop.status.failed.processing')
			: $_('shop.status.failed.done'),
		[CoinOrderStatus.COMPLETED]: $_('shop.status.completed'),
		[CoinOrderStatus.CANCELED]: $_('shop.status.canceled'),
	}[status];

	$: icon = {
		[CoinOrderStatus.PENDING]: faCircle,
		[CoinOrderStatus.FAILED_ATTEMPT]: faCircleExclamation,
		[CoinOrderStatus.COMPLETED]: faCheckCircle,
		[CoinOrderStatus.CANCELED]: faCircleXmark,
	}[status];

	$: meterClass = {
		[CoinOrderStatus.PENDING]: 'bg-primary-700',
		[CoinOrderStatus.FAILED_ATTEMPT]: 'bg-error-700',
		[CoinOrderStatus.COMPLETED]: 'bg-success-700',
		[CoinOrderStatus.CANCELED]: 'bg-warning-700',
	}[status];
	$: textClass = {
		[CoinOrderStatus.PENDING]: 'text-primary-700',
		[CoinOrderStatus.FAILED_ATTEMPT]: 'text-error-700',
		[CoinOrderStatus.COMPLETED]: 'text-success-700',
		[CoinOrderStatus.CANCELED]: 'text-warning-700',
	}[status];
</script>

<header class="step-header text-2xl font-bold">
	{headerText}
</header>
<ProgressBar
	meter="{meterClass} transition-all duration-500"
	max={1}
	value={processing ? undefined : 1} />
<div
	class="transition-all duration-500 placeholder flex flex-row items-center justify-center {textClass}"
	class:animate-pulse={processing}>
	{#if !processing}
		<span transition:fade={{ duration: 500 }}>
			<Fa {icon} class="text-3xl" />
		</span>
	{/if}
</div>
{#if !processing}
	<div class="py-4 px-8 text-center" transition:slide={{ duration: 500 }}>
		{#if !isFinal}
			{@html $_('shop.confirmation.nonFinalStatus', {
				values: {
					PUBLIC_SUPPORT_EMAIL,
				},
			})}
		{:else if status === CoinOrderStatus.CANCELED}
			{@html $_('shop.confirmation.canceled', {
				values: {
					PUBLIC_SUPPORT_EMAIL,
				},
			})}
		{:else if status === CoinOrderStatus.COMPLETED}
			{@html $_('shop.confirmation.completed', {
				values: {
					amount,
					PUBLIC_TITLE,
				},
			})}
		{/if}
	</div>
	<div class="flex flex-row w-full justify-between gap-2">
		<Button
			href={themePreviewHref($page.url, '/shop/coins')}
			color="base"
			class="whitespace-normal">{$_('shop.goback')}</Button>
		<Button href={themePreviewHref($page.url, '/account')}
			>{$_('my-account')}</Button>
	</div>
{/if}
