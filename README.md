# Williams World - Quest Tracker

An interactive quest tracker and gamification system that helps track daily tasks, earn experience points, level up, and maintain streaks!

## 🎮 Play Now

**Live Site:** [https://michaelbettsphoto-ai.github.io/Williamsworld/](https://michaelbettsphoto-ai.github.io/Williamsworld/)

## ✨ Features

### Quest Tracker
- **📋 Quest Management**: Add custom quests with customizable XP rewards
- **⭐ Level System**: Earn XP and level up as you complete quests
- **🔥 Streak Tracking**: Maintain daily completion streaks to stay motivated
- **💾 Auto-Save**: All progress is automatically saved to your browser's local storage
- **📱 Mobile Friendly**: Responsive design works perfectly on phones and tablets
- **🎨 Beautiful UI**: Modern gradient design with smooth animations
- **🎵 Audio System**: Dynamic sound effects, weather ambience, and customizable audio controls
- **🎭 William Avatar**: Interactive character with idle animations and fun Easter egg sounds
- **🌤️ Weather Effects**: Visual and audio weather system (rain, snow, storm, etc.)

### ⚔️ Battle System (NEW!)
- **🎴 Character Cards**: Pokemon × D&D mashup with 6 roles and 10 element types
- **⚡ Turn-Based Combat**: 3v3 tactical battles with type effectiveness
- **🎯 18+ Keywords**: Standardized effects (Damage, Heal, Shield, Stun, Poison, etc.)
- **📊 Type Chart**: Strategic elemental matchups with SUPER/RESIST feedback
- **🌟 Progression**: 3-rank system (Starter → Expert → Legendary)
- **🎮 Interactive Demo**: Try the battle simulator at `./battle-system-demo.html`

## 🎯 How It Works

1. **Add Quests**: Create your own tasks with custom XP rewards (or use the defaults)
2. **Complete Quests**: Check off tasks as you complete them to earn XP
3. **Level Up**: Accumulate XP to increase your level (XP requirements increase with each level)
4. **Build Streaks**: Complete quests daily to maintain your streak counter
5. **Track Progress**: View your stats including total XP, current level, streak, and completed quests

## 💻 Local Development

This is a static HTML/CSS/JavaScript application with no build requirements.

1. Clone the repository:
```bash
git clone https://github.com/michaelbettsphoto-ai/Williamsworld.git
```

2. Open `index.html` in your browser:
```bash
cd Williamsworld
open index.html  # macOS
# or
start index.html  # Windows
# or
xdg-open index.html  # Linux
```

That's it! No dependencies or build process needed.

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript** - No frameworks or dependencies
- **localStorage** - Data persists in your browser
- **Responsive Design** - Works on all screen sizes
- **Progressive XP System** - Each level requires 50% more XP than the previous
- **Streak Logic** - Tracks daily completions and resets after missing a day
- **Local Assets** - All images stored in the repository (no external dependencies)

## 📁 Asset Structure

```
assets/
├── images/      # UI + game images (banner, logo, companions, zones)
├── css/         # Shared stylesheets
├── js/          # Shared scripts
└── icons/       # Icon assets

assets/audio/
├── ui/          # UI sound effects (clicks, toggles, success/error)
├── avatar/      # William avatar sounds (idle, Easter eggs)
├── weather/     # Weather ambient loops (rain, storm, snow, etc.)
├── music/       # Background music loops
└── gameplay/    # Mini-game sound effects

battle-system/   # NEW: Character cards and battle mechanics
├── SPECIFICATION.md        # Complete design specification
├── IMPLEMENTATION_GUIDE.md # Developer implementation guide
├── data/
│   ├── game-constants.json # Roles, types, keywords, type chart
│   └── characters/         # Character card data (JSON)
└── ui/
    ├── card-templates.html # Visual component examples
    └── README.md           # UI component documentation
```

Replace the placeholder SVG files with your own images. Update paths in the `ASSETS` object in `index.html` if you change filenames or formats.

## 🎵 Audio System

Williams World includes a comprehensive audio system with:

- **UI Sound Effects** - Button clicks, panel open/close, success/error feedback
- **William Avatar Sounds** - Idle emotes and fun Easter egg sounds
- **Weather Ambience** - Dynamic ambient sounds that change with weather
- **Background Music** - Optional looping music tracks
- **User Controls** - Master mute, separate volume sliders, reduce sound mode

### Audio Controls
- Click the 🔊 icon in the bottom-right to open audio settings
- Adjust Music, Ambience, and SFX volumes independently
- Shift+Click the audio icon for quick mute/unmute
- Enable "Reduce Sound Mode" to minimize idle sounds
- All preferences are saved to localStorage

### Testing Audio
Open `audio-test.html` in your browser to preview all sound effects and test the audio system.

### Getting Audio Files

**🚀 Quick Start**: See `QUICKSTART_AUDIO.md` for the fastest way to add audio (5 minutes)

**📚 Complete Guide**: See `AUDIO_SOURCING_GUIDE.md` for:
- Verified CC0 sources (Kenney, Freesound, OpenGameArt)
- Direct download links
- File conversion instructions
- Audio processing tips

**🛠️ Helper Scripts**:
```bash
# Interactive guided download
./download-audio-assets.sh

# Generate test placeholders
python3 generate-placeholder-audio.py
```

### Adding Audio Files
1. Download from CC0 sources (see guides above)
2. Convert to MP3 format if needed: `ffmpeg -i input.wav -c:a libmp3lame -q:a 4 output.mp3`
3. Place files in the appropriate `/assets/audio/` subdirectory
4. Files should be normalized, trimmed, and kid-safe
5. See `/assets/audio/sound-manifest.json` for complete sound mapping

## 🎨 Customization

### Quest Tracker
- Default quests in the `loadGameState()` function
- XP multipliers in the `xpForLevel()` function
- Colors and styling in the `<style>` section
- Add your own character images in the `assets/` directory

### Battle System
- Create new characters using the JSON template in `./battle-system/data/characters/`
- Add new element types by updating `game-constants.json`
- Customize UI components in `./assets/css/character-cards.css`
- Extend battle mechanics in `./assets/js/battle-system/battle-engine.js`
- See `./battle-system/IMPLEMENTATION_GUIDE.md` for detailed instructions



## 🖼️ Images & Assets

The application uses Google Drive to host images:

### Currently Active Images (3):
- **Logo** - Small branding icon in the header
- **Banner** - Background image for the main banner section
- **Map Strip** - World map visualization

### Unused Image References (7):
The code includes definitions for additional images that are not currently displayed:
- **Companions** (3): ember, sprite, golem - Missing HTML elements (`<img id="emberImg">`, etc.)
- **Zones** (4): z1-z4 zone images - Defined but never referenced in the code

To validate which images are loading correctly, open `validate-images.html` in your browser.

## 📝 Data Storage

All game data is stored in your browser's localStorage under the key `williamsWorldState`. This includes:
- Current XP and level
- Active quests and their completion status
- Streak counter
- Total completed quests
- Last completion date

## 🔑 Parent Controls

William's World uses PINs to protect parent-only settings and controls.

| Feature | PIN | Where it's used |
|---|---|---|
| Screen Time management | `062923` | Add bonus minutes, behavior awards, unlock extra time |
| Homework Quest Board | `4242` | Unlock parent edit mode for homework quests |

> **Note:** Both PINs can be changed by editing the `PARENT_PIN` constants in `js/screen-time.js` and `js/hub.js`. For better security, choose a PIN that is not based on a date or other easily guessable pattern.

## 🔒 Privacy

All data is stored locally in your browser. No data is sent to any server or third party.

## 📄 License

Open source - feel free to fork, modify, and use for your own projects!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

---

**Created for Williams - Happy questing! 🎮✨**
