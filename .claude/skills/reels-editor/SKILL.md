---
name: reels-editor
description: Edits vertical Reels/TikTok videos in Pedro's approved format (safe-zone title, light-blue phrase-by-phrase captions with red emphasis, AI cut-out of the person in front of images and data cards, suspense hook, upbeat music). Use when the user sends a talking-head video to edit or asks to "edit the reel / video in my format".
---

# Reels editor (approved format)

Read `reels/EDITING-STYLE.md` first. It holds the creator's preferences and is the source of truth.

**Approved template: `reels/episodes/ep2/`** (the creator loved it — use this flow for every new video):
1. Copy `reels/episodes/ep2/*.mjs *.sh` into `reels/episodes/<name>/`, put the video in as `source.mp4`, download the Instrument Serif fonts into `fonts/`.
2. Transcribe in Tella (`create_source` + PUT + `create_video` + `get_transcript`) → `words.tsv`; fix errors.
3. `npx hyperframes remove-background` on the source (split in 2 halves in parallel, then concat to `cutout/presenter.mov`; wait by checking the logs for "Removed background", never `pgrep -f` a pattern that's in your own command).
4. Map the head position per shot (scene detection + frames with a 10% grid). Rewrite the groups in `build-graphics.mjs` for the new script; set `EMPHASIS` in `build-captions.mjs` and `ZOOMS` in `build-layers.mjs`.
5. `./build-final.sh` → `final/` (base < graphics < cut-out < captions as nested HyperFrames compositions). Check with `hyperframes snapshot final --at ...`, fix overlaps.
6. Render with `npx hyperframes render final -o renders/reel.mp4 -q delivery --workers 2` (4 workers runs out of memory).
7. `./mix.sh` (voice + upbeat music after the hook, −14 LUFS) → upload to Tella, add the catalog SFX with `apply_video_edits`, `export_video` (subtitles off), download from prod-compose.tella.tv and send it (compress below 30 MB for chat).

The older Tella-assembly pipeline below still works but ep2's local composition is the approved path.

## Pipeline

Create `reels/episodes/<name>/`, copy the scripts from `reels/scripts/` into it, and put the video in as `source.mp4`. The scripts use `../../graphics/intro/gsap.min.js`.

1. **Upload and transcribe in Tella**: `create_source` + PUT the bytes + `create_video` (1080x1920, `studioSound: true`, `captionsEnabled: false`), then `get_transcript`. Fix transcription errors with `update_transcript_words`. Save the timings to `words.tsv` (start_ms, end_ms, word; see `words.example.tsv`).
2. **Captions**: in `build-captions.mjs`, choose the `EMPHASIS` words (the strong words of the speech) and the `FORCE_BREAK_AFTER` breaks for the hook → `node build-captions.mjs` → render `captions/` with `npx hyperframes render --format mov` (ProRes 4444 with alpha; Tella does **not** accept WebM alpha).
3. **Data cards**: edit `CARDS` in `build-cards.mjs` with **real** stats that have a source → render each one with `--format mov`.
3b. **Kinetic titles + icons** (see *Typography and minimalist graphics* in the style guide): for each strong idea pick one treatment — sans+italic-serif title, giant serif word, marker highlight (red, never yellow), strikethrough, or a minimalist icon / icon row with ✓. Render them as HyperFrames `--format mov` like the cards and place them above the head.
4. **Images**: Tella `generate_image` (photorealistic, no text). Full-screen at impact moments (`add_layout` + `media`); otherwise as a card at the top (`add_media_overlay` ~950x534 at 12%).
5. **Zooms + cut-out**:
   - `build-layers.mjs`: set the `ZOOMS` (origin 50% 40%, centered on the face) → render `base/` to MP4 and remux the original audio with ffmpeg.
   - `npx hyperframes remove-background` on the source → `cutout/presenter.mov` (splitting it in 2 halves in parallel speeds things up; never use `pkill -f` with a pattern that appears in your own command).
   - `make-presenter-segments.sh`: set the windows where images/cards appear (and the zoom of each window) → ProRes segments (FFmpeg, ~1 min).
6. **Assemble in Tella** (a new video from `base.mp4`): fullscreen layout, `corners: none`, `borderStyle: none`, **upbeat** music, title (15%) and CTA (check where the face is with `get_video_frame`), images, cards, SFX, then **the cut-out** segments, and **the captions last** (the order they are added = the stacking order).
7. **Check** with `get_video_frame` at the key moments (face never covered, text inside the safe zones) → `export_video` with `subtitles: false`.

## Sound effects (Tella catalog, `list_library scope=default type=sound-effect`)
- Hook: `suspense-riser` + `heartbeat` (0 → end of the hook sentence), `impact-boom` at the end.
- Images: `deep-woosh`. Cards: `ui-reveal` / `gentle-reveal`. Emphasis: `impact-boom`. Comparisons: `error` / `success`. Counting: `press`. CTA: `notification-chime`.

## Known limitations
- Tella catalog music only plays for the **whole video**. For it to start after the hook, use your own audio: `create_source` audio + `add_sound_effect` at the end time of the hook (needs network access to download the track).
- In the cloud environment, downloads need the domains allowed in the network settings (drive.usercontent.google.com, prod-compose.tella.tv, ucarecdn.com …). Uploads to Tella (S3 PUT) always work.
