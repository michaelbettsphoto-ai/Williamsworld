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
- `click1.mp3` → rename to `button-click-1.mp3`
- `click2.mp3` → rename to `button-click-2.mp3`
- `click3.mp3` → rename to `button-click-3.mp3`
- `confirmation_001.mp3` → rename to `success-1.mp3`
- `confirmation_002.mp3` → rename to `success-2.mp3`
- `confirmation_003.mp3` → rename to `success-3.mp3`
- `error_006.mp3` → rename to `error-soft.mp3`
- `select_001.mp3` → rename to `hover-tick.mp3`
- `toggle_001.mp3` → rename to `toggle-on.mp3`
- `toggle_002.mp3` → rename to `toggle-off.mp3`
- `switch_001.mp3` → rename to `tab-change.mp3`
- `powerUp_001.mp3` → rename to `panel-open.mp3`
- `powerDown_001.mp3` → rename to `panel-close.mp3`
- `ping_001.mp3` → rename to `notification-ping.mp3`

### 3. Copy to Project
```bash
# Copy to UI folder
cp *.mp3 /path/to/Williamsworld/assets/audio/ui/
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

**Have WAV or MP3?** Convert to MP3:
```bash
ffmpeg -i input.wav -c:a libmp3lame -q:a 4 output.mp3
```

**Batch convert all:**
```bash
for f in assets/audio/*/*.wav; do
  ffmpeg -i "$f" -c:a libmp3lame -q:a 4 "${f%.wav}.mp3" -y && rm "$f"
done
```

---

## Complete File List (43 files total)

### UI (14 files) ✓ Kenney has all of these
- button-click-1.mp3, button-click-2.mp3, button-click-3.mp3
- hover-tick.mp3
- panel-open.mp3, panel-close.mp3
- toggle-on.mp3, toggle-off.mp3
- tab-change.mp3
- success-1.mp3, success-2.mp3, success-3.mp3
- error-soft.mp3
- notification-ping.mp3

### Avatar (20 files) - Search Freesound CC0
- idle-1.mp3, idle-2.mp3, idle-3.mp3
- william-tap.mp3
- confetti-sneeze.mp3, banana-slip.mp3, bubble-burp.mp3
- pie-trap.mp3, rubber-chicken.mp3, hero-landing.mp3
- endless-scarf.mp3, frog-crown.mp3, chipmunk-voice.mp3
- marshmallow-volley.mp3, hair-tornado.mp3, tiger-shuffle.mp3
- lego-step.mp3, goose-chase.mp3, treasure-socks.mp3
- william-on-break.mp3

### Weather (5 files) - Search Freesound CC0
- sunny-ambient.mp3 (birds + breeze)
- cloudy-ambient.mp3 (wind)
- rain-ambient.mp3 (rain loop)
- storm-ambient.mp3 (thunder)
- snow-ambient.mp3 (soft wind)

### Music (3 files) - Search OpenGameArt CC0
- hub-loop.mp3
- forest-loop.mp3
- dungeon-loop.mp3

### Gameplay (1 file) - Battle SFX
- battle-hit.mp3

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
4. ✅ Commit MP3 files to repository

---

**That's it!** The audio system is ready to go once you add the files. Start with Kenney Digital Audio pack - it has 14 of the 43 files you need, and they're all perfect for UI sounds.

🎮 Happy sound hunting!
