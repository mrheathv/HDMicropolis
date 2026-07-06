// One-off asset tool: xBRZ-upscale the classic Micropolis tile atlas into a
// higher-resolution placeholder atlas for the HD renderer work.
//
// xBRZ (GPL-3, via xbrz-js) is an edge-detecting pixel-art upscaler: it
// preserves hard pixel-art silhouettes while smoothing diagonal/curved edges,
// unlike a plain nearest-neighbor stretch (which just makes bigger blocky
// pixels) or a blur/bicubic resize (which would muddy the flat-color look).
//
// Run with: node upscale.mjs <src.png> <dst.png> [scale=4] [tileSize=16]
//
// Each srcTileSize x srcTileSize cell in the atlas is upscaled independently
// (not the atlas as a whole) so xBRZ's edge detection never blends pixels
// across unrelated adjacent tiles.
import { PNG } from 'pngjs';
import sharp from 'sharp';
import fs from 'node:fs';
import { xbrzScale, xbrzColorFormat } from 'xbrz-js';

const [, , srcPath, dstPath, scaleArg, tileSizeArg] = process.argv;
if (!srcPath || !dstPath) {
	console.error('Usage: node upscale.mjs <src.png> <dst.png> [scale=4] [tileSize=16]');
	process.exit(1);
}
const scale = parseInt(scaleArg || '4', 10);
const tileSize = parseInt(tileSizeArg || '16', 10);

const srcBuf = fs.readFileSync(srcPath);
const png = PNG.sync.read(srcBuf);
const { width, height, data } = png; // RGBA, row-major, top-to-bottom

if (width % tileSize !== 0 || height % tileSize !== 0) {
	console.error(`Atlas ${width}x${height} is not divisible by tileSize ${tileSize}`);
	process.exit(1);
}

const cols = width / tileSize;
const rows = height / tileSize;
const outTile = tileSize * scale;
const outWidth = width * scale;
const outHeight = height * scale;

const out = new PNG({ width: outWidth, height: outHeight });
const srcTile = new Uint32Array(tileSize * tileSize);
const dstTile = new Uint32Array(outTile * outTile);

function readTile(col, row) {
	const baseX = col * tileSize;
	const baseY = row * tileSize;
	for (let y = 0; y < tileSize; y++) {
		const rowOffset = ((baseY + y) * width + baseX) * 4;
		for (let x = 0; x < tileSize; x++) {
			const o = rowOffset + x * 4;
			srcTile[y * tileSize + x] = data[o] | (data[o + 1] << 8) | (data[o + 2] << 16) | (data[o + 3] << 24);
		}
	}
}

function writeTile(col, row) {
	const baseX = col * outTile;
	const baseY = row * outTile;
	for (let y = 0; y < outTile; y++) {
		const rowOffset = ((baseY + y) * outWidth + baseX) * 4;
		for (let x = 0; x < outTile; x++) {
			const px = dstTile[y * outTile + x];
			const o = rowOffset + x * 4;
			out.data[o] = px & 0xff;
			out.data[o + 1] = (px >>> 8) & 0xff;
			out.data[o + 2] = (px >>> 16) & 0xff;
			out.data[o + 3] = (px >>> 24) & 0xff;
		}
	}
}

let count = 0;
for (let row = 0; row < rows; row++) {
	for (let col = 0; col < cols; col++) {
		readTile(col, row);
		xbrzScale(scale, srcTile, dstTile, tileSize, tileSize, xbrzColorFormat.argb);
		writeTile(col, row);
		count++;
	}
}

const rgba = PNG.sync.write(out);
// Re-encode as a palette PNG: this art has a small, flat color palette even
// after upscaling, so palette mode shrinks the file ~4x with no visible loss.
await sharp(rgba, { limitInputPixels: false })
	.png({ palette: true, compressionLevel: 9 })
	.toFile(dstPath);

console.log(`Upscaled ${count} tiles (${cols}x${rows} grid) from ${width}x${height} -> ${outWidth}x${outHeight}`);
console.log(`Wrote ${dstPath}`);
