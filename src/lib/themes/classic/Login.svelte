<script lang="ts">
	import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	import { page } from '$app/stores';

	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/forms/TextField.svelte';
	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { enhance } from '$lib/enchance';

	import type { ActionData } from '../../../routes/(app)/account/(un-authenticated)/login/$types';

	export let form: ActionData;
	let showPassword = false;
</script>

<div class="classic-login-panel">
	<PagePanel title="Account Login" surface>
		<form method="post" use:enhance>
			{#if form?.errors?.global}<p class="text-error-500">
					{form.errors.global}
				</p>{/if}
			{#if form?.tokenRequired}
				<input type="hidden" name="email" value={form.email} /><input
					type="hidden"
					name="password"
					value={form.password} />
				<TextField
					required
					label="Authenticator Token"
					name="token"
					type="number"
					autocomplete="one-time-code"
					errors={form?.errors?.token} />
				<Button type="submit">Login</Button>
			{:else}
				<div class="classic-login-grid">
					<label for="login-email">Email Address:</label><input
						id="login-email"
						name="email"
						type="email"
						autocomplete="email"
						required />
					<div class="classic-login-button">
						<Button type="submit">Login</Button>
					</div>
					<label for="login-password">Password:</label>
					<div class="classic-password-field">
						<input
							id="login-password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required />
						<button
							type="button"
							class="classic-password-toggle"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							aria-pressed={showPassword}
							on:click={() => (showPassword = !showPassword)}
							><Fa icon={showPassword ? faEyeSlash : faEye} /></button>
					</div>
					<div
						class="classic-login-button"
						style={`--classic-native-button: url("${$page.data.themeAssets?.redButtonBackground ?? ''}"); --classic-native-button-hover: url("${$page.data.themeAssets?.redButtonHover ?? ''}")`}>
						<Button href="/account/lost">Account Lost?</Button>
					</div>
				</div>
			{/if}
		</form>
	</PagePanel>
</div>
<h2 class="classic-new-player-heading">New Player?</h2>
<PagePanel title="New Player" surface>
	<div class="classic-new-player">
		<p>
			Create an account and your first character to start playing on this
			server.
		</p>
		<div
			class="classic-create-account"
			style={`--classic-native-button: url("${$page.data.themeAssets?.mediumButtonBackground ?? ''}"); --classic-native-button-hover: url("${$page.data.themeAssets?.mediumButtonHover ?? ''}")`}>
			<Button href="/account/signup"
				>{#if $page.data.themeAssets?.mediumButtonCreateAccount}<img
						src={$page.data.themeAssets.mediumButtonCreateAccount}
						alt="Create Account" />{:else}Create Account{/if}</Button>
		</div>
	</div>
</PagePanel>

<style>
	:global(.theme-classic)
		.classic-login-panel
		:global(.classic-page-panel__body) {
		padding-top: 7px;
		padding-bottom: 10px;
	}
	:global(.theme-classic) .classic-login-grid > label {
		align-self: start;
	}
	:global(.theme-classic) .classic-login-grid > :is(label:first-child, input) {
		align-self: start;
		margin-top: 3px;
	}
	:global(.theme-classic) .classic-login-panel .classic-login-grid > input,
	:global(.theme-classic) .classic-login-grid > .classic-password-field {
		width: calc(100% - 4px);
	}
	:global(.theme-classic) .classic-login-grid > .classic-password-field {
		align-self: start;
	}
	:global(.theme-classic) .classic-create-account :global(.btn) {
		width: 150px;
		height: 37px;
		background-size: 150px 37px;
	}
	:global(.theme-classic) .classic-login-grid {
		display: grid;
		grid-template-columns: 140px minmax(80px, 1fr) 135px;
		align-items: center;
		gap: 4px 5px;
		padding: 2px 5px 5px;
		border: 1px solid #faf0d7;
	}
	:global(.theme-classic) .classic-login-grid label {
		font-weight: bold;
	}
	:global(.theme-classic) .classic-login-grid input {
		width: 100%;
	}
	:global(.theme-classic) .classic-password-field {
		position: relative;
	}
	:global(.theme-classic) .classic-password-field input {
		padding-right: 30px;
	}
	:global(.theme-classic) .classic-password-toggle {
		position: absolute;
		right: 8px;
		top: 2px;
		width: 24px;
		height: 17px;
		color: #555;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.theme-classic) .classic-new-player-heading {
		text-align: center;
		font:
			bold 24px Verdana,
			sans-serif;
		margin: 25px 0 18px;
	}
	:global(.theme-classic) .classic-new-player {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		min-height: 75px;
		padding: 5px;
	}
	@media (max-width: 767px) {
		:global(.theme-classic) .classic-login-grid {
			grid-template-columns: 1fr;
		}
		:global(.theme-classic) .classic-new-player {
			flex-wrap: wrap;
		}
	}
</style>
