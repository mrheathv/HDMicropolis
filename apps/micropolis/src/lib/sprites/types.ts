/** Sprite atlas + instance types for DOM overlay and future holodeck parity. */

export type MeasureAttachmentKind = 'attachment' | 'bounds' | 'point';

export interface SpriteMeasurementDef {
	kind: MeasureAttachmentKind;
	x: number;
	y: number;
}

export interface SpriteFrameDef {
	index: number;
	atlas: { x: number; y: number };
	measurements?: Record<string, SpriteMeasurementDef>;
}

export interface SpriteAtlasManifest {
	schema_version: 1;
	id: string;
	/** C++ SimSprite.type when sourced from engine; omitted for plugin-only sprites. */
	engineType?: number;
	sheet?: string;
	/**
	 * Sprite footprint in the engine's own sprite-pixel space (16 engine-px/
	 * tile, matches SimSprite.x/y) -- this is what spriteMeasure.ts uses to
	 * size the sprite's drawn footprint on the map, and it must NOT change
	 * just because a higher-resolution sheet image is swapped in, or the
	 * sprite would render at the wrong world size.
	 */
	frameWidth: number;
	frameHeight: number;
	/**
	 * Real pixel dimensions of the sheet image named by `sheet`. Required for
	 * correct CSS background-size math in Sprite.svelte -- inferring it from
	 * frames[].atlas.x is unsafe: a manifest's frame list doesn't have to name
	 * every frame the sheet contains (or, if a frame list runs past the
	 * sheet's real edge, it doesn't have to stay within it either), so a
	 * frame-derived width can end up narrower or wider than the actual image
	 * and cause it to be scaled and tiled instead of cropped to one frame.
	 */
	sheetWidth?: number;
	sheetHeight?: number;
	/**
	 * Raw pixel size of one frame cell in the sheet image, for the
	 * atlas.x/atlas.y addressing math -- decoupled from frameWidth/frameHeight
	 * so an upscaled sheet (e.g. a 4x xBRZ placeholder HD atlas) can be
	 * addressed in its own raw-pixel coordinates while frameWidth/frameHeight
	 * keep describing the unchanged world footprint. Defaults to
	 * frameWidth/frameHeight when the sheet is authored 1:1 with engine pixels.
	 */
	atlasFrameWidth?: number;
	atlasFrameHeight?: number;
	frames: SpriteFrameDef[];
	/** Default measurements when a frame omits them. */
	defaultMeasurements?: Record<string, SpriteMeasurementDef>;
}

export interface ResolvedSpriteAtlas extends SpriteAtlasManifest {
	sheetUrl: string;
}

export type SpriteInstanceSource = 'engine' | 'plugin';

/** One drawable sprite — engine sync or plugin controller. */
export interface SpriteInstance {
	id: string;
	source: SpriteInstanceSource;
	manifestId: string;
	packId: string;
	frame: number;
	/** Hotspot / anchor in engine world-pixel space (matches SimSprite x/y). */
	worldX: number;
	worldY: number;
	/** Override manifest hotspot; engine sprites pass SimSprite xHot/yHot. */
	xHot?: number;
	yHot?: number;
	opacity?: number;
	scale?: number;
	/** CSS color for procedural smoke-puff sprites. */
	tint?: string;
	/** Heading radians — plugin sprites (skywriting airplane). */
	heading?: number;
	zIndex?: number;
}

/** Procedural manifest ids (no sheet PNG). */
export const PROCEDURAL_SMOKE_PUFF = 'smoke-puff';

export interface SpriteAttachmentScreen {
	id: string;
	x: number;
	y: number;
}

export interface SpriteScreenLayout {
	bounds: { x: number; y: number; w: number; h: number };
	attachments: SpriteAttachmentScreen[];
}
