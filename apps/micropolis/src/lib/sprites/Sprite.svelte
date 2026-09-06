<script lang="ts">
	import type { MapViewport } from '@micropolis/render-core';
	import { layoutSpriteOnScreen, resolveManifest } from './spriteMeasure';
	import type { SpriteInstance } from './types';
	import { PROCEDURAL_SMOKE_PUFF } from './types';

	interface Props {
		instance: SpriteInstance;
		viewport: MapViewport;
	}

	let { instance, viewport }: Props = $props();

	const layout = $derived(layoutSpriteOnScreen(viewport, instance));
	const manifest = $derived(resolveManifest(instance.packId, instance.manifestId));
	const frame = $derived(
		manifest?.frames.find((f) => f.index === instance.frame) ?? manifest?.frames[0],
	);
	// Prefer the manifest's declared real sheet width; a manifest's frame list
	// isn't guaranteed to span the actual image exactly (train.json names
	// fewer frames than its sheet has; other manifests have named more than
	// theirs does), so deriving background-size from frames[].atlas.x can
	// make it narrower or wider than the real image -- which stretches and
	// then (since background-repeat isn't none) tiles it instead of cleanly
	// cropping to one frame.
	// atlasFrameWidth/Height are the raw pixel size of a frame cell in the
	// sheet -- separate from frameWidth/frameHeight (the sprite's unchanged
	// world footprint) so an upscaled sheet (e.g. the 4x xBRZ placeholder HD
	// atlases) can be addressed by its own pixel grid without inflating how
	// big the sprite is drawn on the map.
	const atlasFrameWidth = $derived(manifest?.atlasFrameWidth ?? manifest?.frameWidth ?? 0);
	const atlasFrameHeight = $derived(manifest?.atlasFrameHeight ?? manifest?.frameHeight ?? 0);
	const sheetWidth = $derived(
		manifest?.sheetWidth ??
			(manifest ? Math.max(0, ...manifest.frames.map((f) => f.atlas.x)) + atlasFrameWidth : 0),
	);
	const isSmoke = $derived(instance.manifestId === PROCEDURAL_SMOKE_PUFF);
</script>

{#if layout && manifest}
	{#if isSmoke}
		<div
			class="sprite-smoke"
			style:left="{layout.bounds.x + layout.bounds.w * 0.25}px"
			style:top="{layout.bounds.y + layout.bounds.h * 0.25}px"
			style:width="{layout.bounds.w * 0.5}px"
			style:height="{layout.bounds.h * 0.5}px"
			style:background-color={instance.tint ?? '#ffffff'}
			style:opacity={instance.opacity ?? 0.7}
			style:z-index={instance.zIndex ?? 50}
		></div>
	{:else}
		<div
			class="sprite-sheet"
			style:left="{layout.bounds.x}px"
			style:top="{layout.bounds.y}px"
			style:width="{layout.bounds.w}px"
			style:height="{layout.bounds.h}px"
			style:background-image="url({manifest.sheetUrl})"
			style:background-position="-{(frame?.atlas.x ?? 0) *
				(layout.bounds.w / atlasFrameWidth)}px -{(frame?.atlas.y ?? 0) *
				(layout.bounds.h / atlasFrameHeight)}px"
			style:background-size="{sheetWidth * (layout.bounds.w / atlasFrameWidth)}px {(manifest.sheetHeight ?? atlasFrameHeight) * (layout.bounds.h / atlasFrameHeight)}px"
			style:opacity={instance.opacity ?? 1}
			style:z-index={instance.zIndex ?? 10}
			style:transform={instance.heading != null
				? `rotate(${instance.heading}rad)`
				: undefined}
			style:transform-origin="center center"
		></div>
	{/if}
{/if}

<style>
	.sprite-sheet,
	.sprite-smoke {
		position: absolute;
		pointer-events: none;
		image-rendering: pixelated;
	}
	.sprite-sheet {
		background-repeat: no-repeat;
	}
	.sprite-smoke {
		border-radius: 50%;
		filter: blur(2px);
	}
</style>
