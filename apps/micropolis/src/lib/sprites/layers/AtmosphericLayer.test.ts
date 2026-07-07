import { describe, expect, it } from 'vitest';
import { AtmosphericLayer } from './AtmosphericLayer';
import { pollutionColormap } from './overlayColormaps';

describe('AtmosphericLayer', () => {
	it('deposits pigment and diffuses over steps', () => {
		const layer = new AtmosphericLayer('test', {
			worldWidth: 320,
			worldHeight: 240,
			scale: 2,
			flow: 0.5,
			fade: 0.95,
		});
		layer.depositHex(160, 120, '#ff0000', 1, 10);
		const before = layer.getPixelAlpha(80, 60);
		expect(before).toBeGreaterThan(0);
		layer.step();
		layer.step();
		const after = layer.getPixelAlpha(80, 60);
		expect(after).toBeGreaterThan(0);
		expect(after).toBeLessThanOrEqual(before);
	});

	it('fills from tile grid and smooths for heat-map overlays', () => {
		const layer = new AtmosphericLayer('pollution', {
			worldWidth: 320,
			worldHeight: 240,
			scale: 4,
		});
		const values = new Uint8Array(8 * 6);
		values[20] = 200;
		values[21] = 100;
		layer.fillFromTileGrid(values, 8, 6, pollutionColormap, 16, 16);
		layer.smooth(1);
		// values[20] is tile (tx=4, ty=2), which maps to layer pixels x:16-19, y:8-11
		// at this scale/tileWidth -- pick a pixel inside that hot region. (Ramps now go
		// fully transparent at zero intensity, so a distant pixel like (10, 8) is
		// correctly 0 here rather than picking up a fixed alpha floor.)
		expect(layer.getPixelAlpha(17, 9)).toBeGreaterThan(0);
	});
});
