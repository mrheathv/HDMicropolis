/**
 * Scalar field overlays (pollution, population, crime, …) on the shared raster layer stack.
 * Data: engine map buffers (e.g. getPollutionDensityMapBuffer) or mop/heap views.
 */
import type { MainModule, Micropolis } from '../../../types/micropolisengine.d.js';
import { extractOverlayGrid, type OverlayMapId } from '../../wasm/overlayMaps';
import type { ColormapFn } from './AtmosphericLayer';
import { getOrCreateAtmosphericLayer, removeAtmosphericLayer } from './layerRegistry';
import type { OverlayColormapId } from './overlayColormaps';
import { OVERLAY_COLORMAPS } from './overlayColormaps';

export interface ScalarOverlayOptions {
	worldWidth: number;
	worldHeight: number;
	mapWidth: number;
	mapHeight: number;
	tileWidth?: number;
	tileHeight?: number;
	colormap?: ColormapFn | OverlayColormapId;
	smoothSteps?: number;
	blend?: GlobalCompositeOperation;
}

export function updateScalarOverlayLayer(
	layerId: string,
	values: ArrayLike<number>,
	options: ScalarOverlayOptions,
): void {
	const colormap =
		typeof options.colormap === 'string'
			? OVERLAY_COLORMAPS[options.colormap]
			: (options.colormap ?? OVERLAY_COLORMAPS.pollution);

	const layer = getOrCreateAtmosphericLayer(layerId, options.worldWidth, options.worldHeight, {
		blend: options.blend ?? 'multiply',
		animate: false,
		flow: 0.55,
	});

	layer.fillFromTileGrid(
		values,
		options.mapWidth,
		options.mapHeight,
		colormap,
		options.tileWidth ?? 16,
		options.tileHeight ?? 16,
	);
	layer.smooth(options.smoothSteps ?? 2);
}

/** Standard MOP / color-map layer ids (align with MapOverlayLayerSpec). */
export const SCALAR_OVERLAY_IDS = {
	pollution: 'mop.pollution',
	population: 'mop.population',
	crime: 'mop.crime',
	landValue: 'mop.land-value',
	traffic: 'mop.traffic',
	rateOfGrowth: 'mop.rate-of-growth',
	power: 'mop.power',
} as const;

/**
 * Reconciles the raster layer stack against the currently selected classic "Zoom" overlay:
 * removes every other MOP layer, then (unless 'none') re-extracts fresh engine data and
 * repaints the active one. Cheap enough to call every animation frame.
 */
export function applyActiveOverlay(
	engine: MainModule | null,
	micropolis: Micropolis | null,
	activeId: OverlayMapId | 'none',
): void {
	for (const key of Object.keys(SCALAR_OVERLAY_IDS) as OverlayMapId[]) {
		if (key !== activeId) removeAtmosphericLayer(SCALAR_OVERLAY_IDS[key]);
	}
	if (activeId === 'none' || !engine || !micropolis) return;

	const grid = extractOverlayGrid(engine, micropolis, activeId);
	if (!grid) return;

	updateScalarOverlayLayer(SCALAR_OVERLAY_IDS[activeId], grid.values, {
		worldWidth: engine.WORLD_W * engine.EDITOR_TILE_SIZE,
		worldHeight: engine.WORLD_H * engine.EDITOR_TILE_SIZE,
		mapWidth: grid.mapWidth,
		mapHeight: grid.mapHeight,
		tileWidth: grid.tileWidth,
		tileHeight: grid.tileHeight,
		colormap: activeId,
	});
}
