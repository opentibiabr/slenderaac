<script lang="ts">
	import { page } from '$app/stores';

	import PagePanel from '$lib/components/ui/PagePanel.svelte';
	import { themePreviewHref } from '$lib/themes/preview';
</script>

<p>
	Welcome to {$page.data.serverName}. Use this website to manage your account,
	find characters and guilds, and follow server news and events.
</p>
<PagePanel title="Getting Started" surface>
	<table class="TableContent ContactTable">
		<tbody>
			<tr class="Odd"
				><th scope="row">Account</th><td
					><a href={themePreviewHref($page.url, '/account/signup')}
						>Create an account</a>
					or <a href={themePreviewHref($page.url, '/account/login')}>log in</a> to
					manage your characters.</td
				></tr>
			<tr class="Even"
				><th scope="row">Game client</th><td
					><a href={themePreviewHref($page.url, '/download')}
						>Download the configured client</a>
					and read the
					<a href={themePreviewHref($page.url, '/guides/quickstart')}
						>Quickstart guide</a
					>.</td
				></tr>
			<tr class="Odd"
				><th scope="row">Community</th><td
					>Find <a href={themePreviewHref($page.url, '/characters')}
						>characters</a
					>, see
					<a href={themePreviewHref($page.url, '/online')}>who is online</a>,
					browse <a href={themePreviewHref($page.url, '/guilds')}>guilds</a> and
					check the
					<a href={themePreviewHref($page.url, '/highscores')}>highscores</a
					>.</td
				></tr>
			<tr class="Even"
				><th scope="row">News and events</th><td
					>Read the <a href={themePreviewHref($page.url, '/')}>latest news</a>
					and the
					<a href={themePreviewHref($page.url, '/news/event-schedule')}
						>event schedule</a
					>.</td
				></tr>
		</tbody>
	</table>
</PagePanel>
