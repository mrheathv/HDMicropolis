<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { messageText } from '$lib/engineMessages';
	import { NOTICE_TEXT } from '$lib/noticeText';

	const DEFAULT_MESSAGE = 'Welcome to Micropolis.';

	const displayText = $derived(
		micropolisReactive.messageIndex >= 0
			? messageText(micropolisReactive.messageIndex)
			: DEFAULT_MESSAGE,
	);

	const showCoords = $derived(
		micropolisReactive.messageIndex >= 0 && micropolisReactive.messageX >= 0,
	);

	// Richer advisor popup (title + description) for messages that have one in
	// the classic string table -- see noticeText.ts. Plain "need more X" nags
	// don't have an entry and just show in the status bar below, as before.
	const richNotice = $derived(NOTICE_TEXT[micropolisReactive.messageIndex] ?? null);
	const canLocate = $derived(micropolisReactive.messageX >= 0 && micropolisReactive.messageY >= 0);

	let dismissedRevision = $state(-1);
	const showAdvisor = $derived(!!richNotice && dismissedRevision !== micropolisReactive.messageRevision);

	function dismiss() {
		dismissedRevision = micropolisReactive.messageRevision;
	}

	function locate() {
		if (canLocate) {
			micropolisReactive.panToTile(micropolisReactive.messageX, micropolisReactive.messageY);
		}
	}
</script>

{#if showAdvisor && richNotice}
	<div class="mp-window advisor" class:important={micropolisReactive.messageImportant} role="alert">
		<header class="mp-window-header advisor-header">
			<h3>{richNotice.title}</h3>
			<button type="button" class="mp-window-close" onclick={dismiss} aria-label="Dismiss">×</button>
		</header>
		<p class="advisor-body">{@html richNotice.description}</p>
		<div class="advisor-actions">
			{#if canLocate}
				<button type="button" class="mp-button advisor-locate" onclick={locate}>Locate</button>
			{/if}
			<button type="button" class="mp-button advisor-dismiss" onclick={dismiss}>Dismiss</button>
		</div>
	</div>
{/if}

<div
	class="message-bar"
	class:important={micropolisReactive.messageImportant}
	aria-live="polite"
	role="status"
>
	<span class="message-text">{displayText}</span>
	{#if showCoords}
		<span class="coords">({micropolisReactive.messageX}, {micropolisReactive.messageY})</span>
	{/if}
</div>

<style>
	.advisor {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 30;
		width: min(20rem, 90vw);
		font-family: var(--mp-font);
		font-size: 0.8rem;
	}

	.advisor.important .advisor-header {
		background: var(--mp-danger-bg-hover);
	}

	.advisor-header {
		gap: 0.6rem;
		padding: 0.4rem 0.5rem;
	}

	.advisor-header h3 {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	.advisor.important .advisor-header h3 {
		color: var(--mp-danger);
	}

	.advisor-body {
		margin: 0;
		padding: 0.6rem 0.75rem;
		line-height: 1.4;
	}

	.advisor-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0 0.75rem 0.65rem;
	}

	.advisor-locate,
	.advisor-dismiss {
		padding: 0.3rem 0.65rem;
	}

	.advisor-dismiss {
		font-weight: 700;
	}

	.message-bar {
		flex-shrink: 0;
		z-index: 25;
		height: var(--message-bar-height, 2.5rem);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		width: 100%;
		padding: 0 0.75rem;
		box-sizing: border-box;
		background: var(--mp-face);
		border-top: 2px solid var(--mp-border);
		box-shadow: inset 0 1px 0 var(--mp-highlight);
		color: var(--mp-text);
		font-family: var(--mp-font);
		font-size: 0.78rem;
		line-height: 1.25;
		text-align: center;
		pointer-events: none;
	}

	.message-bar.important {
		background: var(--mp-danger-bg);
	}

	.message-text {
		flex: 0 1 auto;
	}

	.coords {
		flex: 0 0 auto;
		font-size: 0.72rem;
		color: var(--mp-warn-text);
	}
</style>
