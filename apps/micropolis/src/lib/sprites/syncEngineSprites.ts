import type { Micropolis } from '../../types/micropolisengine.d.js';
import type { EngineSpriteSnapshot } from './engineSpriteSnapshot';
import { getManifestByEngineType } from './classicPack';
import type { SpriteInstance } from './types';

/**
 * Per-type draw offset, copied from makeSprite()'s switch in sprite.cpp
 * (SimSprite.xOffset/yOffset). The engine's own x/y is a track-following or
 * collision reference point, not the visual position -- e.g. a train's is
 * offset ~2.4 tiles from where it's actually drawn -- so this is required,
 * not cosmetic. Keyed by SpriteType (see the emscripten.cpp enum).
 * Hardcoded here (rather than only reading getActiveSprites()'s own
 * xOffset/yOffset, added alongside this) because these never change at
 * runtime and this way the fix doesn't wait on an engine rebuild.
 */
const SPRITE_DRAW_OFFSET: Record<number, { x: number; y: number }> = {
	1: { x: 32, y: -16 }, // SPRITE_TRAIN
	2: { x: 32, y: -16 }, // SPRITE_HELICOPTER
	3: { x: 24, y: 0 }, // SPRITE_AIRPLANE
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

		const drawOffset = SPRITE_DRAW_OFFSET[s.type];
		const offsetX = s.xOffset ?? drawOffset?.x ?? 0;
		const offsetY = s.yOffset ?? drawOffset?.y ?? 0;

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
