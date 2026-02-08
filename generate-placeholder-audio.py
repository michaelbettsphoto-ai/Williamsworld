#!/usr/bin/env python3
"""
Generate placeholder audio files for Williams World
Creates minimal OGG files that can be replaced with actual sounds
"""

import os
import wave
import struct
import subprocess

def create_silent_wav(filename, duration=0.1):
    """Create a silent WAV file"""
    sample_rate = 44100
    num_samples = int(sample_rate * duration)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Write silent samples
        for _ in range(num_samples):
            wav_file.writeframes(struct.pack('<h', 0))

def create_beep_wav(filename, duration=0.1, frequency=440):
    """Create a simple beep WAV file for testing"""
    import math
    sample_rate = 44100
    num_samples = int(sample_rate * duration)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Generate a simple sine wave
        for i in range(num_samples):
            value = int(32767.0 * 0.1 * math.sin(2 * math.pi * frequency * i / sample_rate))
            wav_file.writeframes(struct.pack('<h', value))

def convert_to_ogg(wav_file, ogg_file):
    """Convert WAV to OGG using ffmpeg if available"""
    try:
        subprocess.run(['ffmpeg', '-i', wav_file, '-c:a', 'libvorbis', '-q:a', '4', ogg_file, '-y'],
                      check=True, capture_output=True)
        os.remove(wav_file)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # If ffmpeg not available, just rename WAV to OGG (won't work in browser but marks the placeholder)
        os.rename(wav_file, ogg_file + '.wav.placeholder')
        return False

# Audio file specifications
audio_files = {
    'ui': [
        ('button-click-1.ogg', 0.05, 800),
        ('button-click-2.ogg', 0.05, 900),
        ('button-click-3.ogg', 0.05, 1000),
        ('hover-tick.ogg', 0.03, 1200),
        ('panel-open.ogg', 0.2, 600),
        ('panel-close.ogg', 0.2, 500),
        ('toggle-on.ogg', 0.1, 1000),
        ('toggle-off.ogg', 0.1, 800),
        ('tab-change.ogg', 0.08, 1100),
        ('success-1.ogg', 0.4, 800),
        ('success-2.ogg', 0.4, 900),
        ('success-3.ogg', 0.4, 1000),
        ('error-soft.ogg', 0.3, 400),
        ('notification-ping.ogg', 0.2, 1500),
    ],
    'avatar': [
        ('idle-1.ogg', 0.5, 440),
        ('idle-2.ogg', 0.5, 550),
        ('idle-3.ogg', 0.5, 660),
        ('william-tap.ogg', 0.05, 1000),
        ('confetti-sneeze.ogg', 1.0, 700),
        ('banana-slip.ogg', 1.0, 300),
        ('bubble-burp.ogg', 0.6, 200),
        ('pie-trap.ogg', 0.8, 500),
        ('rubber-chicken.ogg', 0.6, 800),
        ('hero-landing.ogg', 0.8, 600),
        ('endless-scarf.ogg', 0.6, 900),
        ('frog-crown.ogg', 0.8, 400),
        ('chipmunk-voice.ogg', 0.7, 1200),
        ('marshmallow-volley.ogg', 0.8, 700),
        ('hair-tornado.ogg', 1.0, 350),
        ('tiger-shuffle.ogg', 1.0, 500),
        ('lego-step.ogg', 0.5, 1100),
        ('goose-chase.ogg', 1.2, 600),
        ('treasure-socks.ogg', 1.0, 800),
        ('william-on-break.ogg', 2.0, 440),
    ],
    'weather': [
        ('sunny-ambient.ogg', 3.0, 300),
        ('cloudy-ambient.ogg', 3.0, 250),
        ('rain-ambient.ogg', 3.0, 200),
        ('storm-ambient.ogg', 3.0, 150),
        ('snow-ambient.ogg', 3.0, 280),
    ],
    'music': [
        ('hub-loop.ogg', 4.0, 440),
        ('forest-loop.ogg', 4.0, 392),
        ('dungeon-loop.ogg', 4.0, 330),
    ]
}

def main():
    base_dir = '/home/runner/work/Williamsworld/Williamsworld/audio'
    
    print("Generating placeholder audio files for Williams World...")
    print("=" * 60)
    
    ffmpeg_available = False
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        ffmpeg_available = True
        print("✓ ffmpeg found - will generate proper OGG files")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ ffmpeg not found - will generate WAV placeholders")
        print("  Install ffmpeg to generate proper OGG files")
    
    print()
    
    created_count = 0
    for category, files in audio_files.items():
        category_dir = os.path.join(base_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        print(f"\n{category.upper()} sounds ({len(files)} files):")
        for filename, duration, freq in files:
            wav_path = os.path.join(category_dir, filename.replace('.ogg', '.wav'))
            ogg_path = os.path.join(category_dir, filename)
            
            # Create beep sound
            create_beep_wav(wav_path, duration, freq)
            
            # Convert to OGG or rename
            if ffmpeg_available:
                if convert_to_ogg(wav_path, ogg_path):
                    print(f"  ✓ {filename}")
                    created_count += 1
                else:
                    print(f"  ✗ {filename} (conversion failed)")
            else:
                # Just create a WAV as placeholder
                os.rename(wav_path, ogg_path.replace('.ogg', '.wav'))
                print(f"  ⚠ {filename.replace('.ogg', '.wav')} (placeholder)")
                created_count += 1
    
    print()
    print("=" * 60)
    print(f"Created {created_count} placeholder audio files")
    
    if not ffmpeg_available:
        print()
        print("NOTE: Placeholder files are in WAV format.")
        print("To convert to OGG, install ffmpeg and run:")
        print("  for f in audio/*/*.wav; do")
        print("    ffmpeg -i \"$f\" -c:a libvorbis -q:a 4 \"${f%.wav}.ogg\"")
        print("    rm \"$f\"")
        print("  done")
    
    print()
    print("These are test placeholders with simple beeps.")
    print("Replace them with actual sounds from CC0 sources.")
    print("See AUDIO_SOURCING_GUIDE.md for download instructions.")

if __name__ == '__main__':
    main()
