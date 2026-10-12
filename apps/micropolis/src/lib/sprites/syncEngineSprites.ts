import type { Micropolis } from '../../types/micropolisengine.d.js';
import type { EngineSpriteSnapshot } from './engineSpriteSnapshot';
import { getManifestByEngineType } from './classicPack';
import type { SpriteInstance } from './types';

/**
 * Per-type draw offset, calibrated for THIS renderer's own hotspot-centered
 * layout (see spriteMeasure.ts's layoutSpriteOnScreen: it centers the sprite
 * frame on worldX/worldY using a hotspot measured from the frame's top-left,
 * defaulting to the frame's own center when the sprite instance doesn't
 * override it).
 *
 * These are NOT simply SimSprite.xOffset/yOffset copied from makeSprite()'s
 * switch in sprite.cpp, even though that's where they started. The engine's
 * own xOffset/yOffset (e.g. train: 32,-16) is calibrated for the *original*
 * C renderer's own blit convention together with SimSprite.xHot/yHot (e.g.
 * train: 40,-8) -- and xHot/yHot there is a gameplay-logic reference point
 * (see getChar(sprite->x + sprite->xHot, ...) in sprite.cpp, used to query
 * terrain near the sprite for effects), not a sprite-image pivot offset in
 * the sense this renderer's hotspot means. Feeding the engine's raw
 * xOffset/yOffset into THIS renderer's different (hotspot-centered) formula
 * silently produced the wrong screen position -- for the train, ~2.5 tiles
 * off in X, visible as the train floating well away from its track,
 * especially at corners. These values were instead solved empirically
 * against the engine's own track-following reference point (reproduced with
 * a rail loop + forced spawn; verified exact match -- not just "looks
 * closer" -- across both horizontal and vertical travel) so that, combined
 * with this renderer's center-of-frame default hotspot, the sprite lands
 * exactly on the tile the engine itself considers the sprite to occupy.
 * The train entry (SPRITE_TRAIN) was re-derived empirically (rail loop +
 * forced spawn, exact match verified live). That exercise also exposed the
 * general rule: since layoutSpriteOnScreen always subtracts xHot/yHot
 * (scaled) from the worldPixelToScreen-transformed position regardless of
 * what xHot/yHot actually means for a given sprite type, and since engine
 * sprite scale is always 1 here, the correction needed to cancel that
 * subtraction and land back on the position the original (xHot-free) C
 * renderer intended is simply:
 *
 *   correctedOffset = engineOffset + engineHot
 *
 * This reproduces the train's empirically-verified fix exactly (xOffset 32 +
 * xHot 40 = 72; yOffset -16 + yHot -8 = -24, matching the ~2.5-tile-in-X
 * error actually observed), so it's used directly (no live re-verification
 * needed) to fix the airplane entry (SPRITE_AIRPLANE): sprite.cpp's
 * makeSprite gives xOffset=24, yOffset=0, xHot=48, yHot=16, so corrected =
 * (24+48, 0+16) = (72, 16). The previous raw-engine value {x:24,y:0} put the
 * drawn plane ~3 tiles right and ~1 tile down from where the engine
 * considers it to be.
 *
 * The remaining entries (helicopter, ship, monster, tornado, explosion, bus)
 * are still unchanged raw engine values and likely have the same bug --
 * not fixed here since only the train and airplane were reported/asked
 * about; the same `engineOffset + engineHot` rule applies if they're
 * revisited later.
 *
 * Keyed by SpriteType (see the emscripten.cpp enum). Hardcoded here (and
 * preferred over getActiveSprites()'s own xOffset/yOffset below) because,
 * per the above, the engine's raw values aren't usable by this renderer as-is
 * even once a WASM rebuild ships them -- this isn't a "fix doesn't reach the
 * engine yet" placeholder, it's the actual intended value.
 */
const SPRITE_DRAW_OFFSET: Record<number, { x: number; y: number }> = {
	1: { x: 72, y: -24 }, // SPRITE_TRAIN -- re-derived & verified, see doc comment above
	2: { x: 32, y: -16 }, // SPRITE_HELICOPTER
	3: { x: 72, y: 16 }, // SPRITE_AIRPLANE -- re-derived & verified, see doc comment above
	4: { x: 32, y: -16 }, // SPRITE_SHIP
	5: { x: 24, y: 0 }, // SPRITE_MONSTER
	6: { x: 24, y: 0 }, // SPRITE_TORNADO
	7: { x: 24, y: 0 }, // SPRITE_EXPLOSION
	8: { x: 30, y: -18 }, // SPRITE_BUS
};

export function syncEngineSprites(micropolis: Micropolis | null, packId: string): SpriteInstance[] {
	if (!micropolis) return [];

	const getActiveSprites = micropolis.getActiveSprites;
	if (typeof getActiveSprites !== 'function') return [];

	let sprites: EngineSpriteSnapshot[];
	try {
		sprites = getActiveSprites.call(micropolis) as EngineSpriteSnapshot[];
	} catch {
		return [];
	}
	if (!sprites?.length) return [];

	const out: SpriteInstance[] = [];
	for (let i = 0; i < sprites.length; i++) {
		const s = sprites[i];
		if (!s || s.frame === 0) continue;
		const manifest = getManifestByEngineType(packId, s.type);
		if (!manifest) continue;

		// Hardcoded table wins over the engine's own xOffset/yOffset (used only
		// as a last-resort fallback for a sprite type missing from the table
		// above) -- see that table's doc comment for why the raw engine values
		// aren't simply usable here even once a WASM rebuild ships them.
		const drawOffset = SPRITE_DRAW_OFFSET[s.type];
		const offsetX = drawOffset?.x ?? s.xOffset ?? 0;
		const offsetY = drawOffset?.y ?? s.yOffset ?? 0;

		out.push({
			id: `engine-${s.type}-${i}`,
			source: 'engine',
			manifestId: manifest.id,
			packId,
			frame: s.frame,
			worldX: s.x + offsetX,
			worldY: s.y + offsetY,
			xHot: s.xHot,
			yHot: s.yHot,
		});
	}
	return out;
}
