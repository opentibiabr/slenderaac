<script lang="ts">
	import { faCoins, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
	import { RadioGroup } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';

	import type { CoinOffer } from '$lib/coinOffers';
	import RadioChoice from '$lib/components/ui/forms/RadioChoice.svelte';
	import { getCurrencySymbol } from '$lib/utils';

	export let offers: Record<string, CoinOffer[]>;

	const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });

	let selectedCurrency = Object.keys(offers)[0] ?? 'USD';
	export let value = '';
</script>

<div class="flex flex-col gap-4 items-center">
	<h4 class="h4">{$_('shop.select-quantity')}</h4>
	{#if Object.keys(offers).length > 1}
		<RadioGroup>
			{#each Object.keys(offers) as currency}
				<RadioChoice
					bind:group={selectedCurrency}
					name="currency"
					value={currency}>
					{getCurrencySymbol(currency)}
					{currencyNames.of(currency)}
				</RadioChoice>
			{/each}
		</RadioGroup>
	{/if}

	<RadioGroup display="flex-col">
		{#each offers[selectedCurrency] as offer}
			<RadioChoice bind:group={value} name="offer" value={offer.id}>
				<div class="flex flex-row gap-2 items-center p-1">
					<Fa icon={faCoins} />
					{$_('shop.offer-amount', { values: { amount: offer.amount } })}
					<Fa icon={faMoneyBill} />
					{offer.price}
				</div>
			</RadioChoice>
		{/each}
	</RadioGroup>
</div>
