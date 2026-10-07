# Editing style: Reels / vertical videos

The creator's preferences, gathered from feedback on the first videos. Apply them to every edit unless told otherwise.

> ✅ **APPROVED REFERENCE (Oct 2026): `reels/episodes/ep2/`** — "Você é a média das 5 pessoas" v2. The creator said: *"Agora sim, perfeito!"* and asked for **this format on every video from now on**. When in doubt, copy what ep2 does (its `build-graphics.mjs` is the template for titles, icon tiles, cards and the CTA).

## Format and safe zones (Instagram Reels)
- Canvas 1080×1920 (9:16), full screen, **no border or frame** around the video.
- **Never put text in the top ~12% or the bottom ~22%** of the screen: the Reels interface covers them.
  - Title / CTA: around 15% from the top.
  - Captions: band between ~56% and ~78% of the height.
- **People must see everything**: the person's face never gets covered, and no text gets hidden.

## Layers (top to bottom)
1. Captions
2. **Person cut out (head and body in front)**
3. Images and data cards
4. Base video

Images and cards can sit **behind the head**, but never cut across the face. Text inside a card has to stay readable: place cards above the head.
Some images may **cover the whole screen** for a few seconds (impact moments).

How to do it: cut the person out with AI (`hyperframes remove-background`), bake the zooms into the base video myself (zoom centered on the face, origin 50% 40%), and lay the cutout over the images/cards **only in the windows where they appear** (`make-presenter-segments.sh`). Before placing any text, check where the face is at that moment: if the person leans toward the camera, the face rises, so move the text (e.g. the final CTA went down to ~48%, between the chin and the captions).

## Captions
- Small, **phrase by phrase** (at most ~4 words on screen).
- **Light, neutral blue** color (≈ `rgba(196,228,255,0.92)`), slightly transparent. **No yellow.**
- Each word **grows in** at the moment it's spoken.
- **Emphasis words**: **red** (`#ff3b30`) and larger.
- The platform's default captions (Tella) stay off: these are rendered in HyperFrames.

## Typography and minimalist graphics (reference: @lukachoi_ Reel, Oct 2026)
The creator asked for this look on top of the rules above: **several fonts to give emphasis** and **minimalist images and icons**, so the video feels more dynamic.

- **Mix fonts inside one phrase**: a bold sans-serif (Inter 800–900) for the plain words plus an **elegant italic serif** (e.g. *Instrument Serif Italic* / *Playfair Display Italic*) for the word that carries the idea. Examples from the reference: "a IA *sozinha*", "a *cereja* do bolo", "salva pra não *esquecer*", "botar em *prática*".
- **One giant word** at key moments: a single word in large serif italic (~200–260 px) with a soft drop shadow, sitting behind/above the head (e.g. "*estilo*").
- **Tilted stamp / label**: small uppercase tag in a bordered box, rotated ~-5°, under a title ("NÃO SABE EDITAR").
- **Marker highlight** on a key word (a solid block behind the text). The reference uses yellow; **here it is red `#ff3b30` with white text** (or light-blue `rgba(196,228,255,0.92)` with dark text). Still **no yellow**.
- **Strikethrough** for what to avoid ("vídeo ~~genérico~~"), the struck word faded/grey.
- **Small spaced uppercase kicker** above a group ("3 FERRAMENTAS", "AS MINHAS VERSÕES"): ~24 px, letter-spacing 0.2em.
- **Minimalist icons, not stock photos**, for abstract ideas: clean, flat or soft-3D single objects on a white rounded tile or floating with a soft shadow (cherry, bookmark, document 📄, GitHub logo, app logos). One icon = one idea. Pop in with a small scale bounce + `pop` SFX.
- **Icon rows that build up**: items appear one by one as they are named (numbered labels "01 / 02 / 03"), then get a ✓ check as they are confirmed.
- **Mini-cards of screenshots/files** (a `.md` file card, a phone UI, v1→v4 thumbnails with ✕ red / ✓ check) to show process instead of telling it.
- Keep the background clean: lots of empty space, at most one graphic group on screen, white/light tiles, thin borders, rounded corners.
- All of this still follows the safe zones and layering above (graphics above the head, person cut out in front, face never covered).
- Final beat may cut to a **black screen with one big bold line** (e.g. "POR QUE NÃO VOCÊ?") for ~1 s.

## Hook (first ~2–3 s)
- Suspense feel: **suspense riser + heartbeat**, a slow push-in zoom, and an **impact** at the end of the hook sentence.
- Short title on screen during the hook (in the safe zone).

## Throughout the video
- **Images** at interesting / emphasis moments, always with a **woosh** sound when they come in.
- **Data and stats** (real, with a source) as animated cards: counters, comparisons, icons.
- **Punch-in zooms** at the strong sentences (approved).
- Sound effects on the graphics (reveal, pop, impact, error/success for comparisons).
- Background music **after the hook**, at ~10–15% volume.
  - ⚠️ **Feedback on video 1: the sound came out "too depressing".** Avoid slow, melancholic, cinematic tracks (e.g. Tella's "Cinematic Soft Focus", "Deep Work Ambient", "Midnight Velvet").
  - Prefer **upbeat, energetic, motivational** music: in Tella's catalog, "Bright Startup Energy", "Modern Tech Pulse", "Chill House Screenbeat" or "Playful Product Walkthrough"; on Epidemic Sound, *Upbeat / Motivational / Hopeful*, 100–125 BPM.
  - The suspense (riser, heartbeat) stays **only in the hook**. After the impact, the mood turns energetic. Don't string together more than one "dark" effect in a row.
- End: a question / CTA for comments ("Quem são as suas 5? Comenta aqui"), in the safe zone.

## The approved recipe (ep2) in one glance
- **Every 2–5 s something new appears** at the top (13–30% of the height): a mixed-font title, an icon row that builds up, a white card with real data, a red marker word, a strikethrough comparison.
- **Text and graphics in near-black `#141414`** on white tiles/cards (shadowed) or directly on the wall; accents in **red `#ff3b30`** and green ✓ `#22c55e`. Serif = *Instrument Serif Italic* (`reels/episodes/ep2/fonts/`, downloaded from Google Fonts), sans = Inter 800–900.
- **Icons**: simple line icons drawn in inline SVG (stroke 7, round caps) inside white rounded tiles, numbered label pill underneath ("01 academia").
- **Follow the head**: wide shot → graphics above the head; close-up (head near the top) → tiles **beside** the head; CTA in a white box **between the chin and the captions** (~48%), above the cut-out layer. Check every graphic with `hyperframes snapshot` over the real frame (and with the zoom applied) before rendering.
- **Keep punch-in zooms small (≤1.2) while graphics are on screen**, so the head doesn't grow into them.
- **Sound**: suspense riser + heartbeat + impact in the hook; `press` on each icon pop, `ui-reveal` on cards, `deep-woosh` on group entrances, `error`/`success` on comparisons, `notification-chime` on the CTA. Music "Bright Startup Energy" from 2.35 s at ~12%, mix to −14 LUFS.
