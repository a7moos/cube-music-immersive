# Cube Music — Immersive

Single-page landing site for **Cube Music** ("Shaping the sound"), an independent
Egyptian entertainment house — record label, talent agency, music production,
events, publishing and distribution.

The landing page is [`index.html`](./index.html). Its CSS is inline in `<style>`,
and the scroll-driven hero animation is powered by a
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
  index.html            # landing page: markup, inline CSS, inline JS (Three.js cube, sound)
  label.html …          # the six division pages (label, talent, production, events, publishing, distribution)
  site.css / site.js    # shared styles and behaviour for the division pages
  section-motion.*      # scroll and pointer motion shared by every page
  favicon.svg, *.png    # cube icon, touch icon, share image (og-image.png)
  robots.txt, sitemap.xml, site.webmanifest
```

## Sound

The landing page synthesises its audio with the Web Audio API (no audio files):
a layer-turn click, a camera whoosh between faces, a chord when the cube solves,
and a note for each piece on hover. Sound is on by default and starts on the
first click, tap or key press, because browsers block audio before that. The
"Sound" toggle (bottom left) mutes it and remembers the choice.

## SEO

Canonical, Open Graph and sitemap URLs assume the site is served from
`https://cubemusic.tv/`. Search and replace that origin if the domain differs.

## Notes

- Respects `prefers-reduced-motion` — heavy scroll/WebGL choreography is disabled.
- Falls back to a static image when WebGL is unavailable.
- Contact: info@cubemusic.tv
