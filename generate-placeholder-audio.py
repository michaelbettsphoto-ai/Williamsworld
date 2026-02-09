#!/usr/bin/env python3
"""
Generate placeholder audio files for Williams World
Creates minimal MP3 files that can be replaced with actual sounds
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

def convert_to_mp3(wav_file, mp3_file):
    """Convert WAV to MP3 using ffmpeg if available"""
    try:
        subprocess.run(['ffmpeg', '-i', wav_file, '-c:a', 'libmp3lame', '-q:a', '4', mp3_file, '-y'],
                      check=True, capture_output=True)
        os.remove(wav_file)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # If ffmpeg not available, keep WAV placeholder
        os.rename(wav_file, mp3_file.replace('.mp3', '.wav'))
        return False

# Audio file specifications
audio_files = {
    'ui': [
        ('button-click-1.mp3', 0.05, 800),
        ('button-click-2.mp3', 0.05, 900),
        ('button-click-3.mp3', 0.05, 1000),
        ('hover-tick.mp3', 0.03, 1200),
        ('panel-open.mp3', 0.2, 600),
        ('panel-close.mp3', 0.2, 500),
        ('toggle-on.mp3', 0.1, 1000),
        ('toggle-off.mp3', 0.1, 800),
        ('tab-change.mp3', 0.08, 1100),
        ('success-1.mp3', 0.4, 800),
        ('success-2.mp3', 0.4, 900),
        ('success-3.mp3', 0.4, 1000),
        ('error-soft.mp3', 0.3, 400),
        ('notification-ping.mp3', 0.2, 1500),
    ],
    'avatar': [
        ('idle-1.mp3', 0.5, 440),
        ('idle-2.mp3', 0.5, 550),
        ('idle-3.mp3', 0.5, 660),
        ('william-tap.mp3', 0.05, 1000),
        ('confetti-sneeze.mp3', 1.0, 700),
        ('banana-slip.mp3', 1.0, 300),
        ('bubble-burp.mp3', 0.6, 200),
        ('pie-trap.mp3', 0.8, 500),
        ('rubber-chicken.mp3', 0.6, 800),
        ('hero-landing.mp3', 0.8, 600),
        ('endless-scarf.mp3', 0.6, 900),
        ('frog-crown.mp3', 0.8, 400),
        ('chipmunk-voice.mp3', 0.7, 1200),
        ('marshmallow-volley.mp3', 0.8, 700),
        ('hair-tornado.mp3', 1.0, 350),
        ('tiger-shuffle.mp3', 1.0, 500),
        ('lego-step.mp3', 0.5, 1100),
        ('goose-chase.mp3', 1.2, 600),
        ('treasure-socks.mp3', 1.0, 800),
        ('william-on-break.mp3', 2.0, 440),
    ],
    'weather': [
        ('sunny-ambient.mp3', 3.0, 300),
        ('cloudy-ambient.mp3', 3.0, 250),
        ('rain-ambient.mp3', 3.0, 200),
        ('storm-ambient.mp3', 3.0, 150),
        ('snow-ambient.mp3', 3.0, 280),
    ],
    'music': [
        ('hub-loop.mp3', 4.0, 440),
        ('forest-loop.mp3', 4.0, 392),
        ('dungeon-loop.mp3', 4.0, 330),
    ],
    'gameplay': [
        ('battle-hit.mp3', 0.4, 560),
    ]
}

def main():
    base_dir = '/home/runner/work/Williamsworld/Williamsworld/assets/audio'
    
    print("Generating placeholder audio files for Williams World...")
    print("=" * 60)
    
    ffmpeg_available = False
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        ffmpeg_available = True
        print("✓ ffmpeg found - will generate proper MP3 files")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ ffmpeg not found - will generate WAV placeholders")
        print("  Install ffmpeg to generate proper MP3 files")
    
    print()
    
    created_count = 0
    for category, files in audio_files.items():
        category_dir = os.path.join(base_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        print(f"\n{category.upper()} sounds ({len(files)} files):")
        for filename, duration, freq in files:
            wav_path = os.path.join(category_dir, filename.replace('.mp3', '.wav'))
            mp3_path = os.path.join(category_dir, filename)
            
            # Create beep sound
            create_beep_wav(wav_path, duration, freq)
            
            # Convert to MP3 or rename
            if ffmpeg_available:
                if convert_to_mp3(wav_path, mp3_path):
                    print(f"  ✓ {filename}")
                    created_count += 1
                else:
                    print(f"  ✗ {filename} (conversion failed)")
            else:
                # Just create a WAV as placeholder
                os.rename(wav_path, mp3_path.replace('.mp3', '.wav'))
                print(f"  ⚠ {filename.replace('.mp3', '.wav')} (placeholder)")
                created_count += 1
    
    print()
    print("=" * 60)
    print(f"Created {created_count} placeholder audio files")
    
    if not ffmpeg_available:
        print()
        print("NOTE: Placeholder files are in WAV format.")
        print("To convert to MP3, install ffmpeg and run:")
        print("  for f in assets/audio/*/*.wav; do")
        print("    ffmpeg -i \"$f\" -c:a libmp3lame -q:a 4 \"${f%.wav}.mp3\"")
        print("    rm \"$f\"")
        print("  done")
    
    print()
    print("These are test placeholders with simple beeps.")
    print("Replace them with actual sounds from CC0 sources.")
    print("See AUDIO_SOURCING_GUIDE.md for download instructions.")

if __name__ == '__main__':
    main()
