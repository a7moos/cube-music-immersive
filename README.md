# Cube Music — Immersive

Single-page landing site for **Cube Music** ("Shaping the sound"), an independent
Egyptian entertainment house — record label, talent agency, music production,
events, publishing and distribution.

The entire site lives in one self-contained file: [`index.html`](./index.html).
CSS is inline in `<style>`, and the scroll-driven hero animation is powered by a
bundled copy of [Three.js](https://threejs.org/) (WebGL) with a graceful
non-WebGL / reduced-motion fallback.

## Run locally

Any static file server works. The convenience script uses Python's built-in
server (no install step, always available on macOS):

```bash
npm run dev
# → http://localhost:4321
```

Or run it directly, without npm:

```bash
python3 -m http.server 4321      # → http://localhost:4321
```

Then open the printed URL and hard-refresh after edits.

## Structure

```
cube-music-immersive/
  index.html    # the whole site — markup + inline CSS + inline JS (Three.js)
  package.json  # npm run dev → static server on :3000
  README.md
  .gitignore
```

Because everything is in `index.html`, edits are made directly in that file.
Search for section anchors (`#world`, `#services`, `#contact`) or the
`<style>` / `<script>` blocks to find what you're looking for.

## Notes

- Respects `prefers-reduced-motion` — heavy scroll/WebGL choreography is disabled.
- Falls back to a static image when WebGL is unavailable.
- Contact: info@cubemusic.tv
