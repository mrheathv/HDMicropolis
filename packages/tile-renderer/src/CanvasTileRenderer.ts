import { TileRenderer, type ResolvedTileLayerSpec, type TileLayerSource } from './TileRenderer';
import {
	defaultMicropolisMapRenderDescription,
	renderMicropolisMapSoftware,
	type TileAtlas,
} from '@micropolis/render-core';

class CanvasTileRenderer extends TileRenderer<CanvasRenderingContext2D> {
	private atlases: Array<TileAtlas | null> = [];
	private vignetteGradient: CanvasGradient | null = null;
	private vignetteWidth = 0;
	private vignetteHeight = 0;

	async initialize(
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D,
		mapData: Uint16Array,
		mopData: Uint16Array,
		mapWidth: number,
		mapHeight: number,
		tileWidth: number,
		tileHeight: number,
		tileTextureURLs: TileLayerSource[]
	): Promise<void> {
		await super.initialize(canvas, context, mapData, mopData, mapWidth, mapHeight, tileWidth, tileHeight, tileTextureURLs);
		this.context = context;
		this.zoom = 1;
		this.atlases = await Promise.all(
			this.tileLayers.map((layer) =>
				layer.url
					? loadTileAtlas(layer)
					: null
			)
		);
	}

	render(): void {
		if (!this.canvas || !this.context) {
			throw new Error('CanvasTileRenderer requires an initialized canvas and 2D context.');
		}

		const atlas = this.atlases[this.tileLayer] ?? this.atlases.find((candidate) => candidate !== null);
		if (!atlas) {
			return;
		}

        this.syncViewportScreenScale(false);

		const description = defaultMicropolisMapRenderDescription({
			renderer: 'canvas',
			output: {
				format: 'rgba8',
				width: this.canvas.width,
				height: this.canvas.height
			},
			map: {
				width: this.mapWidth,
				height: this.mapHeight,
				tile_width: this.tileWidth,
				tile_height: this.tileHeight,
				tileset_url: this.tileTextureURLs?.[this.tileLayer] ?? undefined
			},
			viewport: {
				width: this.canvas.width,
				height: this.canvas.height,
				centerX: this.panX,
				centerY: this.panY,
				// WebGLTileRenderer historically uses 4 * zoom in its screen-tile
				// mapping. Keep Canvas2D visually comparable while still delegating
				// all pixel sampling to the shared software renderer.
				zoom: 4 * this.zoom
			}
		});

		this.context.imageSmoothingEnabled = !['pixel', 'nearest'].includes(atlas.sampling ?? 'pixel');
		const image = renderMicropolisMapSoftware(description, this.mapData, atlas, this.mopData);
		const pixels = new Uint8ClampedArray(image.data);
		this.context.putImageData(new ImageData(pixels, image.width, image.height), 0, 0);
		this.drawVignette();
	}

	/**
	 * Cheap HD-polish pass: a soft radial vignette composited on top of the
	 * shared software raster. Deliberately kept out of `renderMicropolisMapSoftware`
	 * itself so Node/CI/server exports stay pixel-identical to the reference
	 * renderer -- this is purely a client-side presentation layer.
	 */
	private drawVignette(): void {
		if (!this.context || !this.canvas) return;
		const { width, height } = this.canvas;
		if (width <= 0 || height <= 0) return;

		if (!this.vignetteGradient || this.vignetteWidth !== width || this.vignetteHeight !== height) {
			const cx = width / 2;
			const cy = height / 2;
			const outerRadius = Math.sqrt(cx * cx + cy * cy);
			const gradient = this.context.createRadialGradient(cx, cy, outerRadius * 0.55, cx, cy, outerRadius);
			gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
			gradient.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
			this.vignetteGradient = gradient;
			this.vignetteWidth = width;
			this.vignetteHeight = height;
		}

		this.context.save();
		this.context.globalCompositeOperation = 'multiply';
		this.context.fillStyle = this.vignetteGradient;
		this.context.fillRect(0, 0, width, height);
		this.context.restore();
	}
}

async function loadTileAtlas(layer: ResolvedTileLayerSpec): Promise<TileAtlas> {
	const image = await loadImage(layer.url!);
	const canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not create temporary 2D context for tile atlas.');
	}
	context.drawImage(image, 0, 0);
	const imageData = context.getImageData(0, 0, image.width, image.height);
	return {
		width: image.width,
		height: image.height,
		atlasX: layer.atlasX,
		atlasY: layer.atlasY,
		atlasWidth: layer.atlasWidth,
		atlasHeight: layer.atlasHeight,
		tileWidth: layer.tileWidth,
		tileHeight: layer.tileHeight,
		strideX: layer.strideX,
		strideY: layer.strideY,
		tileCount: layer.tileCount,
		tilesPerSet: layer.tilesPerSet,
		pixelAspectX: layer.pixelAspectX,
		pixelAspectY: layer.pixelAspectY,
		sampling: layer.sampling,
		mipmaps: layer.mipmaps,
		gutterX: layer.gutterX,
		gutterY: layer.gutterY,
		wrap: layer.wrap,
		blend: layer.blend,
		opacity: layer.opacity,
		tint: layer.tint,
		data: imageData.data
	};
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Failed to load tile atlas: ${url}`));
		image.src = url;
	});
}

export { TileRenderer, CanvasTileRenderer };
