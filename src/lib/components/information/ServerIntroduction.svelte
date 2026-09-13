<script lang="ts">
	import { page } from '$app/stores';

	import InformationTable from '$lib/components/information/InformationTable.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
</script>

<p>
	Welcome to {$page.data.serverName}. Use this website to manage your account,
	find characters and guilds, and follow server news and events.
</p>
<InformationTable title="Getting Started">
	<tbody>
		<tr class="Odd"
			><th scope="row">Account</th><td
				><a class="anchor" href={themePreviewHref($page.url, '/account/signup')}
					>Create an account</a>
				or
				<a class="anchor" href={themePreviewHref($page.url, '/account/login')}
					>log in</a> to manage your characters.</td
			></tr>
		<tr class="Even"
			><th scope="row">Game client</th><td
				><a class="anchor" href={themePreviewHref($page.url, '/download')}
					>Download the configured client</a>
				and read the
				<a
					class="anchor"
					href={themePreviewHref($page.url, '/guides/quickstart')}
					>Quickstart guide</a
				>.</td
			></tr>
		<tr class="Odd"
			><th scope="row">Community</th><td
				>Find <a
					class="anchor"
					href={themePreviewHref($page.url, '/characters')}>characters</a
				>, see
				<a class="anchor" href={themePreviewHref($page.url, '/online')}
					>who is online</a
				>, browse
				<a class="anchor" href={themePreviewHref($page.url, '/guilds')}
					>guilds</a>
				and check the
				<a class="anchor" href={themePreviewHref($page.url, '/highscores')}
					>highscores</a
				>.</td
			></tr>
		<tr class="Even"
			><th scope="row">News and events</th><td
				>Read the <a class="anchor" href={themePreviewHref($page.url, '/')}
					>latest news</a>
				and the
				<a
					class="anchor"
					href={themePreviewHref($page.url, '/news/event-schedule')}
					>event schedule</a
				>.</td
			></tr>
	</tbody>
</InformationTable>
