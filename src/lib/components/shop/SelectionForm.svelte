<script lang="ts">
	import { faArrowRight, faLock } from '@fortawesome/free-solid-svg-icons';
	import { _ } from 'svelte-i18n';

	import type { CoinOffer } from '$lib/coinOffers';
	import PaymentMethodSelection from '$lib/components/shop/PaymentMethodSelection.svelte';
	import ProductSelection from '$lib/components/shop/ProductSelection.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$lib/enchance';

	let offerId = '';
	let paymentMethod = '';

	export let offers: Record<string, CoinOffer[]>;
	export let enabledPaymentMethods: string[];
</script>

<header class="step-header text-2xl font-bold">
	{$_('shop.select-amount')}
</header>

<form
	class="flex flex-col gap-2"
	method="post"
	action="?/createIntent"
	use:enhance>
	<input type="hidden" name="offerId" value={offerId} />
	<input type="hidden" name="paymentMethod" value={paymentMethod} />
	<div class="flex flex-row justify-between items-baseline gap-4">
		<span />
		<ProductSelection {offers} bind:value={offerId} />
		<PaymentMethodSelection
			{enabledPaymentMethods}
			bind:value={paymentMethod} />
		<span />
	</div>
	<div class="step-navigation flex justify-between gap-4">
		<span />
		<Button
			type="submit"
			iconAfter={!offerId || !paymentMethod ? faLock : faArrowRight}
			color="base"
			disabled={!offerId || !paymentMethod}>
			{$_('next')}
		</Button>
	</div>
</form>
