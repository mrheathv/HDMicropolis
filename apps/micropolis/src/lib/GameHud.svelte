<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { toolState } from '$lib/ToolState.svelte';
	import { cityHallState } from '$lib/CityHallState.svelte';
	import { citySelectState } from '$lib/CitySelectState.svelte';
	import { overlayState } from '$lib/OverlayState.svelte';

	// Classic "Zoom" overlay menu labels (see documentation/openlaszlo/resources/data/strings_en-US.xml).
	const OVERLAY_LABELS: Record<string, string> = {
		none: 'All Zones',
		population: 'Population Density',
		rateOfGrowth: 'Rate of Growth',
		traffic: 'Traffic Density',
		pollution: 'Pollution Density',
		crime: 'Crime Rate',
		landValue: 'Land Value',
		power: 'Power Connectivity'
	};
	const overlayLabel = $derived(OVERLAY_LABELS[overlayState.active] ?? 'All Zones');

	const funds = $derived(micropolisReactive.totalFunds);
	const dateLabel = $derived(
		`${micropolisReactive.cityMonth}/${micropolisReactive.cityYear} · ${micropolisReactive.cityName || 'Micropolis'}`
	);
	const simLabel = $derived(
		micropolisReactive.simPaused
			? 'Paused'
			: micropolisReactive.simSpeed > 0
				? `Speed ${micropolisReactive.simSpeed + 1}`
				: 'Stopped'
	);
	const taxLabel = $derived(`Tax ${micropolisReactive.cityTax}%`);

	// Classic SimCity's RCI demand valves are clamped to ±1500 (see
	// update.cpp) -- scale bar fill against that range.
	const RCI_MAX = 1500;
	const rciBars = $derived([
		{ key: 'R', value: micropolisReactive.demandR, color: '#00c000' },
		{ key: 'C', value: micropolisReactive.demandC, color: '#4db0ff' },
		{ key: 'I', value: micropolisReactive.demandI, color: '#ffc800' }
	]);
	const rciTitle = $derived(
		`Demand — R ${micropolisReactive.demandR} · C ${micropolisReactive.demandC} · I ${micropolisReactive.demandI}`
	);

	function barFillPercent(value: number): number {
		return Math.min(100, (Math.abs(value) / RCI_MAX) * 100);
	}
</script>

<div class="game-hud" aria-live="polite">
	<div class="hud-row hud-row-primary">
		<span class="hud-funds">${funds.toLocaleString()}</span>
		<button
			type="button"
			class="hud-date hud-date-button"
			onclick={() => citySelectState.toggle()}
			title="{dateLabel} — click to load a different city"
		>
			{dateLabel}
		</button>
	</div>
	<div class="hud-row hud-meta">
		<div class="rci-graph" title={rciTitle}>
			{#each rciBars as bar (bar.key)}
				<div class="rci-track">
					<div class="rci-centerline"></div>
					<div
						class="rci-fill"
						style:background={bar.value < 0 ? '#ff5c5c' : bar.color}
						style:height="{barFillPercent(bar.value)}%"
						style:bottom={bar.value >= 0 ? '50%' : null}
						style:top={bar.value < 0 ? '50%' : null}
					></div>
				</div>
				<span class="rci-letter rci-letter-{bar.key.toLowerCase()}">{bar.key}</span>
			{/each}
		</div>
		<button
			type="button"
			class="hud-tax hud-tax-button"
			onclick={() => cityHallState.toggle()}
			title="Open City Hall (tax rate, difficulty)"
		>
			{taxLabel}
		</button>
		<span class="hud-speed" class:paused={micropolisReactive.simPaused}>{simLabel}</span>
	</div>
	<div class="hud-row hud-zoom-row">
		<button
			type="button"
			class="hud-zoom-button"
			onclick={() => overlayState.toggle()}
			title="Open the Zoom overlay picker"
		>
			Zoom: {overlayLabel}
		</button>
	</div>
	{#if toolState.lastToolFeedback}
		<div class="hud-feedback">{toolState.lastToolFeedback}</div>
	{/if}
</div>

<style>
	.game-hud {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 20;
		pointer-events: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85rem;
		line-height: 1.35;
		color: #f4f4f0;
		background: rgba(8, 12, 20, 0.82);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		padding: 0.45rem 0.65rem;
		width: 20.5rem;
		box-sizing: border-box;
		backdrop-filter: blur(4px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
	}

	.hud-row {
		display: grid;
		gap: 0.5rem;
	}

	.hud-row-primary {
		grid-template-columns: 7.25rem 1fr;
		align-items: baseline;
	}

	.hud-meta {
		margin-top: 0.25rem;
		grid-template-columns: 1fr 4.25rem 4.5rem;
		align-items: center;
		font-size: 0.75rem;
		color: #dce4f8;
	}

	.rci-graph {
		display: flex;
		align-items: flex-end;
		gap: 0.3rem;
		cursor: default;
	}

	.rci-track {
		position: relative;
		width: 0.6rem;
		height: 1.6rem;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 2px;
		overflow: hidden;
	}

	.rci-centerline {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 1px;
		background: rgba(255, 255, 255, 0.35);
	}

	.rci-fill {
		position: absolute;
		left: 0;
		right: 0;
	}

	.rci-letter {
		font-weight: 700;
		font-size: 0.68rem;
		margin-right: 0.3rem;
	}

	.rci-letter:last-child {
		margin-right: 0;
	}

	/* Match Micropolis's classic R/C/I identity colors (green/blue/yellow). */
	.rci-letter-r {
		color: #00c000;
	}

	.rci-letter-c {
		color: #4db0ff;
	}

	.rci-letter-i {
		color: #ffc800;
	}

	.hud-funds,
	.hud-date,
	.hud-tax,
	.hud-speed {
		font-variant-numeric: tabular-nums;
	}

	.hud-tax-button {
		pointer-events: auto;
		cursor: pointer;
		margin: 0;
		padding: 0;
		border: none;
		border-radius: 3px;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.hud-tax-button:hover,
	.hud-tax-button:focus-visible {
		background: rgba(255, 255, 255, 0.12);
		outline: none;
	}

	.hud-date {
		text-align: right;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hud-date-button {
		pointer-events: auto;
		cursor: pointer;
		width: 100%;
		margin: 0;
		padding: 0;
		border: none;
		border-radius: 3px;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.hud-date-button:hover,
	.hud-date-button:focus-visible {
		background: rgba(255, 255, 255, 0.12);
		outline: none;
	}

	.hud-tax,
	.hud-speed {
		text-align: right;
	}

	.hud-zoom-row {
		margin-top: 0.3rem;
	}

	.hud-zoom-button {
		pointer-events: auto;
		cursor: pointer;
		width: 100%;
		margin: 0;
		padding: 0.15rem 0.3rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.06);
		color: inherit;
		font: inherit;
		font-size: 0.75rem;
		text-align: left;
	}

	.hud-zoom-button:hover,
	.hud-zoom-button:focus-visible {
		background: rgba(255, 255, 255, 0.14);
		outline: none;
	}

	.hud-feedback {
		margin-top: 0.35rem;
		padding-top: 0.3rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 0.78rem;
		font-weight: 600;
		color: #ffc840;
	}

	.hud-funds {
		font-weight: 700;
		color: #9cf59c;
	}

	.paused {
		color: #ffb347;
	}
</style>
