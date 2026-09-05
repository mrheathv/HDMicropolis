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
			class="status-date-button"
			onclick={() => citySelectState.toggle()}
			title="{dateLabel} · {micropolisReactive.cityName || 'Micropolis'} — click to load a different city"
		>
			{dateLabel} · {micropolisReactive.cityName || 'Micropolis'}
		</button>

		<div class="status-rci" title={rciTitle}>
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
			class="status-button"
			onclick={() => cityHallState.toggle()}
			title="Open City Hall (tax rate, difficulty)"
		>
			{taxLabel}
		</button>
		<button
			type="button"
			class="status-button status-speed"
			class:paused={micropolisReactive.simPaused}
			onclick={togglePause}
			title={micropolisReactive.simPaused ? 'Resume the simulation' : 'Pause the simulation'}
		>
			{simLabel}
		</button>
		<button
			type="button"
			class="status-button"
			onclick={() => overlayState.toggle()}
			title="Open the Zoom overlay picker"
		>
			Zoom: {overlayLabel}
		</button>
		<button
			type="button"
			class="status-button"
			onclick={() => micropolisReactive.poke.openBudget()}
			title="Review the city budget"
		>
			Budget…
		</button>
		<button
			type="button"
			class="status-button status-button-danger"
			onclick={() => disasterState.toggle()}
			title="Unleash a disaster"
		>
			Disasters…
		</button>
		<button
			type="button"
			class="status-button"
			onclick={() => evaluationState.toggle()}
			title="View the city evaluation report"
		>
			Evaluation…
		</button>
		<button
			type="button"
			class="status-button"
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
		background: rgba(24, 24, 42, 0.94);
		border: none;
		border-right: 1px solid #5a5a78;
		box-shadow:
			inset -1px 0 0 rgba(255, 255, 255, 0.06),
			2px 0 10px rgba(0, 0, 0, 0.35);
		font-family: ui-monospace, 'Chicago', 'Geneva', monospace;
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
		contain: layout style;
		scrollbar-width: thin;
		scrollbar-color: #4a4a68 transparent;
	}

	.status-panel {
		display: flex;
		flex-direction: column;
		gap: 0.28rem;
		width: 9.2rem;
		padding: 0.1rem 0.1rem 0.5rem;
		margin-bottom: 0.2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.status-funds {
		font-size: 0.85rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: #9cf59c;
	}

	.status-date-button,
	.status-button {
		width: 100%;
		margin: 0;
		padding: 0.2rem 0.35rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.06);
		color: #e8eeff;
		cursor: pointer;
		font: inherit;
		font-size: 0.5rem;
		font-variant-numeric: tabular-nums;
		text-align: left;
		white-space: normal;
		word-break: break-word;
	}

	.status-date-button:hover,
	.status-button:hover,
	.status-date-button:focus-visible,
	.status-button:focus-visible {
		background: rgba(255, 255, 255, 0.14);
		outline: none;
	}

	.status-button-danger {
		border-color: rgba(255, 100, 100, 0.3);
		color: #ffb3b3;
	}

	.status-button-danger:hover,
	.status-button-danger:focus-visible {
		background: rgba(220, 70, 70, 0.28);
		border-color: rgba(255, 120, 120, 0.6);
	}

	.status-rci {
		display: flex;
		align-items: flex-end;
		gap: 0.3rem;
		padding: 0.15rem 0.1rem;
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
		font-size: 0.5rem;
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

	.status-speed {
		font-size: 0.5rem;
		color: #dce4f8;
	}

	.status-speed.paused {
		color: #ffb347;
	}

	.status-feedback {
		padding-top: 0.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		font-size: 0.5rem;
		font-weight: 600;
		color: #ffc840;
	}

	.tool-group-label {
		padding: 0.28rem 0.15rem 0.15rem;
		font-size: 0.46rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #8a92b0;
		user-select: none;
	}

	.tool-group-label:not(:first-child) {
		margin-top: 0.15rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
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
		border: 1px solid transparent;
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.04);
		cursor: pointer;
		box-sizing: border-box;
		outline: none;
		transition: background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
	}

	.tool-icon-frame {
		position: relative;
		width: 3.8rem;
		height: 3.8rem;
	}

	.tool-icon {
		width: 100%;
		height: 100%;
		border-radius: 4px;
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
		background: rgba(8, 8, 16, 0.8);
		color: #ffe566;
		font-size: 0.52rem;
		font-weight: 700;
		line-height: 1.3;
		pointer-events: none;
		user-select: none;
	}

	.tool-label {
		width: 100%;
		color: #d8dcf0;
		font-size: 0.5rem;
		font-weight: 500;
		line-height: 1.2;
		text-align: center;
		white-space: normal;
		word-break: break-word;
		user-select: none;
	}

	.tool-item:hover {
		background: rgba(46, 46, 80, 0.85);
		border-color: rgba(138, 184, 255, 0.4);
	}

	.tool-item.active {
		background: #304878;
		border-color: #8ab8ff;
		box-shadow: 0 0 0 1px rgba(138, 184, 255, 0.5), 0 1px 4px rgba(0, 0, 0, 0.4);
	}

	.tool-item.active .tool-label {
		color: #fff;
		font-weight: 700;
	}
</style>
