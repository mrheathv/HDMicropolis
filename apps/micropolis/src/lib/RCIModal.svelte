<script lang="ts">
	import { onMount } from 'svelte';
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { rciState } from '$lib/RCIState.svelte';

	const open = $derived(rciState.open);

	// Classic SimCity's RCI demand valves are clamped to ±1500 (see update.cpp).
	const RCI_MAX = 1500;

	// Colors/order match the classic demand gauge (documentation/openlaszlo/classes/demandgauge.lzx)
	// and the sidebar meter these numbers already drive.
	const COLUMNS = $derived([
		{ key: 'R', label: 'Residential', color: '#00c000', value: micropolisReactive.demandR },
		{ key: 'C', label: 'Commercial', color: '#4db0ff', value: micropolisReactive.demandC },
		{ key: 'I', label: 'Industrial', color: '#ffc800', value: micropolisReactive.demandI }
	]);

	function barFillPercent(value: number): number {
		return Math.min(100, (Math.abs(value) / RCI_MAX) * 100);
	}

	function close() {
		rciState.close();
	}

	onMount(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!open) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopImmediatePropagation();
				close();
			}
		};
		window.addEventListener('keydown', onKeyDown, true);
		return () => window.removeEventListener('keydown', onKeyDown, true);
	});
</script>

{#if open}
	<div class="mp-backdrop rci-backdrop" role="presentation" onclick={close}></div>
	<div class="mp-window rci-modal" role="dialog" aria-labelledby="rci-title" aria-modal="true">
		<header class="mp-window-header rci-header">
			<h2 id="rci-title">RCI Demand</h2>
			<button type="button" class="mp-window-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="mp-window-body rci-body">
			<div class="rci-columns">
				{#each COLUMNS as col (col.key)}
					<div class="rci-column">
						<span class="rci-value" class:negative={col.value < 0}>
							{col.value > 0 ? '+' : ''}{col.value}
						</span>
						<div class="rci-track mp-well">
							<div class="rci-centerline"></div>
							<div
								class="rci-fill"
								style:background={col.value < 0 ? '#c00000' : col.color}
								style:height="{barFillPercent(col.value)}%"
								style:bottom={col.value >= 0 ? '50%' : null}
								style:top={col.value < 0 ? '50%' : null}
							></div>
						</div>
						<span class="rci-letter" style:color={col.color}>{col.key}</span>
						<span class="rci-label">{col.label}</span>
					</div>
				{/each}
			</div>

			<p class="rci-explainer">
				Bars above the line mean residents/businesses want more of that zone;
				below the line means there's already more than demand supports.
			</p>
		</div>
	</div>
{/if}

<style>
	.rci-backdrop {
		z-index: 45;
	}

	.rci-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(24rem, 92vw);
		font-size: 0.82rem;
	}

	.rci-header {
		padding: 0.5rem 0.6rem;
	}

	.rci-body {
		padding: 1rem 1.25rem 1.1rem;
	}

	.rci-columns {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
	}

	.rci-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}

	.rci-value {
		font-size: 0.85rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--mp-money);
	}

	.rci-value.negative {
		color: var(--mp-danger);
	}

	.rci-track {
		position: relative;
		width: 2.6rem;
		height: 11rem;
		overflow: hidden;
	}

	.rci-centerline {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 2px;
		background: var(--mp-dark-shadow);
	}

	.rci-fill {
		position: absolute;
		left: 0;
		right: 0;
	}

	.rci-letter {
		font-size: 1.4rem;
		font-weight: 700;
		line-height: 1;
	}

	.rci-label {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--mp-muted-text);
	}

	.rci-explainer {
		margin: 1rem 0 0;
		padding-top: 0.7rem;
		border-top: 2px solid var(--mp-shadow);
		box-shadow: inset 0 1px 0 var(--mp-face-light);
		color: var(--mp-muted-text);
		font-size: 0.72rem;
		line-height: 1.4;
		text-align: center;
	}
</style>
