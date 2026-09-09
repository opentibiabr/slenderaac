<script lang="ts">
	export let channels: {
		href: string;
		label: string;
		icon: string | null;
		channels: string;
		viewers: string;
	}[];
	export let signal: string | null;
	export let eye: string | null;
	export let downloadIcon: string | null;
	export let downloadHref: string;
	export let onlineIcon: string | null;
	export let onlineHref: string;
	export let onlineCount: string;
</script>

<!-- Inline spacing is provided by the icon and channel margins. -->
<!-- prettier-ignore -->
<div class="classic-info-bar">
	{#each channels as channel}<a class="classic-info-channel" href={channel.href} target="_blank" rel="noreferrer">{#if channel.icon}<img src={channel.icon} alt={channel.label} />{:else}{channel.label}{/if}<span class="classic-info-numbers">{#if signal}<img class="classic-info-small" src={signal} alt="Channels" />{/if}<span class="classic-info-small">{channel.channels}</span>{#if eye}<img class="classic-info-small" src={eye} alt="Viewers" />{/if}<span class="classic-info-small">{channel.viewers}</span></span></a>{/each}<a href={downloadHref}>{#if downloadIcon}<img src={downloadIcon} alt="" />{/if}<span class="classic-info-numbers"><span class="classic-info-small">Fankit</span></span></a><a class="classic-info-online" href={onlineHref}>{#if onlineIcon}<img src={onlineIcon} alt="" />{/if}<span class="classic-info-numbers"><span class="classic-info-small">{onlineCount} Players Online</span></span></a>
</div>

<style>
	.classic-info-bar {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 28px;
		margin-right: 1px;
		color: white;
		font:
			10px Verdana,
			Arial,
			sans-serif;
		white-space: nowrap;
	}
	a {
		color: white;
		font-size: 9.33333px;
		font-weight: normal;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
	img {
		display: inline;
		vertical-align: baseline;
		max-width: none;
	}
	.classic-info-channel {
		margin-right: 15px;
	}
	.classic-info-small {
		margin-left: 5px;
	}
	.classic-info-numbers {
		position: relative;
		top: -4px;
	}
	.classic-info-online {
		float: right;
	}
	@media (max-width: 980px) {
		.classic-info-bar {
			white-space: normal;
			height: auto;
			line-height: 22px;
		}
		.classic-info-online {
			float: none;
			display: inline-block;
		}
		.classic-info-channel {
			display: inline-block;
		}
	}
</style>
