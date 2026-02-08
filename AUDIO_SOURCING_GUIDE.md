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

- **Total Files Needed**: 39 audio files
- **Format**: OGG Vorbis (primary)
- **License**: CC0 (Public Domain) preferred
- **Quality**: Kid-friendly, normalized volume, no silence padding

---

## Source 1: Kenney Digital Audio (CC0)

**Best for**: UI sounds, button clicks, success/error sounds

### Download
- **Official**: https://kenney.nl/assets/digital-audio
- **Mirror**: https://gamesounds.xyz/?dir=Kenney%27s%20Sound%20Pack/Digital%20Audio
- **License**: CC0 (Public Domain)
- **Format**: OGG + WAV included

### Files to Use from Kenney Pack

#### UI Sounds (from Digital Audio pack):
- `click1.ogg` → `ui/button-click-1.ogg`
- `click2.ogg` → `ui/button-click-2.ogg`
- `click3.ogg` → `ui/button-click-3.ogg`
- `select_001.ogg` → `ui/hover-tick.ogg`
- `confirmation_001.ogg` → `ui/success-1.ogg`
- `confirmation_002.ogg` → `ui/success-2.ogg`
- `confirmation_003.ogg` → `ui/success-3.ogg`
- `error_006.ogg` → `ui/error-soft.ogg`
- `toggle_001.ogg` → `ui/toggle-on.ogg`
- `toggle_002.ogg` → `ui/toggle-off.ogg`
- `switch_001.ogg` → `ui/tab-change.ogg`
- `powerUp_001.ogg` → `ui/panel-open.ogg`
- `powerDown_001.ogg` → `ui/panel-close.ogg`
- `ping_001.ogg` → `ui/notification-ping.ogg`

---

## Source 2: Bleeoop UI Clicks (Itch.io - CC0)

**Best for**: Additional UI variety

### Download
- **URL**: https://bleeoop.itch.io/ui-clicks
- **Price**: Name your own price ($0 is fine)
- **License**: CC0 (Public Domain)
- **Format**: OGG + WAV included

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
  - Combine with soft wind for `sunny-ambient.ogg`

