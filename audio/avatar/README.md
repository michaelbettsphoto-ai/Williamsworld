# William Avatar Sound Effects

This directory contains all sound effects for William's idle emotes and Easter egg interactions.

## Sound Files

### Core Avatar Sounds
- `idle-1.ogg` - Gentle idle emote sound
- `idle-2.ogg` - Idle variation
- `idle-3.ogg` - Idle variation
- `william-tap.ogg` - Consistent tap sound for clicking William

### Easter Egg Sounds (Fun interactions!)
- `confetti-sneeze.ogg` - Confetti Sneezus
- `banana-slip.ogg` - Banana Slip of Destiny
- `bubble-burp.ogg` - Bubble Burp +1
- `pie-trap.ogg` - Pie Trap Triggered
- `rubber-chicken.ogg` - Rubber Chicken Summon
- `hero-landing.ogg` - Hero Landing (Micro Edition)
- `endless-scarf.ogg` - Endless Scarf Loot
- `frog-crown.ogg` - Frog Crown Miscast
- `chipmunk-voice.ogg` - Potion of Chipmunk Voice
- `marshmallow-volley.ogg` - Marshmallow Volley
- `hair-tornado.ogg` - Hair Tornado
- `tiger-shuffle.ogg` - Tiger Shuffle dance
- `lego-step.ogg` - LEGO Step Reaction
- `goose-chase.ogg` - Goose Chase Encounter
- `treasure-socks.ogg` - Treasure Chest of SOCKS

### Special Sounds
- `william-on-break.ogg` - Spam prevention message

## Technical Specs
- Format: OGG primary
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
