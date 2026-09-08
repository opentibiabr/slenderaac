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
<div class="cip-info-bar">
	{#each channels as channel}<a class="cip-info-channel" href={channel.href} target="_blank" rel="noreferrer">{#if channel.icon}<img src={channel.icon} alt={channel.label} />{:else}{channel.label}{/if}<span class="cip-info-numbers">{#if signal}<img class="cip-info-small" src={signal} alt="Channels" />{/if}<span class="cip-info-small">{channel.channels}</span>{#if eye}<img class="cip-info-small" src={eye} alt="Viewers" />{/if}<span class="cip-info-small">{channel.viewers}</span></span></a>{/each}<a href={downloadHref}>{#if downloadIcon}<img src={downloadIcon} alt="" />{/if}<span class="cip-info-numbers"><span class="cip-info-small">Fankit</span></span></a><a class="cip-info-online" href={onlineHref}>{#if onlineIcon}<img src={onlineIcon} alt="" />{/if}<span class="cip-info-numbers"><span class="cip-info-small">{onlineCount} Players Online</span></span></a>
</div>

<style>
	.cip-info-bar {
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
	.cip-info-channel {
		margin-right: 15px;
	}
	.cip-info-small {
		margin-left: 5px;
	}
	.cip-info-numbers {
		position: relative;
		top: -4px;
	}
	.cip-info-online {
		float: right;
	}
	@media (max-width: 980px) {
		.cip-info-bar {
			white-space: normal;
			height: auto;
			line-height: 22px;
		}
		.cip-info-online {
			float: none;
			display: inline-block;
		}
		.cip-info-channel {
			display: inline-block;
		}
	}
</style>
