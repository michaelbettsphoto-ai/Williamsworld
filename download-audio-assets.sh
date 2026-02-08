#!/bin/bash
# Audio Asset Download Script for Williams World
# This script helps download CC0 audio assets from verified sources

set -e

AUDIO_DIR="/home/runner/work/Williamsworld/Williamsworld/audio"

echo "================================================"
echo "Williams World - Audio Asset Download Script"
echo "================================================"
echo ""
echo "This script will guide you through downloading CC0 audio assets."
echo "All sources are verified as CC0 (Public Domain) or permissive licenses."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        return 1
    fi
}

echo "Step 1: Download Kenney Digital Audio Pack (CC0)"
echo "------------------------------------------------"
echo "Visit: https://kenney.nl/assets/digital-audio"
echo "OR mirror: https://gamesounds.xyz/?dir=Kenney%27s%20Sound%20Pack/Digital%20Audio"
echo ""
echo "Download the ZIP file and extract it to a temporary folder."
echo ""
read -p "Press Enter when you have downloaded and extracted the pack..."

echo ""
echo "Step 2: Download Bleeoop UI Clicks (CC0)"
echo "------------------------------------------------"
echo "Visit: https://bleeoop.itch.io/ui-clicks"
echo "Download the pack (name your own price - can be $0)"
echo "Extract to a temporary folder."
echo ""
read -p "Press Enter when you have downloaded and extracted the pack..."

echo ""
echo "Step 3: Download Freesound Ambient Sounds (CC0)"
echo "------------------------------------------------"
echo "Visit: https://freesound.org/"
echo "Search for and download CC0 licensed:"
echo "  - Rain loops (light rain)"
echo "  - Storm sounds (rain + thunder)"
echo "  - Wind sounds (gentle wind)"
echo "  - Bird sounds (gentle chirping)"
echo "  - Snow ambience"
echo ""
echo "Filter by: License = Creative Commons 0 (CC0)"
echo ""
read -p "Press Enter when you have downloaded the sounds..."

echo ""
echo "Step 4: Download OpenGameArt Music (CC0)"
echo "------------------------------------------------"
echo "Visit: https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12&sort_by=count&sort_order=DESC"
echo "Filter by: License = CC0"
echo "Search for and download:"
echo "  - Town/village music loops"
echo "  - Forest/nature music loops"
echo "  - Dungeon/cave music loops"
echo ""
read -p "Press Enter when you have downloaded the music..."

echo ""
echo "Step 5: Convert Audio Files"
echo "------------------------------------------------"
echo "All audio files need to be in OGG format."
echo ""
echo "If you have files in WAV, MP3, or other formats, convert them using:"
echo "  - ffmpeg: ffmpeg -i input.wav output.ogg"
echo "  - Audacity: File > Export > Export as OGG Vorbis"
echo "  - Online converter: https://cloudconvert.com/audio-converter"
echo ""
read -p "Press Enter when all files are converted to OGG format..."

echo ""
echo "Step 6: Organize and Copy Files"
echo "------------------------------------------------"
echo "Copy your audio files to the appropriate directories:"
echo ""
echo "UI Sounds (11 files) -> $AUDIO_DIR/ui/"
echo "  - button-click-1.ogg, button-click-2.ogg, button-click-3.ogg"
echo "  - hover-tick.ogg"
echo "  - panel-open.ogg, panel-close.ogg"
echo "  - toggle-on.ogg, toggle-off.ogg"
echo "  - tab-change.ogg"
echo "  - success-1.ogg, success-2.ogg, success-3.ogg"
echo "  - error-soft.ogg"
echo "  - notification-ping.ogg"
echo ""
echo "Avatar Sounds (20 files) -> $AUDIO_DIR/avatar/"
echo "  - idle-1.ogg, idle-2.ogg, idle-3.ogg"
echo "  - william-tap.ogg"
echo "  - confetti-sneeze.ogg, banana-slip.ogg, bubble-burp.ogg"
echo "  - pie-trap.ogg, rubber-chicken.ogg, hero-landing.ogg"
echo "  - endless-scarf.ogg, frog-crown.ogg, chipmunk-voice.ogg"
echo "  - marshmallow-volley.ogg, hair-tornado.ogg, tiger-shuffle.ogg"
echo "  - lego-step.ogg, goose-chase.ogg, treasure-socks.ogg"
echo "  - william-on-break.ogg"
echo ""
echo "Weather Ambient (5 files) -> $AUDIO_DIR/weather/"
echo "  - sunny-ambient.ogg (birds + breeze)"
echo "  - cloudy-ambient.ogg (wind + rustle)"
echo "  - rain-ambient.ogg (light rain)"
echo "  - storm-ambient.ogg (rain + thunder)"
echo "  - snow-ambient.ogg (soft wind)"
echo ""
echo "Background Music (3 files) -> $AUDIO_DIR/music/"
echo "  - hub-loop.ogg"
echo "  - forest-loop.ogg"
echo "  - dungeon-loop.ogg"
echo ""
read -p "Press Enter when you have organized all files..."

echo ""
echo "Step 7: Verify Files"
echo "------------------------------------------------"
echo "Checking for required audio files..."
echo ""

# Track missing files
MISSING=0

# UI Files
echo "UI Sounds:"
for file in button-click-1.ogg button-click-2.ogg button-click-3.ogg hover-tick.ogg panel-open.ogg panel-close.ogg toggle-on.ogg toggle-off.ogg tab-change.ogg success-1.ogg success-2.ogg success-3.ogg error-soft.ogg notification-ping.ogg; do
    check_file "$AUDIO_DIR/ui/$file" || ((MISSING++))
done

echo ""
echo "Avatar Sounds:"
for file in idle-1.ogg idle-2.ogg idle-3.ogg william-tap.ogg confetti-sneeze.ogg banana-slip.ogg bubble-burp.ogg pie-trap.ogg rubber-chicken.ogg hero-landing.ogg endless-scarf.ogg frog-crown.ogg chipmunk-voice.ogg marshmallow-volley.ogg hair-tornado.ogg tiger-shuffle.ogg lego-step.ogg goose-chase.ogg treasure-socks.ogg william-on-break.ogg; do
    check_file "$AUDIO_DIR/avatar/$file" || ((MISSING++))
done

echo ""
echo "Weather Ambient:"
for file in sunny-ambient.ogg cloudy-ambient.ogg rain-ambient.ogg storm-ambient.ogg snow-ambient.ogg; do
    check_file "$AUDIO_DIR/weather/$file" || ((MISSING++))
done

echo ""
echo "Background Music:"
for file in hub-loop.ogg forest-loop.ogg dungeon-loop.ogg; do
    check_file "$AUDIO_DIR/music/$file" || ((MISSING++))
done

echo ""
echo "================================================"
if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}SUCCESS!${NC} All audio files are in place."
    echo ""
    echo "Next steps:"
    echo "1. Update ASSET_ATTRIBUTION.md with actual file sources"
    echo "2. Test audio playback by opening index.html in a browser"
    echo "3. Use audio-test.html to preview all sounds"
else
    echo -e "${RED}WARNING:${NC} $MISSING audio files are missing."
    echo "Please add the missing files and run this script again."
fi
echo "================================================"
