# Williams World Audio Asset Sourcing Guide

This guide provides step-by-step instructions for downloading and adding CC0 (Public Domain) audio assets to Williams World.

## Quick Start

Run the automated download script:
```bash
./download-audio-assets.sh
```

Or follow the manual instructions below.

---

## Audio Requirements Summary

- **Total Files Needed**: 43 audio files
- **Format**: MP3 (primary)
- **License**: CC0 (Public Domain) preferred
- **Quality**: Kid-friendly, normalized volume, no silence padding

---

## Source 1: Kenney Digital Audio (CC0)

**Best for**: UI sounds, button clicks, success/error sounds

### Download
- **Official**: https://kenney.nl/assets/digital-audio
- **Mirror**: https://gamesounds.xyz/?dir=Kenney%27s%20Sound%20Pack/Digital%20Audio
- **License**: CC0 (Public Domain)
- **Format**: MP3 + WAV included

### Files to Use from Kenney Pack

#### UI Sounds (from Digital Audio pack):
- `click1.mp3` → `ui/button-click-1.mp3`
- `click2.mp3` → `ui/button-click-2.mp3`
- `click3.mp3` → `ui/button-click-3.mp3`
- `select_001.mp3` → `ui/hover-tick.mp3`
- `confirmation_001.mp3` → `ui/success-1.mp3`
- `confirmation_002.mp3` → `ui/success-2.mp3`
- `confirmation_003.mp3` → `ui/success-3.mp3`
- `error_006.mp3` → `ui/error-soft.mp3`
- `toggle_001.mp3` → `ui/toggle-on.mp3`
- `toggle_002.mp3` → `ui/toggle-off.mp3`
- `switch_001.mp3` → `ui/tab-change.mp3`
- `powerUp_001.mp3` → `ui/panel-open.mp3`
- `powerDown_001.mp3` → `ui/panel-close.mp3`
- `ping_001.mp3` → `ui/notification-ping.mp3`

---

## Source 2: Bleeoop UI Clicks (Itch.io - CC0)

**Best for**: Additional UI variety

### Download
- **URL**: https://bleeoop.itch.io/ui-clicks
- **Price**: Name your own price ($0 is fine)
- **License**: CC0 (Public Domain)
- **Format**: MP3 + WAV included

### What's Included
- 35+ UI click and button sounds
- Pre-normalized and trimmed
- Ready to use without attribution

---

## Source 3: Freesound.org (CC0 Filter)

**Best for**: Weather ambience, nature sounds

### Search Instructions
1. Go to: https://freesound.org/
2. Enable "Advanced Search"
3. Set License filter to: "Creative Commons 0 (CC0)"
4. Search for each sound type

### Recommended Searches

