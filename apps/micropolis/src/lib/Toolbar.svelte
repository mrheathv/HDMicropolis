<script lang="ts">
	import { GAME_TOOL_GROUPS, toolMenuLabel, type ToolId } from '$lib/gameTools';
	import { toolState } from '$lib/ToolState.svelte';
	import { TOOL_ICONS } from '$lib/toolIcons';

	function selectTool(id: ToolId) {
		toolState.setActiveTool(id);
	}
</script>

<nav class="toolbar" aria-label="City tools">
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
					<img
						class="tool-icon"
						src={active ? TOOL_ICONS[tool.id].iconHi : TOOL_ICONS[tool.id].icon}
						alt={tool.label}
						draggable="false"
					/>
					<span class="tool-key">{tool.shortcut}</span>
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
		grid-template-columns: repeat(3, 1fr);
		gap: 0.2rem;
	}

	.tool-item {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.6rem;
		height: 2.6rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.04);
		cursor: pointer;
		box-sizing: border-box;
		outline: none;
		transition: background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
	}

	.tool-icon {
		width: 100%;
		height: 100%;
		border-radius: 3px;
		image-rendering: pixelated;
		pointer-events: none;
		user-select: none;
	}

	.tool-key {
		position: absolute;
		right: 1px;
		bottom: 1px;
		padding: 0 0.15rem;
		border-radius: 2px;
		background: rgba(8, 8, 16, 0.75);
		color: #ffe566;
		font-size: 0.44rem;
		font-weight: 700;
		line-height: 1.3;
		pointer-events: none;
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
</style>
