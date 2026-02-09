# Williams World Audio Assets

Audio assets live in `assets/audio/` for Williams World. This folder documents the structure and sourcing guidance.

## Current Status

**Placeholder files are currently in place** - Generated MP3 tone files live in `assets/audio/` so the audio system can be tested before adding real sounds.

## Getting Real Audio Assets

To add actual CC0 (Public Domain) audio assets, follow these steps:

### Quick Start

1. **Follow the sourcing guide**:
   ```
   See ../AUDIO_SOURCING_GUIDE.md for detailed instructions
   ```

2. **Run the download helper script**:
   ```bash
   ../download-audio-assets.sh
   ```

3. **OR manually download from these verified CC0 sources**:
   - **Kenney Digital Audio**: https://kenney.nl/assets/digital-audio
   - **Bleeoop UI Clicks**: https://bleeoop.itch.io/ui-clicks
   - **Freesound** (CC0 filter): https://freesound.org/
   - **OpenGameArt** (CC0 filter): https://opengameart.org/

### File Format Requirements

- **Format**: MP3 (primary) or WAV (will be converted)
- **Sample Rate**: 44.1 kHz
- **Channels**: Mono or Stereo
- **Bit Rate**: 128 kbps for MP3
- **Quality**: Clean, normalized, no clipping

### Directory Structure

```
assets/audio/
├── ui/              # UI sound effects (14 files)
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
│
├── avatar/          # William avatar sounds (20 files)
│   ├── idle-1.mp3, idle-2.mp3, idle-3.mp3
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
│
├── weather/         # Weather ambient loops (5 files)
│   ├── sunny-ambient.mp3
│   ├── cloudy-ambient.mp3
│   ├── rain-ambient.mp3
│   ├── storm-ambient.mp3
│   └── snow-ambient.mp3
│
└── music/           # Background music (3 files)
    ├── hub-loop.mp3
    ├── forest-loop.mp3
    └── dungeon-loop.mp3

assets/audio/gameplay/
    └── battle-hit.mp3
```

### Replacing Placeholder Files

1. Download actual sounds from CC0 sources
2. Convert to MP3 format if needed:
   ```bash
   ffmpeg -i input.wav -c:a libmp3lame -q:a 4 output.mp3
   ```
3. Replace the placeholder files with the same filenames
4. Update `../ASSET_ATTRIBUTION.md` with proper attribution
5. Test in browser with `../audio-test.html`

### Converting WAV to MP3

If you have WAV files, convert them all at once:

```bash
# Install ffmpeg first (if not already installed)
# Ubuntu/Debian: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
# Windows: Download from ffmpeg.org

# Convert all WAV files to MP3
for dir in ui avatar weather music gameplay; do
  for wav in assets/audio/$dir/*.wav; do
    if [ -f "$wav" ]; then
      mp3="${wav%.wav}.mp3"
      ffmpeg -i "$wav" -c:a libmp3lame -q:a 4 "$mp3" -y
      rm "$wav"
      echo "Converted: $mp3"
    fi
  done
done
```

### Sound Specifications

See `assets/audio/sound-manifest.json` for detailed specifications including:
- Expected duration
- Volume levels
- Loop requirements
- Usage notes

### License Compliance

⚠️ **IMPORTANT**: All audio files must be:
- CC0 (Public Domain) OR
- CC-BY (with attribution in ASSET_ATTRIBUTION.md)
- NO "NC" (Non-Commercial) licenses
- NO unclear licensing

Update `../ASSET_ATTRIBUTION.md` with:
- Source (website)
- Author name
- License type
- Original URL
- Any modifications made

### Testing

After adding real audio files:

1. **Open in browser**:
   ```bash
   python3 -m http.server 8080
   # Visit http://localhost:8080/
   ```

2. **Test with audio test page**:
   - Open `../audio-test.html`
   - Click sound cards to test playback
   - Verify volume levels

3. **Test in main app**:
   - Open `../index.html`
   - Click UI elements
   - Click William avatar
   - Change weather
   - Verify all sounds play correctly

### Troubleshooting

**No sound playing?**
- Check browser console for errors
- Ensure files are properly named
- Verify MP3 format (not WAV)
- Check file permissions

**Volume too loud/quiet?**
- Adjust in `../index.html` AudioManager volumes
- Re-normalize audio files
- Update `assets/audio/sound-manifest.json`

**Loops not seamless?**
- Use Audacity to create perfect loop points
- Apply crossfade at loop boundaries
- Ensure exact sample lengths

---

## Current Placeholder Files

The current MP3 files are simple sine wave tones at different frequencies:
- **UI sounds**: short UI beeps (0.05-0.4s)
- **Avatar sounds**: mid-length emote tones (0.4-1.5s)
- **Weather**: ambient loops (~1.5s)
- **Music**: loopable tones (~2s)

These serve only as development placeholders to test the audio system infrastructure.

## Need Help?

- Read `../AUDIO_SOURCING_GUIDE.md` for step-by-step instructions
- Check `../AUDIO_IMPLEMENTATION.md` for technical details
- Run `../download-audio-assets.sh` for interactive setup
- See `../ASSET_ATTRIBUTION.md` for licensing examples

---

**Status**: 🟡 Placeholder files in place - Needs real CC0 audio assets  
**Last Updated**: February 2026
