import type { SpriteAtlasManifest, ResolvedSpriteAtlas } from './types';

import airplane from './manifests/classic/airplane.json';
import helicopter from './manifests/classic/helicopter.json';
import train from './manifests/classic/train.json';
import ship from './manifests/classic/ship.json';
import monster from './manifests/classic/monster.json';
import tornado from './manifests/classic/tornado.json';
import explosion from './manifests/classic/explosion.json';

// 4x xBRZ-upscaled placeholder HD sprite sheets (see tools/tileset-upscale) --
// same algorithmic-upscale approach as the all-hd4x.png tile atlas. Manifests
// reference these by their -hd4x.png names; frame/atlas coordinates in the
// JSON are scaled to match (see each manifest's frameWidth/sheetWidth).
import sheetAirplane from '$lib/images/tilesets/classic-sprite-plane-hd4x.png';
import sheetHelicopter from '$lib/images/tilesets/classic-sprite-chopper-hd4x.png';
import sheetTrain from '$lib/images/tilesets/classic-sprite-train-hd4x.png';
import sheetShip from '$lib/images/tilesets/classic-sprite-ship-hd4x.png';
import sheetMonster from '$lib/images/tilesets/classic-sprite-monster-hd4x.png';
import sheetTornado from '$lib/images/tilesets/classic-sprite-tornado-hd4x.png';
import sheetExplosion from '$lib/images/tilesets/classic-sprite-explode-hd4x.png';

const SHEET_URLS: Record<string, string> = {
	'classic-sprite-plane-hd4x.png': sheetAirplane,
	'classic-sprite-chopper-hd4x.png': sheetHelicopter,
	'classic-sprite-train-hd4x.png': sheetTrain,
	'classic-sprite-ship-hd4x.png': sheetShip,
	'classic-sprite-monster-hd4x.png': sheetMonster,
	'classic-sprite-tornado-hd4x.png': sheetTornado,
	'classic-sprite-explode-hd4x.png': sheetExplosion,
};

const CLASSIC_MANIFESTS: SpriteAtlasManifest[] = [
	airplane as SpriteAtlasManifest,
	helicopter as SpriteAtlasManifest,
	train as SpriteAtlasManifest,
	ship as SpriteAtlasManifest,
	monster as SpriteAtlasManifest,
	tornado as SpriteAtlasManifest,
	explosion as SpriteAtlasManifest,
];

function resolve(m: SpriteAtlasManifest): ResolvedSpriteAtlas {
	const sheetUrl = m.sheet ? (SHEET_URLS[m.sheet] ?? m.sheet) : '';
	return { ...m, sheetUrl };
}

const RESOLVED_CLASSIC = CLASSIC_MANIFESTS.map(resolve);

export const ENGINE_TYPE_TO_MANIFEST_ID: Record<number, string> = Object.fromEntries(
	CLASSIC_MANIFESTS.filter((m) => m.engineType != null).map((m) => [m.engineType!, m.id]),
);

export function getManifest(packId: string, manifestId: string): ResolvedSpriteAtlas | null {
	if (packId !== 'classic') return null;
	return RESOLVED_CLASSIC.find((m) => m.id === manifestId) ?? null;
}

export function getManifestByEngineType(packId: string, engineType: number): ResolvedSpriteAtlas | null {
	const id = ENGINE_TYPE_TO_MANIFEST_ID[engineType];
	return id ? getManifest(packId, id) : null;
}

export function listClassicManifests(): ResolvedSpriteAtlas[] {
	return RESOLVED_CLASSIC;
}

/** Procedural smoke puff — no sheet; rendered as SVG circle. */
export function smokePuffManifest(): ResolvedSpriteAtlas {
	return {
		schema_version: 1,
		id: 'smoke-puff',
		sheetUrl: '',
		frameWidth: 16,
		frameHeight: 16,
		frames: [{ index: 0, atlas: { x: 0, y: 0 } }],
		defaultMeasurements: {
			hotspot: { kind: 'attachment', x: 8, y: 8 },
		},
	};
}
