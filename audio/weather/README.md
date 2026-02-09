# Weather Ambient Audio

Weather ambience files live in `assets/audio/weather/` for Williams World.

## Sound Files

- `sunny-ambient.mp3` - Light birds + soft breeze (very subtle)
- `cloudy-ambient.mp3` - Gentle wind + distant rustle (no rain)
- `rain-ambient.mp3` - Light rain loop + occasional soft drip
- `storm-ambient.mp3` - Rain + wind + very occasional low thunder
- `snow-ambient.mp3` - Soft wind + muffled ambience + optional bell shimmer

## Technical Specs
- Format: MP3 (loopable)
- Volume: -18 to -24 LUFS relative loudness (quiet background)
- Duration: Seamless loops
- Transition: swap ambience loop on weather changes
- Never stack two weather loops at full volume
- Stop the previous loop when switching

## Behavior
- Weather changes when user selects from weather menu
- Switches to the new ambience loop on change
- Ambient audio feels like a layer underneath, not foreground
- No jump scares or sudden loud sounds
- Thunder in storm mode is rare, quiet, and non-threatening

## Weather Mapping
- **none** (Sunny): Sunny ambient
- **rain**: Rain ambient
- **snow**: Snow ambient
- **clouds**: Cloudy ambient
- **storm**: Storm ambient

## License
All sounds must be properly attributed in ASSET_ATTRIBUTION.md
