<script lang="ts">
	import { onMount } from 'svelte';
	import { HELP_SECTIONS } from '$lib/helpShortcuts';

	let open = $state(false);

	function close() {
		open = false;
	}

	function toggle() {
		open = !open;
	}

	function isHelpKey(event: KeyboardEvent): boolean {
		return event.key === '?' || (event.key === '/' && event.shiftKey);
	}

	onMount(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (isHelpKey(event)) {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggle();
				return;
			}
			if (!open) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopImmediatePropagation();
				close();
				return;
			}
			event.stopImmediatePropagation();
		};

		window.addEventListener('keydown', onKeyDown, true);
		return () => window.removeEventListener('keydown', onKeyDown, true);
	});
</script>

{#if open}
	<div class="mp-backdrop help-backdrop" role="presentation" onclick={close}></div>
	<div class="mp-window help-modal" role="dialog" aria-labelledby="help-title" aria-modal="true">
		<header class="mp-window-header help-header">
			<h2 id="help-title">Keyboard shortcuts</h2>
			<button type="button" class="mp-window-close" onclick={close} aria-label="Close help">×</button>
		</header>

		<div class="mp-window-body help-body">
			{#each HELP_SECTIONS as section (section.title)}
				<section class="help-section">
					<h3>{section.title}</h3>
					<dl class="help-list">
						{#each section.rows as row (row.keys + row.action)}
							<div class="help-row">
								<dt><kbd>{row.keys}</kbd></dt>
								<dd>{row.action}</dd>
							</div>
						{/each}
					</dl>
				</section>
			{/each}
		</div>

		<p class="mp-window-footer help-footer">
			Micropolis in WebAssembly — classic SimCity lineage, ported by Don Hopkins.
			<a href="https://github.com/SimHacker/MicropolisCore" target="_blank" rel="noopener noreferrer"
				>GitHub</a
			>
		</p>
	</div>
{/if}

<style>
	.help-backdrop {
		z-index: 45;
	}

	.help-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(28rem, 94vw);
		max-height: min(80vh, 36rem);
		display: flex;
		flex-direction: column;
		font-size: 0.82rem;
	}

	.help-header {
		padding: 0.5rem 0.6rem;
	}

	.help-body {
		overflow: auto;
		padding: 0.65rem 1rem 0.5rem;
	}

	.help-section + .help-section {
		margin-top: 0.75rem;
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--mp-muted-text);
	}

	.help-list {
		margin: 0;
	}

	.help-row {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		gap: 0.5rem;
		align-items: baseline;
		padding: 0.18rem 0;
	}

	dt {
		margin: 0;
	}

	dd {
		margin: 0;
		line-height: 1.35;
	}

	kbd {
		display: inline-block;
		min-width: 1.5rem;
		padding: 0.1rem 0.35rem;
		font-family: inherit;
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--mp-text);
		background: var(--mp-face);
		border: 2px solid var(--mp-border);
		box-shadow:
			inset 1px 1px 0 var(--mp-highlight),
			inset -1px -1px 0 var(--mp-dark-shadow);
		text-align: center;
	}

	.help-footer {
		margin: 0;
		padding: 0.55rem 1rem 0.85rem;
		font-size: 0.72rem;
		line-height: 1.4;
		color: var(--mp-muted-text);
	}

	.help-footer a {
		color: var(--mp-accent);
	}
</style>
