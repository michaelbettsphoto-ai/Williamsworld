# Weather Ambient Audio

This directory contains all weather ambient sound loops for Williams World.

## Sound Files

- `sunny-ambient.ogg` - Light birds + soft breeze (very subtle)
- `cloudy-ambient.ogg` - Gentle wind + distant rustle (no rain)
- `rain-ambient.ogg` - Light rain loop + occasional soft drip
- `storm-ambient.ogg` - Rain + wind + very occasional low thunder
- `snow-ambient.ogg` - Soft wind + muffled ambience + optional bell shimmer

## Technical Specs
- Format: OGG (loopable)
- Volume: -18 to -24 LUFS relative loudness (quiet background)
- Duration: Seamless loops
- Crossfade: 0.8-1.5 seconds between weather changes
- Never stack two weather loops at full volume
- Always fade out old layer when switching

## Behavior
- Weather changes when user selects from weather menu
- Smooth crossfade transitions (no hard cuts)
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
