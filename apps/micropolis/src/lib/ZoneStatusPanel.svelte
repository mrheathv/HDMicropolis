<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { toolState } from '$lib/ToolState.svelte';

	const zs = $derived(micropolisReactive.zoneStatus);
	const show = $derived(zs.visible && toolState.activeToolId === 'query');

	function close(): void {
		micropolisReactive.clearZoneStatus();
	}
</script>

{#if show}
	<div class="zone-panel" role="dialog" aria-label="Zone query">
		<div class="zone-header">
			<span class="zone-title">Zone query</span>
			<span class="zone-tile">Tile {zs.x}, {zs.y}</span>
			<button type="button" class="mp-button zone-close" onclick={close}>Close</button>
		</div>
		<dl class="zone-stats">
			<div class="stat">
				<dt>Category</dt>
				<dd>{zs.tileCategory}</dd>
			</div>
			<div class="stat">
				<dt>Density</dt>
				<dd>{zs.populationDensity}</dd>
			</div>
			<div class="stat">
				<dt>Land value</dt>
				<dd>{zs.landValue}</dd>
			</div>
			<div class="stat">
				<dt>Crime</dt>
				<dd>{zs.crimeRate}</dd>
			</div>
			<div class="stat">
				<dt>Pollution</dt>
				<dd>{zs.pollution}</dd>
			</div>
			<div class="stat">
				<dt>Growth</dt>
				<dd>{zs.growthRate}</dd>
			</div>
		</dl>
	</div>
{/if}

<style>
	.zone-panel {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 26;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.45rem 0.65rem 0.5rem;
		box-sizing: border-box;
		background: var(--mp-face);
		border-top: 2px solid var(--mp-border);
		box-shadow: inset 0 1px 0 var(--mp-highlight);
		color: var(--mp-text);
		font-family: var(--mp-font);
		font-size: 0.72rem;
		pointer-events: auto;
	}

	.zone-header {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.75rem;
	}

	.zone-title {
		font-weight: 700;
		font-size: 0.76rem;
		white-space: nowrap;
	}

	.zone-tile {
		color: var(--mp-warn-text);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.zone-close {
		font-size: 0.68rem;
		font-weight: 700;
		line-height: 1;
		padding: 0.28rem 0.55rem;
		white-space: nowrap;
	}

	.zone-stats {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 0.35rem 0.75rem;
		margin: 0;
	}

	.stat {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: baseline;
		gap: 0.45rem;
		min-width: 0;
	}

	dt {
		margin: 0;
		color: var(--mp-muted-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		text-align: right;
	}
</style>
