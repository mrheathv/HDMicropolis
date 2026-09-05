<script lang="ts">
	import { GAME_TOOL_GROUPS, toolMenuLabel, type ToolId } from '$lib/gameTools';
	import { toolState } from '$lib/ToolState.svelte';
	import { TOOL_ICONS } from '$lib/toolIcons';
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { cityHallState } from '$lib/CityHallState.svelte';
	import { citySelectState } from '$lib/CitySelectState.svelte';
	import { overlayState } from '$lib/OverlayState.svelte';
	import { disasterState } from '$lib/DisasterState.svelte';
	import { evaluationState } from '$lib/EvaluationState.svelte';
	import { historyState } from '$lib/HistoryState.svelte';
	import { rciState } from '$lib/RCIState.svelte';

	function selectTool(id: ToolId) {
		toolState.setActiveTool(id);
	}

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
	const dateLabel = $derived(`${micropolisReactive.cityMonth}/${micropolisReactive.cityYear}`);
	const simLabel = $derived(
		micropolisReactive.simPaused
			? 'Paused'
			: micropolisReactive.simSpeed > 0
				? `Speed ${micropolisReactive.simSpeed + 1}`
				: 'Stopped'
	);
	const taxLabel = $derived(`Tax ${micropolisReactive.cityTax}%`);

	function togglePause() {
		if (micropolisReactive.simPaused) micropolisReactive.poke.resume();
		else micropolisReactive.poke.pause();
	}

	// Classic SimCity's RCI demand valves are clamped to ±1500 (see update.cpp).
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

