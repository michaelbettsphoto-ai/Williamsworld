# 🎵 Quick Start: Adding Audio to Williams World

## TL;DR - Get Audio in 5 Minutes

### 1. Download Kenney Digital Audio (Best Source)
```
Visit: https://kenney.nl/assets/digital-audio
Click: "Download" button
Extract ZIP file
```

### 2. Find These Files in the Pack

**From Kenney Digital Audio pack, grab:**
- `click1.ogg` → rename to `button-click-1.ogg`
- `click2.ogg` → rename to `button-click-2.ogg`
- `click3.ogg` → rename to `button-click-3.ogg`
- `confirmation_001.ogg` → rename to `success-1.ogg`
- `confirmation_002.ogg` → rename to `success-2.ogg`
- `confirmation_003.ogg` → rename to `success-3.ogg`
- `error_006.ogg` → rename to `error-soft.ogg`
- `select_001.ogg` → rename to `hover-tick.ogg`
- `toggle_001.ogg` → rename to `toggle-on.ogg`
- `toggle_002.ogg` → rename to `toggle-off.ogg`
- `switch_001.ogg` → rename to `tab-change.ogg`
- `powerUp_001.ogg` → rename to `panel-open.ogg`
- `powerDown_001.ogg` → rename to `panel-close.ogg`
- `ping_001.ogg` → rename to `notification-ping.ogg`

### 3. Copy to Project
```bash
# Copy to UI folder
cp *.ogg /path/to/Williamsworld/audio/ui/
```

### 4. Test
```bash
# Open in browser
python3 -m http.server 8080
# Visit http://localhost:8080/audio-test.html
```

---

## Still Need More Sounds?

### For Avatar Sounds (Fun Effects)
**Go to**: https://freesound.org/  
**Filter by**: CC0 License  
**Search for**: "cartoon sneeze", "slip whistle", "burp", "boing", "squeak"

### For Weather Ambience
**Go to**: https://freesound.org/  
**Filter by**: CC0 License  
**Search for**: "rain loop", "thunder storm", "birds chirping", "wind gentle"

### For Background Music
**Go to**: https://opengameart.org/  
**Filter by**: CC0 License  
**Search for**: "town music", "forest theme", "dungeon music"

---

## File Format Conversion

**Have WAV or MP3?** Convert to OGG:
```bash
ffmpeg -i input.wav -c:a libvorbis -q:a 4 output.ogg
```

**Batch convert all:**
```bash
for f in audio/*/*.wav; do
  ffmpeg -i "$f" -c:a libvorbis -q:a 4 "${f%.wav}.ogg" -y && rm "$f"
done
```

---

## Complete File List (42 files total)

### UI (14 files) ✓ Kenney has all of these
- button-click-1.ogg, button-click-2.ogg, button-click-3.ogg
- hover-tick.ogg
- panel-open.ogg, panel-close.ogg
- toggle-on.ogg, toggle-off.ogg
- tab-change.ogg
- success-1.ogg, success-2.ogg, success-3.ogg
- error-soft.ogg
- notification-ping.ogg

### Avatar (20 files) - Search Freesound CC0
- idle-1.ogg, idle-2.ogg, idle-3.ogg
- william-tap.ogg
- confetti-sneeze.ogg, banana-slip.ogg, bubble-burp.ogg
- pie-trap.ogg, rubber-chicken.ogg, hero-landing.ogg
- endless-scarf.ogg, frog-crown.ogg, chipmunk-voice.ogg
- marshmallow-volley.ogg, hair-tornado.ogg, tiger-shuffle.ogg
- lego-step.ogg, goose-chase.ogg, treasure-socks.ogg
- william-on-break.ogg

### Weather (5 files) - Search Freesound CC0
- sunny-ambient.ogg (birds + breeze)
- cloudy-ambient.ogg (wind)
- rain-ambient.ogg (rain loop)
- storm-ambient.ogg (thunder)
- snow-ambient.ogg (soft wind)

### Music (3 files) - Search OpenGameArt CC0
- hub-loop.ogg
- forest-loop.ogg
- dungeon-loop.ogg

---

## License Check ✓

All sources are **CC0 (Public Domain)**:
- ✅ Use commercially
- ✅ No attribution required (but we track it anyway)
- ✅ Modify as needed
- ✅ Kid-safe content

---

## Troubleshooting

**Can't find sounds?** Use the interactive script:
```bash
./download-audio-assets.sh
```

**Need more help?** Read the full guide:
```bash
cat AUDIO_SOURCING_GUIDE.md
```

**Want placeholders for testing?** Generate them:
```bash
python3 generate-placeholder-audio.py
```

---

## After Adding Files

1. ✅ Test in `audio-test.html`
2. ✅ Test in main app `index.html`
3. ✅ Update `ASSET_ATTRIBUTION.md` with sources
4. ✅ Commit OGG files to repository

---

**That's it!** The audio system is ready to go once you add the files. Start with Kenney Digital Audio pack - it has 14 of the 42 files you need, and they're all perfect for UI sounds.

🎮 Happy sound hunting!
