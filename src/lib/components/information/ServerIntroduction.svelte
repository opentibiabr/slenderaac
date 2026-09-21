<script lang="ts">
	import { page } from '$app/stores';

	import InformationTable from '$lib/components/information/InformationTable.svelte';
</script>

<p>
	Welcome to {$page.data.serverName}. Use this website to manage your account,
	find characters and guilds, and follow server news and events.
</p>
<InformationTable title="Getting Started">
	<tbody>
		<tr class="Odd"
			><th scope="row">Account</th><td
				><a class="anchor" href="/account/signup">Create an account</a>
				or
				<a class="anchor" href="/account/login">log in</a> to manage your characters.</td
			></tr>
		<tr class="Even"
			><th scope="row">Game client</th><td
				><a class="anchor" href="/download">Download the configured client</a>
				and read the
				<a class="anchor" href="/guides/quickstart">Quickstart guide</a>.</td
			></tr>
		<tr class="Odd"
			><th scope="row">Community</th><td
				>Find <a class="anchor" href="/characters">characters</a>, see
				<a class="anchor" href="/online">who is online</a>, browse
				<a class="anchor" href="/guilds">guilds</a>
				and check the
				<a class="anchor" href="/highscores">highscores</a>.</td
			></tr>
		<tr class="Even"
			><th scope="row">News and events</th><td
				>Read the <a class="anchor" href="/">latest news</a>
				and the
				<a class="anchor" href="/news/event-schedule">event schedule</a>.</td
			></tr>
	</tbody>
</InformationTable>
