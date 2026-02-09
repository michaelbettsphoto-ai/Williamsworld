# William Avatar Sound Effects

Avatar sound files live in `assets/audio/avatar/` for William's idle emotes and Easter egg interactions.

## Sound Files

### Core Avatar Sounds
- `idle-1.mp3` - Gentle idle emote sound
- `idle-2.mp3` - Idle variation
- `idle-3.mp3` - Idle variation
- `william-tap.mp3` - Consistent tap sound for clicking William

### Easter Egg Sounds (Fun interactions!)
- `confetti-sneeze.mp3` - Confetti Sneezus
- `banana-slip.mp3` - Banana Slip of Destiny
- `bubble-burp.mp3` - Bubble Burp +1
- `pie-trap.mp3` - Pie Trap Triggered
- `rubber-chicken.mp3` - Rubber Chicken Summon
- `hero-landing.mp3` - Hero Landing (Micro Edition)
- `endless-scarf.mp3` - Endless Scarf Loot
- `frog-crown.mp3` - Frog Crown Miscast
- `chipmunk-voice.mp3` - Potion of Chipmunk Voice
- `marshmallow-volley.mp3` - Marshmallow Volley
- `hair-tornado.mp3` - Hair Tornado
- `tiger-shuffle.mp3` - Tiger Shuffle dance
- `lego-step.mp3` - LEGO Step Reaction
- `goose-chase.mp3` - Goose Chase Encounter
- `treasure-socks.mp3` - Treasure Chest of SOCKS

### Special Sounds
- `william-on-break.mp3` - Spam prevention message

## Technical Specs
- Format: MP3 primary
- Idle sounds: 0.3-1.0s, quiet (volume ~0.4)
- Easter egg sounds: 0.5-1.5s, moderate volume (0.6-0.7)
- Rate limiting: 1 Easter egg per 1.5 seconds
- Spam prevention: 5 clicks in 3 seconds triggers cooldown

## Behavior
- Idle emotes play every 10 seconds
- Clicking William always plays tap sound first
- Easter eggs are fun, cartoonish, never gross or too loud
- Spam clicking triggers "on break" message and 60-second cooldown

## License
All sounds must be properly attributed in ASSET_ATTRIBUTION.md
