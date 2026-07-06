# tileset-upscale

One-off tool that generates the HD placeholder tile atlas used by the web
renderer (`apps/micropolis/src/lib/images/tilesets/all-hd4x.png`) from the
classic 16x16 tile atlas (`apps/micropolis/src/lib/images/tilesets/all.png`).

## What it does

Runs [xBRZ](https://sourceforge.net/projects/xbrz/) (via `xbrz-js`, GPL-3) on
each 16x16 tile cell independently, producing a 4x atlas (64x64 tiles) that
keeps the original pixel-art silhouettes crisp while smoothing the diagonal
and curved edges that look blocky when the classic tiles are just stretched.
The result is re-encoded as a palette PNG (via `sharp`) since this art has a
small flat color palette even after upscaling.

**This is placeholder HD art, not hand-drawn high-resolution art.** It makes
the existing SimCity Classic tile set (GPL-3, from EA's 2008 OLPC release —
see `documentation/manual/credits.html`) look reasonable at higher zoom and
on high-DPI displays, but it is an algorithmic upscale of 1989-era 16px tiles,
not new artwork. Swap in real HD tile art here when available.

## Usage

```sh
cd tools/tileset-upscale
npm install
node upscale.mjs ../../apps/micropolis/src/lib/images/tilesets/all.png \
  ../../apps/micropolis/src/lib/images/tilesets/all-hd4x.png 4 16
```

Not part of the pnpm workspace (`pnpm-workspace.yaml` only includes
`apps/*`/`packages/*`) and not run as part of any build — it's a manual
content-generation step, run again only if the source atlas changes or a
different upscale factor is wanted.
