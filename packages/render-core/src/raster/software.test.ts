import { describe, expect, it } from 'vitest';
import { defaultMicropolisMapRenderDescription } from '../schema/description.js';
import { renderMicropolisMapSoftware, type TileAtlas } from './software.js';

function solidAtlas(): TileAtlas {
	const data = new Uint8ClampedArray(2 * 1 * 4);
	data.set([255, 0, 0, 255], 0);
	data.set([0, 0, 255, 255], 4);
	return {
		width: 2,
		height: 1,
		tileWidth: 1,
		tileHeight: 1,
		data
	};
}

describe('software Micropolis renderer', () => {
	it('samples output pixels through the map and tile atlas', () => {
		const description = defaultMicropolisMapRenderDescription({
			output: { format: 'rgba8', width: 2, height: 1 },
			map: { width: 2, height: 1, tile_width: 1, tile_height: 1 },
			viewport: { width: 2, height: 1, centerX: 1, centerY: 0.5, zoom: 1 }
		});
		const image = renderMicropolisMapSoftware(description, new Uint16Array([0, 1]), solidAtlas());

		expect([...image.data]).toEqual([255, 0, 0, 255, 0, 0, 255, 255]);
	});

	it('supports source tile size independent of atlas stride and per-tile mop sets', () => {
		const description = defaultMicropolisMapRenderDescription({
			output: { format: 'rgba8', width: 1, height: 1 },
			map: { width: 1, height: 1, tile_width: 2, tile_height: 2 },
			viewport: { width: 1, height: 1, centerX: 0.25, centerY: 0.25, zoom: 1 }
		});
		const atlas = new Uint8ClampedArray(1 * 4 * 4);
		atlas.set([255, 0, 0, 255], 0);
		atlas.set([0, 0, 0, 0], 4);
		atlas.set([0, 255, 0, 255], 8);
		const image = renderMicropolisMapSoftware(
			description,
			new Uint16Array([0]),
			{ width: 1, height: 4, tileWidth: 1, tileHeight: 1, strideX: 1, strideY: 2, tilesPerSet: 1, data: atlas },
			new Uint16Array([1])
		);

		expect([...image.data]).toEqual([0, 255, 0, 255]);
	});

	describe('unpowered-zone blink', () => {
		const ZONEBIT = 0x0400;
		const PWRBIT = 0x8000;

		// 4-tile atlas relying on the default 'repeat' wrap: tile id 827
		// (LIGHTNINGBOLT) wraps down to slot 3 (827 % 4 === 3), so a tiny atlas
		// can still distinguish "normal tile 0" from "the lightning glyph".
		function fourTileAtlas(): TileAtlas {
			const data = new Uint8ClampedArray(4 * 1 * 4);
			data.set([255, 0, 0, 255], 0); // slot 0: the zone's normal tile
			data.set([0, 0, 0, 0], 4); // slot 1: unused
			data.set([0, 0, 0, 0], 8); // slot 2: unused
			data.set([255, 255, 0, 255], 12); // slot 3: stands in for LIGHTNINGBOLT (827 % 4)
			return { width: 4, height: 1, tileWidth: 1, tileHeight: 1, data };
		}

		const description = defaultMicropolisMapRenderDescription({
			output: { format: 'rgba8', width: 1, height: 1 },
			map: { width: 1, height: 1, tile_width: 1, tile_height: 1 },
			viewport: { width: 1, height: 1, centerX: 0.5, centerY: 0.5, zoom: 1 }
		});

		it('swaps an unpowered zone center tile for the lightning glyph only when blink is on', () => {
			const unpowered = new Uint16Array([ZONEBIT]); // ZONEBIT set, PWRBIT clear, tile id 0

			const blinkOff = renderMicropolisMapSoftware(description, unpowered, fourTileAtlas(), undefined, false);
			expect([...blinkOff.data]).toEqual([255, 0, 0, 255]);

			const blinkOn = renderMicropolisMapSoftware(description, unpowered, fourTileAtlas(), undefined, true);
			expect([...blinkOn.data]).toEqual([255, 255, 0, 255]);
		});

		it('never blinks a zone tile that has power', () => {
			const powered = new Uint16Array([ZONEBIT | PWRBIT]);
			const image = renderMicropolisMapSoftware(description, powered, fourTileAtlas(), undefined, true);
			expect([...image.data]).toEqual([255, 0, 0, 255]);
		});

		it('never blinks a non-zone tile, even lacking power', () => {
			const notAZone = new Uint16Array([0]); // no ZONEBIT, no PWRBIT
			const image = renderMicropolisMapSoftware(description, notAZone, fourTileAtlas(), undefined, true);
			expect([...image.data]).toEqual([255, 0, 0, 255]);
		});

		it('defaults to no blink override when the parameter is omitted', () => {
			const unpowered = new Uint16Array([ZONEBIT]);
			const image = renderMicropolisMapSoftware(description, unpowered, fourTileAtlas());
			expect([...image.data]).toEqual([255, 0, 0, 255]);
		});
	});
});