#### Weather Ambience:
- **Sunny**: Search "birds chirping morning" + "gentle breeze"
  - Example: [Light Forest Birds](https://freesound.org/search/?q=light+birds+chirping&f=license:%22Creative+Commons+0%22)
  - Combine with soft wind for `sunny-ambient.mp3`

- **Cloudy**: Search "wind gentle" + "leaves rustle"
  - Example: [Soft Wind](https://freesound.org/search/?q=soft+wind&f=license:%22Creative+Commons+0%22)
  - Use for `cloudy-ambient.mp3`

- **Rain**: Search "light rain loop"
  - Example: [Rain Loop](https://freesound.org/search/?q=rain+loop&f=license:%22Creative+Commons+0%22)
  - Use for `rain-ambient.mp3`

- **Storm**: Search "rain thunder storm"
  - Example: [Thunder Storm](https://freesound.org/search/?q=thunder+storm&f=license:%22Creative+Commons+0%22)
  - Use for `storm-ambient.mp3`

- **Snow**: Search "wind winter soft"
  - Example: [Winter Wind](https://freesound.org/search/?q=winter+wind+soft&f=license:%22Creative+Commons+0%22)
  - Use for `snow-ambient.mp3`

#### Avatar Sounds (Fun Effects):
- **Tap**: Search "tap soft" - for `william-tap.mp3`
- **Idle**: Search "cute chirp", "small pop", "tiny beep" - for `idle-*.mp3`
- **Sneeze**: Search "cartoon sneeze" - for `confetti-sneeze.mp3`
- **Slip**: Search "slip cartoon" or "slide whistle" - for `banana-slip.mp3`
- **Burp**: Search "cartoon burp" - for `bubble-burp.mp3`
- **Boing**: Search "spring boing" - for `pie-trap.mp3`
- **Squeak**: Search "rubber squeak" - for `rubber-chicken.mp3`
- **Whoosh**: Search "whoosh short" - for `hero-landing.mp3`
- **Flutter**: Search "cloth flutter" - for `endless-scarf.mp3`
- **Ribbit**: Search "frog ribbit" - for `frog-crown.mp3`
- **Glug**: Search "potion drink" - for `chipmunk-voice.mp3`
- **Poof**: Search "soft poof" - for `marshmallow-volley.mp3`
- **Wind spin**: Search "wind up toy" - for `hair-tornado.mp3`
- **Drum**: Search "short drum hit" - for `tiger-shuffle.mp3`
- **Click**: Search "plastic click" - for `lego-step.mp3`
- **Honk**: Search "goose honk cute" - for `goose-chase.mp3`
- **Chest open**: Search "chest open" - for `treasure-socks.mp3`

---

## Source 4: OpenGameArt.org (Filter for CC0)

**Best for**: Background music loops

### Search Instructions
1. Go to: https://opengameart.org/art-search-advanced
2. Set "Art Type" to: Music
3. Set "Licenses" to: CC0
4. Search for keywords

### Recommended Searches

#### Background Music:
- **Hub/Town**: Search "town theme", "village music", "peaceful loop"
  - Example: [Town Music](https://opengameart.org/art-search-advanced?keys=town+music&field_art_type_tid%5B%5D=12&field_art_licenses_tid%5B%5D=4)
  - Use for `hub-loop.mp3`

- **Forest**: Search "forest music", "nature theme", "woodland"
  - Example: [Forest Theme](https://opengameart.org/art-search-advanced?keys=forest&field_art_type_tid%5B%5D=12&field_art_licenses_tid%5B%5D=4)
  - Use for `forest-loop.mp3`

- **Dungeon**: Search "dungeon theme", "cave music", "dark ambient"
  - Example: [Dungeon Music](https://opengameart.org/art-search-advanced?keys=dungeon&field_art_type_tid%5B%5D=12&field_art_licenses_tid%5B%5D=4)
  - Use for `dungeon-loop.mp3`

---

## Source 5: Pixabay (CC0)

**Best for**: Additional UI sounds and effects

### Download
- **URL**: https://pixabay.com/sound-effects/
- **License**: Pixabay License (free for commercial use, no attribution)
- **Format**: MP3 (convert to MP3)

### Search Terms
- "button click"
- "success sound"
- "notification"
- "whoosh"
- "toggle switch"

---

## File Conversion

If you download files in WAV or MP3 format, convert to MP3:

### Using ffmpeg (Command Line)
```bash
ffmpeg -i input.wav -c:a libmp3lame -q:a 4 output.mp3
```

### Using Audacity (GUI)
1. File > Open > Select your audio file
2. File > Export > Export as MP3
3. Set Quality: 5 (good balance of size/quality)

### Online Converters
- **CloudConvert**: https://cloudconvert.com/audio-converter
- **Online-Convert**: https://audio.online-convert.com/convert-to-mp3

---

## Audio Processing Tips

### Normalize Volume
Ensure consistent loudness across all files:
```bash
ffmpeg-normalize input.mp3 -o output.mp3 -c:a libmp3lame -ext mp3
```

Or in Audacity:
1. Effect > Normalize
2. Set to -3.0 dB for UI sounds
3. Set to -18.0 dB for ambient/music

### Trim Silence
Remove silence at start/end:
```bash
ffmpeg -i input.mp3 -af silenceremove=start_periods=1:start_silence=0.1:start_threshold=-50dB output.mp3
```

Or in Audacity:
1. Select the audio
2. Effect > Truncate Silence
3. Set minimum duration: 0.1 seconds

### Create Seamless Loops
For ambient and music files:
1. Import into Audacity
2. Trim to exact loop point
3. Use Effect > Crossfade Loop for smooth transitions
4. Export as MP3

---

## File Organization

After downloading and converting, organize files like this:

```
assets/audio/
├── ui/
│   ├── button-click-1.mp3
│   ├── button-click-2.mp3
│   ├── button-click-3.mp3
│   ├── hover-tick.mp3
│   ├── panel-open.mp3
│   ├── panel-close.mp3
│   ├── toggle-on.mp3
│   ├── toggle-off.mp3
│   ├── tab-change.mp3
│   ├── success-1.mp3
│   ├── success-2.mp3
│   ├── success-3.mp3
│   ├── error-soft.mp3
│   └── notification-ping.mp3
├── avatar/
│   ├── idle-1.mp3
│   ├── idle-2.mp3
│   ├── idle-3.mp3
│   ├── william-tap.mp3
│   ├── confetti-sneeze.mp3
│   ├── banana-slip.mp3
│   ├── bubble-burp.mp3
│   ├── pie-trap.mp3
│   ├── rubber-chicken.mp3
│   ├── hero-landing.mp3
│   ├── endless-scarf.mp3
│   ├── frog-crown.mp3
│   ├── chipmunk-voice.mp3
│   ├── marshmallow-volley.mp3
│   ├── hair-tornado.mp3
│   ├── tiger-shuffle.mp3
│   ├── lego-step.mp3
│   ├── goose-chase.mp3
│   ├── treasure-socks.mp3
│   └── william-on-break.mp3
├── weather/
│   ├── sunny-ambient.mp3
│   ├── cloudy-ambient.mp3
│   ├── rain-ambient.mp3
│   ├── storm-ambient.mp3
│   └── snow-ambient.mp3
├── music/
│   ├── hub-loop.mp3
│   ├── forest-loop.mp3
│   └── dungeon-loop.mp3
└── gameplay/
    └── battle-hit.mp3
```

---

## Update Attribution

After adding files, update `ASSET_ATTRIBUTION.md` with:
1. Actual file source (which site)
2. Author name
3. License
4. Direct URL to the file page
5. Any special notes

Example:
```markdown
- **File**: `assets/audio/ui/button-click-1.mp3`
- **Source**: Kenney Digital Audio
- **Author**: Kenney
- **License**: CC0 (Public Domain)
- **URL**: https://kenney.nl/assets/digital-audio
- **Original Filename**: click1.mp3
- **Notes**: No modifications needed
```

---

## Testing

After adding all files:

1. **Test in Browser**:
   ```bash
   # Start a local server
   python3 -m http.server 8080
   # Open http://localhost:8080/index.html
   ```

2. **Use Audio Test Page**:
   - Open `audio-test.html`
   - Click each sound card to test playback
   - Verify volume levels
   - Check for any issues

3. **Verify with Script**:
   ```bash
   ./download-audio-assets.sh
   ```

---

## Troubleshooting

### Issue: Audio not playing
- Check browser console for errors
- Ensure files are in MP3 format
- Verify file paths match manifest

### Issue: Volume too loud/quiet
- Re-normalize audio files
- Adjust in `assets/audio/sound-manifest.json`

### Issue: Loops not seamless
- Re-edit in Audacity with crossfade
- Ensure exact loop points

---

## Quick Reference: File Counts

- ✓ UI Sounds: 14 files
- ✓ Avatar Sounds: 20 files
- ✓ Weather Ambient: 5 files
- ✓ Background Music: 3 files
- ✓ Gameplay SFX: 1 file
- **Total: 43 files**

---

## License Compliance Checklist

- [ ] All files are CC0 or permissive licenses
- [ ] No NC (Non-Commercial) licenses used
- [ ] ASSET_ATTRIBUTION.md updated with all sources
- [ ] License files included if required
- [ ] Attribution added to Credits page if needed (CC-BY)

---

## Additional Resources

- **Kenney Asset Library**: https://kenney.nl/assets
- **Freesound Forum**: https://freesound.org/forum/
- **OpenGameArt Forum**: https://opengameart.org/forums
- **Creative Commons Search**: https://search.creativecommons.org/

---

**Last Updated**: February 2026
**Maintained by**: Williams World Development Team
