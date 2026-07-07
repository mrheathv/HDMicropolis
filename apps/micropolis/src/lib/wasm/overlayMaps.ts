/**
 * Extracts classic SimCity "Zoom" overlay data (population density, traffic, pollution,
 * crime, land value, rate of growth, power grid) from the WASM heap.
 *
 * Engine `Map<DATA,BLKSIZE>` buffers are stored column-major (index = x * mapHeight + y,
 * see map_type.h). Consumers here (AtmosphericLayer.fillFromTileGrid) expect row-major
 * (index = y * mapWidth + x), so extraction transposes.
 */
import type { Micropolis, MainModule } from '../../types/micropolisengine.d.js';
import { heapU8FromEmscriptenModule, heapI16FromEmscriptenModule } from './heap';

export type OverlayMapId =
	| 'population'
	| 'traffic'
	| 'pollution'
	| 'crime'
	| 'landValue'
	| 'rateOfGrowth'
	| 'power';

export interface OverlayGrid {
	/** Row-major (y * mapWidth + x), one entry per map cell. */
	values: Float64Array;
	mapWidth: number;
	mapHeight: number;
	/**
	 * Span of one map cell in **world-tile units** (MapViewport's "world pixel" space is
	 * tile-index units, not engine pixels -- its tileWidth/tileHeight are hardcoded to 1 by
	 * the renderer's syncViewportScreenScale). A Map<DATA,BLKSIZE> cell covers BLKSIZE tiles.
	 */
	tileWidth: number;
	tileHeight: number;
}

function transposeColumnMajor(
	source: ArrayLike<number>,
	byteAddress: number,
	elementSize: number,
	mapWidth: number,
	mapHeight: number,
): Float64Array {
	const base = byteAddress / elementSize;
	const out = new Float64Array(mapWidth * mapHeight);
	for (let x = 0; x < mapWidth; x++) {
		for (let y = 0; y < mapHeight; y++) {
			out[y * mapWidth + x] = source[base + x * mapHeight + y] ?? 0;
		}
	}
	return out;
}

export function extractOverlayGrid(
	engine: MainModule,
	micropolis: Micropolis,
	id: OverlayMapId,
): OverlayGrid | null {
	const worldW = engine.WORLD_W;
	const worldH = engine.WORLD_H;

	if (id === 'power') {
		const heap = heapU8FromEmscriptenModule(engine);
		if (!heap) return null;
		const values = transposeColumnMajor(heap, micropolis.getPowerGridMapAddress(), 1, worldW, worldH);
		return { values, mapWidth: worldW, mapHeight: worldH, tileWidth: 1, tileHeight: 1 };
	}

	if (id === 'rateOfGrowth') {
		const heap = heapI16FromEmscriptenModule(engine);
		if (!heap) return null;
		const mapWidth = engine.WORLD_W_8;
		const mapHeight = engine.WORLD_H_8;
		const values = transposeColumnMajor(heap, micropolis.getRateOfGrowthMapAddress(), 2, mapWidth, mapHeight);
		for (let i = 0; i < values.length; i++) values[i] = Math.abs(values[i]);
		const scale = Math.round(worldW / mapWidth);
		return { values, mapWidth, mapHeight, tileWidth: scale, tileHeight: scale };
	}

	const heap = heapU8FromEmscriptenModule(engine);
	if (!heap) return null;
	const mapWidth = engine.WORLD_W_2;
	const mapHeight = engine.WORLD_H_2;
	const scale = Math.round(worldW / mapWidth);
	const tileWidth = scale;
	const tileHeight = scale;

	switch (id) {
		case 'population':
			return {
				values: transposeColumnMajor(heap, micropolis.getPopulationDensityMapAddress(), 1, mapWidth, mapHeight),
				mapWidth,
				mapHeight,
				tileWidth,
				tileHeight,
			};
		case 'traffic':
			return {
				values: transposeColumnMajor(heap, micropolis.getTrafficDensityMapAddress(), 1, mapWidth, mapHeight),
				mapWidth,
				mapHeight,
				tileWidth,
				tileHeight,
			};
		case 'pollution':
			return {
				values: transposeColumnMajor(heap, micropolis.getPollutionDensityMapAddress(), 1, mapWidth, mapHeight),
				mapWidth,
				mapHeight,
				tileWidth,
				tileHeight,
			};
		case 'crime':
			return {
				values: transposeColumnMajor(heap, micropolis.getCrimeRateMapAddress(), 1, mapWidth, mapHeight),
				mapWidth,
				mapHeight,
				tileWidth,
				tileHeight,
			};
		case 'landValue':
			return {
				values: transposeColumnMajor(heap, micropolis.getLandValueMapAddress(), 1, mapWidth, mapHeight),
				mapWidth,
				mapHeight,
				tileWidth,
				tileHeight,
			};
		default:
			return null;
	}
}
