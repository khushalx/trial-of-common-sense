# Courtroom sound files

Place licensed local MP3 files here using these names:

- `gavel-1.mp3`
- `gavel-2.mp3`
- `paper.mp3`
- `wood-knock.mp3`
- `courtroom-roomtone.mp3`
- `verdict-rumble.mp3`
- `verdict-impact.mp3`
- `stamp.mp3`

The app deliberately plays no generated fallback sounds when a file is absent.
Add each installed filename to `manifest.json` so the browser only requests files that exist.
