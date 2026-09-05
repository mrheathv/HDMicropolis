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
	<div class="advisor" class:important={micropolisReactive.messageImportant} role="alert">
		<header class="advisor-header">
			<h3>{richNotice.title}</h3>
			<button type="button" class="advisor-close" onclick={dismiss} aria-label="Dismiss">×</button>
		</header>
		<p class="advisor-body">{@html richNotice.description}</p>
		<div class="advisor-actions">
			{#if canLocate}
				<button type="button" class="advisor-locate" onclick={locate}>Locate</button>
			{/if}
			<button type="button" class="advisor-dismiss" onclick={dismiss}>Dismiss</button>
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
		background: rgba(8, 12, 20, 0.97);
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 10px;
		color: #eef2ff;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8rem;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
	}

	.advisor.important {
		border-color: rgba(255, 120, 80, 0.7);
		box-shadow: 0 12px 40px rgba(120, 30, 0, 0.5);
	}

	.advisor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding: 0.65rem 0.75rem 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.advisor-header h3 {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	.advisor.important .advisor-header h3 {
		color: #ffb380;
	}

	.advisor-close {
		flex-shrink: 0;
		width: 1.4rem;
		height: 1.4rem;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}

	.advisor-body {
		margin: 0;
		padding: 0.6rem 0.75rem;
		line-height: 1.4;
		opacity: 0.92;
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
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.advisor-dismiss {
		background: rgba(80, 140, 255, 0.45);
		border-color: rgba(140, 180, 255, 0.6);
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
		background: rgba(20, 24, 36, 0.94);
		border-top: 1px solid rgba(255, 255, 255, 0.18);
		color: #f5f5f5;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.78rem;
		line-height: 1.25;
		text-align: center;
		pointer-events: none;
	}

	.message-bar.important {
		border-top-color: rgba(255, 120, 80, 0.75);
		background: rgba(48, 16, 12, 0.94);
	}

	.message-text {
		flex: 0 1 auto;
	}

	.coords {
		flex: 0 0 auto;
		font-size: 0.72rem;
		color: #ffc840;
	}
</style>
