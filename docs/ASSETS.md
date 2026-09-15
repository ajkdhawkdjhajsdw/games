# Quiet Harbor development assets

## Status and provenance

**Development art, not production-approved art.** The available tool inventory
does not contain the image-generation capability assumed by specification §10.
Instead, this implementation includes original, deterministic procedural raster
illustrations: authored polygon composition, supersampled painting, subtle paper
grain, water strokes, tiled roofs, miniature cottages, trees, docks and boats.
There are no embedded words, seat letters, topology, emoji, SVG illustrations,
stock images, sampled audio, or hotlinks. Human art direction/curation and the
specification's image-generation gate remain open. A successful build is not an
art acceptance claim.

`public/assets/manifest.json` records each runtime file's SHA-256, byte size,
dimensions or audio duration, source, seed and approval status. Original asset
provenance and the third-party font license are retained in `public/licenses/`.

## Delivered integration paths

All paths below are relative to `/assets/`:

| Path | Content |
| --- | --- |
| `harbor-key-art.webp` | 1440×960 home artwork; central quiet teal water, terracotta village and cream shoreline |
| `scenes/harbor-key-art.webp` | Same file under the specification's scene prefix |
| `scenes/harbor-key-art-portrait.webp` | 1080×1440 crop derived from the same scene |
| `maps/M01.webp` … `maps/M10.webp` | 768×768 muted scenery; central 74% left clear for code-rendered topology |
| `ships/A.webp` … `ships/D.webp` | 256×256 alpha boats; identical footprint with four color trims; render seat letters in UI |
| `berths/B1.webp`, `B2.webp`, `B3.webp` | 256×256 alpha Lantern, Market and Workshop illustrations |
| `cargo/tea.webp`, `bread.webp`, `books.webp`, `cloth.webp`, `tools.webp`, `flowers.webp` | 128×128 alpha private-card illustrations |
| `signals/need.webp`, `yield.webp`, `ready.webp` | 128 px pennant, open ring and diamond; 256 px variants use `-256` suffix |
| `brand/harbor-mark.png` | 256 px transparent lamp-over-water mark |
| `brand/favicon.png`, `favicon.png` | 32 px raster favicon aliases |
| `app/icon.png` | 512 px raster application icon |
| `fonts/golos-text.woff2` | Self-hosted variable Golos Text, Latin/Cyrillic and punctuation, including ё/Ё |
| `audio/*.mp3` | Eighteen one-shot cues and two original music/ambience loops |

The ten map images are subtle decorative variations, not a visual encoding of
graph topology or map-specific narrative. Topology and accessible labels must
come from game data. These images are safe to remove without changing rules.

## Audio

The exact short-cue stems are `ui-tap`, `select-node`, `select-wait`,
`signal-need`, `signal-yield`, `signal-ready`, `signal-clear`, `commit`,
`round-open`, `time-five`, `boats-move`, `delivery`, `congestion`,
`shift-success`, `shift-incomplete`, `reconnect`, `ui-unavailable`, `mastery`.
Their decoded durations follow §11.3. Runtime MP3 is 48 kHz, mono, 80 kbps.
`harbor-water` is a 48-second stereo ambience; `lantern-loop` is the original
64-second/16-bar harmonic and sparse-melody recipe, stereo, 96 kbps. All sounds
are synthesized offline. Noise is seeded. Musical reverb wraps across the loop
boundary; no fade-to-silence gap is intentionally baked into loops. Browser MP3
decoder padding/gapless playback still needs device verification.

These are functional development approximations, not a completed sound-design
mix: Wood/Bell/Pad timbres and cues are synthesized; Paper layering, ambience
rope creaks, complete filtering recipes, true-peak/LUFS mastering and low-phone-
volume listening approval remain pending. Cue sample peaks are deliberately
restrained (0.18 or 0.25 full scale), not normalized aggressively. Music and
ambience playback must default off, remain optional and be gated on a user
gesture; playback policy and semantic cue coalescing are the app's responsibility.

## Reproduction

From the repository root, use a project-local environment:

```sh
uv venv .hoplite/asset-venv
uv pip install --python .hoplite/asset-venv/bin/python \
  Pillow==12.3.0 numpy==2.5.3 fonttools==4.65.0 brotli==1.2.0 zopfli==0.4.3
.hoplite/asset-venv/bin/python scripts/generate-assets.py
```

Python 3.12 and `ffmpeg` with `libmp3lame` are used. The initial font build
downloads official Google Fonts source at pinned revision
`c1eda9233c33ad7775b27efd794f931095cf6133`; the app itself makes no font requests
to Google. Font Unicode subsetting is performed locally. `--skip-font` and
`--skip-audio` allow offline artwork-only regeneration while preserving existing
font/audio exports. Re-run without those flags for a complete regeneration.

WAV masters are 48 kHz/24-bit PCM and are written outside the public bundle to
`.hoplite/asset-masters/`, alongside the working key-art PNG and source TTF.
Masters are local generated build products, not committed runtime assets. Exact
binary reproducibility assumes the same Pillow/fonttools/ffmpeg versions.

## Build verification (15 September 2026)

- 57 runtime assets total **2,047,276 bytes**, excluding the JSON manifest.
- Chosen-codec audio total **1,440,708 bytes**; local font **62,332 bytes**.
- Delivered ships, cargo, berths, maps, scene crops, font and signal masks pass
  their individual compressed-size ceilings. Isolated sprites have real alpha
  ranging from transparent to opaque.
- Two consecutive full rebuilds produced identical manifests before the final
  signal-size optimization; two consecutive final artwork rebuilds likewise
  produced identical manifests. Python compilation passed.
- FFprobe confirmed the delivery master is 48 kHz, mono, 24-bit PCM, 0.600 s.
- The current 1440×960 key-art export was visually inspected for composition,
  water clearance and absence of embedded text. No audio listening approval or
  in-app rendering claim is made by this asset-only verification.

## Remaining production inventory and gates

This focused development pass does not deliver the full §10 production package:
graph-derived thumbnails, flag cosmetics, the 20-icon atlas, result/mastery
illustrations, seamless texture tiles, prop atlas, explicit-share template and
full-resolution archival art masters are not included. The generated working
key-art master is 1440×960 (painted internally at 2×); isolated exports likewise
use supersampling rather than the specified 1024 px production masters.

Verify the real app's cropping, contrast, ship readability at 34–44 CSS px,
Russian text reflow, low-memory image loading and optional sound behavior.
Human visual/listening approval, Telegram iOS/Android decoding, mono balance,
loudness/true-peak checks and complete release-inventory review remain gates.
