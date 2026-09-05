/** Plain snapshot from Micropolis.getActiveSprites() — not Embind class handles. */
export interface EngineSpriteSnapshot {
	type: number;
	frame: number;
	x: number;
	y: number;
	xHot: number;
	yHot: number;
	/**
	 * Per-type draw offset set once in makeSprite() (e.g. train's {32,-16}) --
	 * the classic engine's own x/y aren't the sprite's visual position, they're
	 * a track-following/collision reference point; xOffset/yOffset is what the
	 * original view layer added to get the drawn position. Optional because an
	 * older engine build (pre this binding) won't send it -- treat as 0 then.
	 */
	xOffset?: number;
	yOffset?: number;
}