- **Cloudy**: Search "wind gentle" + "leaves rustle"
  - Example: [Soft Wind](https://freesound.org/search/?q=soft+wind&f=license:%22Creative+Commons+0%22)
  - Use for `cloudy-ambient.ogg`

- **Rain**: Search "light rain loop"
  - Example: [Rain Loop](https://freesound.org/search/?q=rain+loop&f=license:%22Creative+Commons+0%22)
  - Use for `rain-ambient.ogg`

- **Storm**: Search "rain thunder storm"
  - Example: [Thunder Storm](https://freesound.org/search/?q=thunder+storm&f=license:%22Creative+Commons+0%22)
  - Use for `storm-ambient.ogg`

- **Snow**: Search "wind winter soft"
  - Example: [Winter Wind](https://freesound.org/search/?q=winter+wind+soft&f=license:%22Creative+Commons+0%22)
  - Use for `snow-ambient.ogg`

#### Avatar Sounds (Fun Effects):
- **Tap**: Search "tap soft" - for `william-tap.ogg`
- **Idle**: Search "cute chirp", "small pop", "tiny beep" - for `idle-*.ogg`
- **Sneeze**: Search "cartoon sneeze" - for `confetti-sneeze.ogg`
- **Slip**: Search "slip cartoon" or "slide whistle" - for `banana-slip.ogg`
- **Burp**: Search "cartoon burp" - for `bubble-burp.ogg`
- **Boing**: Search "spring boing" - for `pie-trap.ogg`
- **Squeak**: Search "rubber squeak" - for `rubber-chicken.ogg`
- **Whoosh**: Search "whoosh short" - for `hero-landing.ogg`
- **Flutter**: Search "cloth flutter" - for `endless-scarf.ogg`
- **Ribbit**: Search "frog ribbit" - for `frog-crown.ogg`
- **Glug**: Search "potion drink" - for `chipmunk-voice.ogg`
- **Poof**: Search "soft poof" - for `marshmallow-volley.ogg`
- **Wind spin**: Search "wind up toy" - for `hair-tornado.ogg`
- **Drum**: Search "short drum hit" - for `tiger-shuffle.ogg`
- **Click**: Search "plastic click" - for `lego-step.ogg`
- **Honk**: Search "goose honk cute" - for `goose-chase.ogg`
- **Chest open**: Search "chest open" - for `treasure-socks.ogg`

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
  - Use for `hub-loop.ogg`

- **Forest**: Search "forest music", "nature theme", "woodland"
  - Example: [Forest Theme](https://opengameart.org/art-search-advanced?keys=forest&field_art_type_tid%5B%5D=12&field_art_licenses_tid%5B%5D=4)
  - Use for `forest-loop.ogg`

- **Dungeon**: Search "dungeon theme", "cave music", "dark ambient"
  - Example: [Dungeon Music](https://opengameart.org/art-search-advanced?keys=dungeon&field_art_type_tid%5B%5D=12&field_art_licenses_tid%5B%5D=4)
  - Use for `dungeon-loop.ogg`

---

## Source 5: Pixabay (CC0)

**Best for**: Additional UI sounds and effects

### Download
- **URL**: https://pixabay.com/sound-effects/
- **License**: Pixabay License (free for commercial use, no attribution)
- **Format**: MP3 (convert to OGG)

### Search Terms
- "button click"
- "success sound"
- "notification"
- "whoosh"
- "toggle switch"

---

## File Conversion

If you download files in WAV or MP3 format, convert to OGG:

### Using ffmpeg (Command Line)
```bash
ffmpeg -i input.wav -c:a libvorbis -q:a 4 output.ogg
```

### Using Audacity (GUI)
1. File > Open > Select your audio file
2. File > Export > Export as OGG Vorbis
3. Set Quality: 5 (good balance of size/quality)

### Online Converters
- **CloudConvert**: https://cloudconvert.com/audio-converter
- **Online-Convert**: https://audio.online-convert.com/convert-to-ogg

---

## Audio Processing Tips

### Normalize Volume
Ensure consistent loudness across all files:
```bash
ffmpeg-normalize input.ogg -o output.ogg -c:a libvorbis -ext ogg
```

Or in Audacity:
1. Effect > Normalize
2. Set to -3.0 dB for UI sounds
3. Set to -18.0 dB for ambient/music

### Trim Silence
Remove silence at start/end:
```bash
ffmpeg -i input.ogg -af silenceremove=start_periods=1:start_silence=0.1:start_threshold=-50dB output.ogg
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
4. Export as OGG

---

## File Organization

After downloading and converting, organize files like this:

```
audio/
├── ui/
│   ├── button-click-1.ogg
│   ├── button-click-2.ogg
│   ├── button-click-3.ogg
│   ├── hover-tick.ogg
│   ├── panel-open.ogg
│   ├── panel-close.ogg
│   ├── toggle-on.ogg
│   ├── toggle-off.ogg
│   ├── tab-change.ogg
│   ├── success-1.ogg
│   ├── success-2.ogg
│   ├── success-3.ogg
│   ├── error-soft.ogg
│   └── notification-ping.ogg
├── avatar/
│   ├── idle-1.ogg
│   ├── idle-2.ogg
│   ├── idle-3.ogg
│   ├── william-tap.ogg
│   ├── confetti-sneeze.ogg
│   ├── banana-slip.ogg
│   ├── bubble-burp.ogg
│   ├── pie-trap.ogg
│   ├── rubber-chicken.ogg
│   ├── hero-landing.ogg
│   ├── endless-scarf.ogg
│   ├── frog-crown.ogg
│   ├── chipmunk-voice.ogg
│   ├── marshmallow-volley.ogg
│   ├── hair-tornado.ogg
│   ├── tiger-shuffle.ogg
│   ├── lego-step.ogg
│   ├── goose-chase.ogg
│   ├── treasure-socks.ogg
│   └── william-on-break.ogg
├── weather/
│   ├── sunny-ambient.ogg
│   ├── cloudy-ambient.ogg
│   ├── rain-ambient.ogg
│   ├── storm-ambient.ogg
│   └── snow-ambient.ogg
└── music/
    ├── hub-loop.ogg
    ├── forest-loop.ogg
    └── dungeon-loop.ogg
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
- **File**: `audio/ui/button-click-1.ogg`
- **Source**: Kenney Digital Audio
- **Author**: Kenney
- **License**: CC0 (Public Domain)
- **URL**: https://kenney.nl/assets/digital-audio
- **Original Filename**: click1.ogg
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
- Ensure files are in OGG format
- Verify file paths match manifest

### Issue: Volume too loud/quiet
- Re-normalize audio files
- Adjust in `sound-manifest.json`

### Issue: Loops not seamless
- Re-edit in Audacity with crossfade
- Ensure exact loop points

---

## Quick Reference: File Counts

- ✓ UI Sounds: 14 files
- ✓ Avatar Sounds: 20 files
- ✓ Weather Ambient: 5 files
- ✓ Background Music: 3 files
- **Total: 42 files**

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
