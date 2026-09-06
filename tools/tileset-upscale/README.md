# tileset-upscale

One-off tool that generates the HD placeholder tile atlas used by the web
renderer (`apps/micropolis/src/lib/images/tilesets/all-hd4x.png`) from the
classic 16x16 tile atlas (`apps/micropolis/src/lib/images/tilesets/all.png`),
and the HD placeholder sprite sheets (`classic-sprite-*-hd4x.png`, used by
`apps/micropolis/src/lib/sprites/manifests/classic/*.json`) from the classic
sprite sheets (`classic-sprite-*.png`, one sheet per sprite type: train,
plane, ship, chopper, monster, tornado, explosion).

## What it does

Runs [xBRZ](https://sourceforge.net/projects/xbrz/) (via `xbrz-js`, GPL-3) on
each square frame cell independently (a tile atlas cell, or a sprite sheet's
frame) so xBRZ's edge detection never blends pixels across unrelated
neighbors, producing a 4x version that keeps the original pixel-art
silhouettes crisp while smoothing the diagonal and curved edges that look
blocky when the classic art is just stretched. The result is re-encoded as a
palette PNG (via `sharp`) since this art has a small flat color palette even
after upscaling.

**This is placeholder HD art, not hand-drawn high-resolution art.** It makes
the existing SimCity Classic tile/sprite set (GPL-3, from EA's 2008 OLPC
release — see `documentation/manual/credits.html`) look reasonable at higher
zoom and on high-DPI displays, but it is an algorithmic upscale of 1989-era
low-res art, not new artwork. Swap in real HD art here when available.

## Usage

```sh
cd tools/tileset-upscale
npm install

# Tile atlas (16x16 cells)
node upscale.mjs ../../apps/micropolis/src/lib/images/tilesets/all.png \
  ../../apps/micropolis/src/lib/images/tilesets/all-hd4x.png 4 16

# A sprite sheet (frame size = tileSize arg; classic sheets are one row of
# square frames -- 32px for train/chopper, 48px for the rest)
node upscale.mjs ../../apps/micropolis/src/lib/images/tilesets/classic-sprite-train.png \
  ../../apps/micropolis/src/lib/images/tilesets/classic-sprite-train-hd4x.png 4 32
```

When regenerating a sprite sheet, the consuming manifest
(`apps/micropolis/src/lib/sprites/manifests/classic/*.json`) addresses it via
`atlasFrameWidth`/`atlasFrameHeight`/`sheetWidth`/`sheetHeight`/`frames[].atlas`
in the sheet's own raw pixel coordinates (4x the original) -- `frameWidth`/
`frameHeight` are a separate field and must stay at the original value, since
that's the sprite's footprint in engine world-pixel space, not a pixel count
in this image.

Not part of the pnpm workspace (`pnpm-workspace.yaml` only includes
`apps/*`/`packages/*`) and not run as part of any build — it's a manual
content-generation step, run again only if a source image changes or a
different upscale factor is wanted.
