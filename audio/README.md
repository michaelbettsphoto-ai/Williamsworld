# Williams World Audio Assets

This directory contains all audio assets for Williams World.

## Current Status

**Placeholder files are currently in place** - These are simple WAV beep files generated for testing the audio system infrastructure. They allow developers to verify the audio system works before adding actual sounds.

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

- **Format**: OGG Vorbis (primary) or WAV (will be converted)
- **Sample Rate**: 44.1 kHz
- **Channels**: Mono or Stereo
- **Bit Rate**: 128 kbps for OGG
- **Quality**: Clean, normalized, no clipping

### Directory Structure

```
audio/
├── ui/              # UI sound effects (14 files)
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
│
├── avatar/          # William avatar sounds (20 files)
│   ├── idle-1.ogg, idle-2.ogg, idle-3.ogg
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
│
├── weather/         # Weather ambient loops (5 files)
│   ├── sunny-ambient.ogg
│   ├── cloudy-ambient.ogg
│   ├── rain-ambient.ogg
│   ├── storm-ambient.ogg
│   └── snow-ambient.ogg
│
└── music/           # Background music (3 files)
    ├── hub-loop.ogg
    ├── forest-loop.ogg
    └── dungeon-loop.ogg
```

### Replacing Placeholder Files

1. Download actual sounds from CC0 sources
2. Convert to OGG format if needed:
   ```bash
   ffmpeg -i input.wav -c:a libvorbis -q:a 4 output.ogg
   ```
3. Replace the placeholder files with the same filenames
4. Update `../ASSET_ATTRIBUTION.md` with proper attribution
5. Test in browser with `../audio-test.html`

### Converting WAV to OGG

If you have WAV files, convert them all at once:

```bash
# Install ffmpeg first (if not already installed)
# Ubuntu/Debian: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
# Windows: Download from ffmpeg.org

# Convert all WAV files to OGG
for dir in ui avatar weather music; do
  for wav in audio/$dir/*.wav; do
    if [ -f "$wav" ]; then
      ogg="${wav%.wav}.ogg"
      ffmpeg -i "$wav" -c:a libvorbis -q:a 4 "$ogg" -y
      rm "$wav"
      echo "Converted: $ogg"
    fi
  done
done
```

### Sound Specifications

See `sound-manifest.json` for detailed specifications including:
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
- Verify OGG format (not WAV)
- Check file permissions

**Volume too loud/quiet?**
- Adjust in `../index.html` AudioManager volumes
- Re-normalize audio files
- Update `sound-manifest.json`

**Loops not seamless?**
- Use Audacity to create perfect loop points
- Apply crossfade at loop boundaries
- Ensure exact sample lengths

---

## Current Placeholder Files

The current WAV files are simple sine wave beeps at different frequencies:
- **UI sounds**: 400-1500 Hz, 0.03-0.4s duration
- **Avatar sounds**: 200-1200 Hz, 0.5-2.0s duration
- **Weather**: 150-300 Hz, 3.0s duration
- **Music**: 330-440 Hz, 4.0s duration

These serve only as development placeholders to test the audio system infrastructure.

## Need Help?

- Read `../AUDIO_SOURCING_GUIDE.md` for step-by-step instructions
- Check `../AUDIO_IMPLEMENTATION.md` for technical details
- Run `../download-audio-assets.sh` for interactive setup
- See `../ASSET_ATTRIBUTION.md` for licensing examples

---

**Status**: 🟡 Placeholder files in place - Needs real CC0 audio assets  
**Last Updated**: February 2026
