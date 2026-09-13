<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Confirmation from '$lib/components/shop/Confirmation.svelte';
	import SelectionForm from '$lib/components/shop/SelectionForm.svelte';
	import StripePayment from '$lib/components/shop/StripePayment.svelte';
	import Steps from '$lib/components/ui/Steps.svelte';
	import { allSteps } from '$lib/payments';

	import type { PageData } from './$types';

	export let data: PageData;

	$: step = data.step;
</script>

<Steps steps={3} current={allSteps.indexOf(step)} label="Step">
	{#if step == 'selection'}
		<SelectionForm
			offers={data.offers}
			enabledPaymentMethods={data.enabledPaymentMethods} />
	{:else if step == 'payment' && data.clientSecret && data.accountEmail && data.offerId}
		<header class="step-header text-2xl font-bold">
			{$_('shop.confirm-your-order')}
		</header>
		{#if data.paymentMethod === 'stripe'}
			<StripePayment
				email={data.accountEmail}
				clientSecret={data.clientSecret}
				offerId={data.offerId} />
		{/if}
	{:else if step == 'confirmation' && data.order}
		{#key data.token}
			<Confirmation status={data.order.status} amount={data.order.amount} />
		{/key}
	{/if}
</Steps>