<nav class="toolbar" aria-label="City tools">
	<div class="status-panel">
		<div class="status-funds">${funds.toLocaleString()}</div>
		<button
			type="button"
			class="mp-button status-date-button"
			onclick={() => citySelectState.toggle()}
			title="{dateLabel} · {micropolisReactive.cityName || 'Micropolis'} — click to load a different city"
		>
			{dateLabel} · {micropolisReactive.cityName || 'Micropolis'}
		</button>

		<button
			type="button"
			class="status-rci mp-well"
			title="{rciTitle} — click for the full RCI Demand chart"
			onclick={() => rciState.toggle()}
		>
			{#each rciBars as bar (bar.key)}
				<div class="rci-track">
					<div class="rci-centerline"></div>
					<div
						class="rci-fill"
						style:background={bar.value < 0 ? '#c00000' : bar.color}
						style:height="{barFillPercent(bar.value)}%"
						style:bottom={bar.value >= 0 ? '50%' : null}
						style:top={bar.value < 0 ? '50%' : null}
					></div>
				</div>
				<span class="rci-letter rci-letter-{bar.key.toLowerCase()}">{bar.key}</span>
			{/each}
		</button>

		<button
			type="button"
			class="mp-button status-button"
			onclick={() => cityHallState.toggle()}
			title="Open City Hall (tax rate, difficulty)"
		>
			{taxLabel}
		</button>
		<button
			type="button"
			class="mp-button status-button status-speed"
			class:paused={micropolisReactive.simPaused}
			onclick={togglePause}
			title={micropolisReactive.simPaused ? 'Resume the simulation' : 'Pause the simulation'}
		>
			{simLabel}
		</button>
		<button
			type="button"
			class="mp-button status-button"
			onclick={() => overlayState.toggle()}
			title="Open the Zoom overlay picker"
		>
			Zoom: {overlayLabel}
		</button>
		<button
			type="button"
			class="mp-button status-button"
			onclick={() => micropolisReactive.poke.openBudget()}
			title="Review the city budget"
		>
			Budget…
		</button>
		<button
			type="button"
			class="mp-button mp-danger status-button status-button-danger"
			onclick={() => disasterState.toggle()}
			title="Unleash a disaster"
		>
			Disasters…
		</button>
		<button
			type="button"
			class="mp-button status-button"
			onclick={() => evaluationState.toggle()}
			title="View the city evaluation report"
		>
			Evaluation…
		</button>
		<button
			type="button"
			class="mp-button status-button"
			onclick={() => historyState.toggle()}
			title="View the city history graphs"
		>
			History…
		</button>

		{#if toolState.lastToolFeedback}
			<div class="status-feedback">{toolState.lastToolFeedback}</div>
		{/if}
	</div>

	{#each GAME_TOOL_GROUPS as group (group.id)}
		{#if group.label}
			<div class="tool-group-label">{group.label}</div>
		{/if}
		<div class="tool-grid">
			{#each group.tools as tool (tool.id)}
				{@const active = toolState.activeToolId === tool.id}
				<button
					type="button"
					class="tool-item"
					class:active
					title="{tool.shortcut}: {toolMenuLabel(tool)}"
					onclick={() => selectTool(tool.id)}
				>
					<span class="tool-icon-frame">
						<img
							class="tool-icon"
							src={active ? TOOL_ICONS[tool.id].iconHi : TOOL_ICONS[tool.id].icon}
							alt={tool.label}
							draggable="false"
						/>
						<span class="tool-key">{tool.shortcut}</span>
					</span>
					<span class="tool-label">{tool.label}</span>
					{#if tool.cost > 0}
						<span class="tool-cost">${tool.cost.toLocaleString()}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</nav>

<style>
	.toolbar {
		flex-shrink: 0;
		width: max-content;
		height: 100%;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin: 0;
		padding: 0.35rem;
		overflow-x: hidden;
		overflow-y: auto;
		background: var(--mp-face);
		border: none;
		border-right: 2px solid var(--mp-border);
		box-shadow:
			inset -1px 0 0 var(--mp-shadow),
			2px 0 10px rgba(0, 0, 0, 0.35);
		color: var(--mp-text);
		font-family: var(--mp-font);
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
		contain: layout style;
		scrollbar-width: thin;
		scrollbar-color: var(--mp-shadow) transparent;
	}

	.status-panel {
		display: flex;
		flex-direction: column;
		gap: 0.28rem;
		width: 9.2rem;
		padding: 0.1rem 0.1rem 0.5rem;
		margin-bottom: 0.2rem;
		border-bottom: 2px solid var(--mp-shadow);
		box-shadow: inset 0 -1px 0 var(--mp-face-light);
	}

	.status-funds {
		font-size: 0.85rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--mp-money);
	}

	.status-date-button,
	.status-button {
		width: 100%;
		margin: 0;
		padding: 0.2rem 0.35rem;
		font-size: 0.5rem;
		font-variant-numeric: tabular-nums;
		text-align: left;
		white-space: normal;
		word-break: break-word;
	}

	.status-button-danger {
		font-weight: 700;
	}

	.status-rci {
		display: flex;
		align-items: flex-end;
		gap: 0.3rem;
		width: 100%;
		padding: 0.15rem 0.1rem;
		margin: 0;
		font: inherit;
		cursor: pointer;
	}

	.status-rci:hover {
		background: var(--mp-face);
	}

	.rci-track {
		position: relative;
		width: 1rem;
		height: 4.2rem;
		background: var(--mp-face);
		border: 1px solid var(--mp-shadow);
		overflow: hidden;
	}

	.rci-centerline {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 1px;
		background: var(--mp-dark-shadow);
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

	/* Match Micropolis's classic R/C/I identity colors (green/blue/yellow),
	   darkened a touch here so the letters stay legible on the light face. */
	.rci-letter-r {
		color: #007000;
	}

	.rci-letter-c {
		color: #0048b0;
	}

	.rci-letter-i {
		color: #9c7800;
	}

	.status-speed.paused {
		color: var(--mp-warn-text);
	}

	.status-feedback {
		padding-top: 0.25rem;
		border-top: 2px solid var(--mp-shadow);
		box-shadow: inset 0 1px 0 var(--mp-face-light);
		font-size: 0.5rem;
		font-weight: 700;
		color: var(--mp-warn-text);
	}

	.tool-group-label {
		padding: 0.28rem 0.15rem 0.15rem;
		font-size: 0.46rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--mp-muted-text);
		user-select: none;
	}

	.tool-group-label:not(:first-child) {
		margin-top: 0.15rem;
		border-top: 1px solid var(--mp-shadow);
		padding-top: 0.4rem;
	}

	.tool-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.3rem;
	}

	.tool-item {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.2rem;
		width: 4.4rem;
		padding: 0.25rem 0.15rem 0.3rem;
		border: 2px solid var(--mp-border);
		background: var(--mp-face);
		box-shadow:
			inset 1px 1px 0 var(--mp-highlight),
			inset -1px -1px 0 var(--mp-dark-shadow);
		cursor: pointer;
		box-sizing: border-box;
		outline: none;
	}

	.tool-icon-frame {
		position: relative;
		width: 3.8rem;
		height: 3.8rem;
	}

	.tool-icon {
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
		pointer-events: none;
		user-select: none;
	}

	.tool-key {
		position: absolute;
		right: 1px;
		bottom: 1px;
		padding: 0 0.2rem;
		border-radius: 2px;
		background: rgba(0, 0, 0, 0.75);
		color: #ffe566;
		font-size: 0.52rem;
		font-weight: 700;
		line-height: 1.3;
		pointer-events: none;
		user-select: none;
	}

	.tool-label {
		width: 100%;
		color: var(--mp-text);
		font-size: 0.5rem;
		font-weight: 500;
		line-height: 1.2;
		text-align: center;
		white-space: normal;
		word-break: break-word;
		user-select: none;
	}

	.tool-cost {
		width: 100%;
		color: var(--mp-money);
		font-size: 0.46rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		text-align: center;
		user-select: none;
	}

	.tool-item:hover {
		background: var(--mp-face-light);
	}

	.tool-item.active {
		background: var(--mp-accent);
		box-shadow:
			inset 1px 1px 0 var(--mp-dark-shadow),
			inset -1px -1px 0 var(--mp-highlight);
	}

	.tool-item.active .tool-label {
		color: var(--mp-accent-text);
		font-weight: 700;
	}

	.tool-item.active .tool-cost {
		color: var(--mp-accent-text);
	}
</style>
