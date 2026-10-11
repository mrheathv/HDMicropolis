import type { MapViewport } from '@micropolis/render-core';
import { AtmosphericLayer } from './AtmosphericLayer';

export type LayerBlendMode = GlobalCompositeOperation;

interface LayerEntry {
	layer: AtmosphericLayer;
	blend: LayerBlendMode;
	/** When true, step() runs each frame (smoke). Scalar overlays skip CA decay. */
	animate: boolean;
	/**
	 * worldWidth/worldHeight units per world-TILE -- callers don't agree on this.
	 * Skywriting sizes its layer in engine sprite-pixel space (16 px/tile, matching
	 * MapViewport's default spritePixelsPerTileX/Y) because its smoke deposits are
	 * plane sprite coordinates already in that space. The scalar field overlays
	 * (population/pollution/etc, see scalarFieldOverlay.ts) deliberately size
	 * theirs in raw tile-index units (pixelsPerTile=1) instead -- recomputing a
	 * full RGBA fill + smoothing pass every frame, a 16x-finer buffer would be
	 * ~256x more pixels for no visual benefit at this zoom level. blitAtmosphericLayer
	 * needs to know which convention a given layer uses to map it to screen correctly.
	 */
	pixelsPerTile: number;
}

const layers = new Map<string, LayerEntry>();

export function getOrCreateAtmosphericLayer(
	id: string,
	worldWidth: number,
	worldHeight: number,
	opts?: { blend?: LayerBlendMode; animate?: boolean; flow?: number; fade?: number; pixelsPerTile?: number },
): AtmosphericLayer {
	let entry = layers.get(id);
	if (!entry) {
		entry = {
			layer: new AtmosphericLayer(id, {
				worldWidth,
				worldHeight,
				scale: 2,
				flow: opts?.flow ?? 0.4,
				fade: opts?.fade ?? 0.988,
			}),
			blend: opts?.blend ?? 'source-over',
			animate: opts?.animate ?? true,
			// Default matches MapViewport's spritePixelsPerTileX/Y default (16) --
			// i.e. every pre-existing caller (skywriting) keeps its current behavior
			// unchanged unless it opts into a different convention.
			pixelsPerTile: opts?.pixelsPerTile ?? 16,
		};
		layers.set(id, entry);
	}
	return entry.layer;
}

export function getAtmosphericLayer(id: string): AtmosphericLayer | undefined {
	return layers.get(id)?.layer;
}

export function removeAtmosphericLayer(id: string): void {
	layers.delete(id);
}

export function setLayerBlend(id: string, blend: LayerBlendMode): void {
	const entry = layers.get(id);
	if (entry) entry.blend = blend;
}

/**
 * Blit layer region visible in viewport to target 2d context (screen space).
 * `pixelsPerTile` converts tile-index space (the common frame every viewport
 * agrees on) to this specific layer's own worldWidth/worldHeight units -- see
 * the LayerEntry doc comment above for why that isn't the same for every
 * layer. Defaults to 16 (engine sprite-pixel space) to match every call site
 * that predates this parameter.
 */
export function blitAtmosphericLayer(
	ctx: CanvasRenderingContext2D,
	layer: AtmosphericLayer,
	viewport: MapViewport,
	blend: LayerBlendMode = 'source-over',
	pixelsPerTile = 16,
): void {
	const srcCanvas = layer.getCanvas();
	const tlTile = viewport.screenToWorldTile([0, 0]);
	const brTile = viewport.screenToWorldTile([viewport.screenWidth, viewport.screenHeight]);
	const tl: [number, number] = [tlTile[0] * pixelsPerTile, tlTile[1] * pixelsPerTile];
	const br: [number, number] = [brTile[0] * pixelsPerTile, brTile[1] * pixelsPerTile];

	const wx0 = Math.max(0, Math.min(tl[0], br[0]));
	const wy0 = Math.max(0, Math.min(tl[1], br[1]));
	const wx1 = Math.min(layer.worldWidth, Math.max(tl[0], br[0]));
	const wy1 = Math.min(layer.worldHeight, Math.max(tl[1], br[1]));
	if (wx1 <= wx0 || wy1 <= wy0) return;

	const sx = Math.floor(wx0 / layer.scale);
	const sy = Math.floor(wy0 / layer.scale);
	const sw = Math.max(1, Math.ceil((wx1 - wx0) / layer.scale));
	const sh = Math.max(1, Math.ceil((wy1 - wy0) / layer.scale));

	const [dx, dy] = viewport.worldTileToScreen([wx0 / pixelsPerTile, wy0 / pixelsPerTile]);
	const [dx2, dy2] = viewport.worldTileToScreen([wx1 / pixelsPerTile, wy1 / pixelsPerTile]);
	const dw = dx2 - dx;
	const dh = dy2 - dy;

	ctx.save();
	ctx.globalCompositeOperation = blend;
	ctx.drawImage(srcCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
	ctx.restore();
}

export function stepAllAtmosphericLayers(): void {
	for (const entry of layers.values()) {
		if (entry.animate) entry.layer.step();
	}
}

export function listAtmosphericLayerIds(): string[] {
	return [...layers.keys()];
}

export function getLayerBlend(id: string): LayerBlendMode {
	return layers.get(id)?.blend ?? 'source-over';
}

export function getLayerPixelsPerTile(id: string): number {
	return layers.get(id)?.pixelsPerTile ?? 16;
}

export function isLayerAnimated(id: string): boolean {
	return layers.get(id)?.animate ?? true;
}
