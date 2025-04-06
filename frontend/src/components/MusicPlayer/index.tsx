import { useState, useRef, useEffect } from 'react';
import { LuPlay, LuPause, LuVolume1, LuVolume2, LuRepeat, LuRepeat1, LuSkipForward, LuSkipBack } from "react-icons/lu";
import classes from './styles.module.css';

// Import icons
import sunIcon from '../../assets/icons/sun.png';
import moonIcon from '../../assets/icons/moon.png';
import sunnyIcon from '../../assets/icons/brightness.png';
import rainyIcon from '../../assets/icons/storm.png';
import snowyIcon from '../../assets/icons/snowflakes.png';

// Import audio files
import day_sunny from '../../assets/music/day_sunny.mp3';
import day_rainy from '../../assets/music/day_rainy.mp3';
import day_snowy from '../../assets/music/day_snowy.mp3';
import night_sunny from '../../assets/music/night_sunny.mp3';
import night_rainy from '../../assets/music/night_rainy.mp3';
import night_snowy from '../../assets/music/night_snowy.mp3';

// Constants for music fade in/out times
const FADE_OUT_TIME = 5; // seconds
const FADE_IN_TIME = 1; // seconds

export default function MusicPlayer({
  isAuto,
  piWeather,
  piTime
}: {
    isAuto: boolean;
    piWeather: string;
    piTime: string;
  }
): React.ReactElement {
  const musicList = [
    {
      title: "Sunny Day",
      src: day_sunny,
      weatherIcon: sunnyIcon,
      wiScale: 0.75,
      timeIcon: sunIcon,
      tiScale: 0.75,
      colorFrom: "#14C38E",
      colorTo: "#F9D423",
      weather: "none",
      time: "day"
    },
    {
      title: "Rainy Day",
      src: day_rainy,
      weatherIcon: rainyIcon,
      wiScale: 0.75,
      timeIcon: sunIcon,
      tiScale: 0.75,
      colorFrom: "#14C38E",
      colorTo: "#F9D423",
      weather: "rain",
      time: "day"
    },
    {
      title: "Snowy Day",
      src: day_snowy,
      weatherIcon: snowyIcon,
      wiScale: 0.75,
      timeIcon: sunIcon,
      tiScale: 0.75,
      colorFrom: "#14C38E",
      colorTo: "#F9D423",
      weather: "snow",
      time: "day"
    },
    {
      title: "Sunny Night",
      src: night_sunny,
      weatherIcon: sunnyIcon,
      wiScale: 0.75,
      timeIcon: moonIcon,
      tiScale: 1,
      colorFrom: "#1c73d0",
      colorTo: "#d24388",
      weather: "none",
      time: "night"
    },
    {
      title: "Rainy Night",
      src: night_rainy,
      weatherIcon: rainyIcon,
      wiScale: 0.75,
      timeIcon: moonIcon,
      tiScale: 1,
      colorFrom: "#1c73d0",
      colorTo: "#d24388",
      weather: "rain",
      time: "night"
    },
    {
      title: "Snowy Night",
      src: night_snowy,
      weatherIcon: snowyIcon,
      wiScale: 0.75,
      timeIcon: moonIcon,
      tiScale: 1,
      colorFrom: "#1c73d0",
      colorTo: "#d24388",
      weather: "snow",
      time: "night"
    }
  ];

  // State variables
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8); // Start with slightly lower volume
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopMode, setLoopMode] = useState('one'); // 'one', 'all'
  const [isFading, setIsFading] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const fadeIntervalRef = useRef<{
    fadeOut: number | null,
    fadeIn: number | null
  }>({
    fadeOut: null,
    fadeIn: null
  });

  // Current song
  const currentSong = musicList[currentSongIndex];

  // Effect to change song based on weather and time (and fade in/out)
  // This is only done if auto mode is enabled
  // Written with the help of Copilot
  useEffect(() => {
    // Store timeout ID in ref so we can clean it up
    let safetyTimeoutId: NodeJS.Timeout | null = null;

    if (isAuto && piWeather && piTime) {
      const matchingSongIndex = musicList.findIndex(
        song => song.weather === piWeather && song.time === piTime
      );

      if (matchingSongIndex !== -1 && matchingSongIndex !== currentSongIndex) {
        console.log(`Changing song to match weather: ${piWeather}, time: ${piTime}`);

        // Start fade-out of current song before changing
        if (audioRef.current && audioRef.current.volume > 0) {
          // Only fade if currently playing
          if (isPlaying && !audioRef.current.paused) {
            setIsFading(true);
            // console.log('Starting fade-out');

            // Save initial volume to restore later
            const initialVolume = volume;

            // Set safety timeout to restore controls if fade gets stuck
            safetyTimeoutId = setTimeout(() => {
              if (isFading) {
                console.warn('Fade safety timeout triggered - forcibly restoring controls');
                if (audioRef.current) {
                  audioRef.current.volume = initialVolume;
                }

                if (fadeIntervalRef.current.fadeOut) {
                  clearInterval(fadeIntervalRef.current.fadeOut);
                  fadeIntervalRef.current.fadeOut = null;
                }

                if (fadeIntervalRef.current.fadeIn) {
                  clearInterval(fadeIntervalRef.current.fadeIn);
                  fadeIntervalRef.current.fadeIn = null;
                }

                setIsFading(false);
              }
            }, (FADE_OUT_TIME + FADE_IN_TIME + 2) * 1000); // Add 2 seconds buffer

            // Clear any existing fade intervals
            if (fadeIntervalRef.current.fadeOut) {
              clearInterval(fadeIntervalRef.current.fadeOut);
              fadeIntervalRef.current.fadeOut = null;
            }
            if (fadeIntervalRef.current.fadeIn) {
              clearInterval(fadeIntervalRef.current.fadeIn);
              fadeIntervalRef.current.fadeIn = null;
            }

            // Create fade-out effect
            fadeIntervalRef.current.fadeOut = window.setInterval(() => {
              if (audioRef.current && audioRef.current.volume > 0.05) {
                audioRef.current.volume -= 0.05;
              } else {
                // Clear interval when volume is near zero
                if (fadeIntervalRef.current.fadeOut) {
                  clearInterval(fadeIntervalRef.current.fadeOut);
                  fadeIntervalRef.current.fadeOut = null;
                }

                // Change song and prepare for fade-in
                setCurrentSongIndex(matchingSongIndex);
                setIsPlaying(true);

                // Schedule fade-in after song change is applied
                setTimeout(() => {
                  // Start with zero volume
                  if (audioRef.current) {
                    audioRef.current.volume = 0;

                    // Ensure new audio is playing before fading in
                    const playPromise = audioRef.current.play().catch(error => {
                      console.warn('Auto-play prevented:', error);
                      setIsPlaying(false);
                      setIsFading(false);

                      // Also restore volume if play fails
                      if (audioRef.current) {
                        audioRef.current.volume = initialVolume;
                      }
                      return false;
                    });

                    playPromise.then((success) => {
                      if (success !== false) {
                        // Create fade-in effect only if play was successful
                        fadeIntervalRef.current.fadeIn = window.setInterval(() => {
                          if (audioRef.current && audioRef.current.volume < initialVolume - 0.05) {
                            audioRef.current.volume += 0.05;
                            // console.log('Fading in, current volume:', audioRef.current.volume);
                          } else {
                            // Reset to original volume and clear interval
                            if (audioRef.current) {
                              // Explicitly set to the exact original volume
                              audioRef.current.volume = initialVolume;
                              // console.log('Fade complete, restored volume to:', initialVolume);
                            }

                            if (fadeIntervalRef.current.fadeIn) {
                              clearInterval(fadeIntervalRef.current.fadeIn);
                              fadeIntervalRef.current.fadeIn = null;
                            }

                            // IMPORTANT: Make sure to set isFading to false here
                            setIsFading(false);
                          }
                        }, FADE_IN_TIME * 1000 / 20); // Divide into 20 steps
                      }
                    });
                  }
                }, 100); // Small delay to ensure song change is applied
              }
            }, FADE_OUT_TIME * 1000 / 20); // Divide into 20 steps
          } else {
            // No fade needed if not playing - immediately change
            setCurrentSongIndex(matchingSongIndex);
            setIsPlaying(true);
          }
        } else {
          // No audio element or volume already at 0 - immediately change
          setCurrentSongIndex(matchingSongIndex);
          setIsPlaying(true);
        }
      }
    }

    // Clean up any running fade intervals and timeouts
    return () => {
      if (safetyTimeoutId) {
        clearTimeout(safetyTimeoutId);
      }

      if (fadeIntervalRef.current.fadeOut) {
        clearInterval(fadeIntervalRef.current.fadeOut);
        fadeIntervalRef.current.fadeOut = null;
      }

      if (fadeIntervalRef.current.fadeIn) {
        clearInterval(fadeIntervalRef.current.fadeIn);
        fadeIntervalRef.current.fadeIn = null;
      }
    };
  }, [piWeather, piTime, isAuto, currentSongIndex, volume, isFading, isPlaying]);

  // Event handlers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isAuto) return; // Disable play/pause in auto mode

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Play was prevented:', error);
          setIsPlaying(false);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Loop mode control
  const cycleLoopMode = () => {
    if (isAuto) return; // Disable loop mode in auto mode (it should be always 'one')
    if (loopMode === 'all') {
      setLoopMode('one');
    } else {
      setLoopMode('all');
    }
  };

  // Play previous and next song
  const playPrevious = () => {
    if (isAuto || isFading) return; // Disable previous song in auto mode or during fade
    let newIndex = currentSongIndex - 1;
    if (newIndex < 0) {
      newIndex = musicList.length - 1;
    }
    setCurrentSongIndex(newIndex);
  };

  const playNext = () => {
    if (isAuto || isFading) return; // Disable next song in auto mode or during fade
    let newIndex = currentSongIndex + 1;
    if (newIndex >= musicList.length) {
      newIndex = 0;
    }
    setCurrentSongIndex(newIndex);
  };

  // Progress bar control
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (loopMode === 'one') {
      // Restart the same song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.warn('Auto-replay prevented:', error);
          setIsPlaying(false);
        });
      }
    } else if (loopMode === 'all' || currentSongIndex < musicList.length - 1) {
      // Play next song
      playNext();
    } else {
      // End of playlist with no loop
      setIsPlaying(false);
    }
  };

  // Handle progress bar click (only enabled for manual mode)
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current && !isAuto && !isFading) {
      const progressBarRect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - progressBarRect.left;
      const progressBarWidth = progressBarRect.width;
      const seekTime = (clickPosition / progressBarWidth) * duration;

      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Update audio when song changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();

      // Set the initial volume based on whether we're fading in
      if (isFading) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = volume;
      }

      if (isPlaying) {
        const playPromise = audioRef.current.play();

        // Handle potential rejection due to browser autoplay policy
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Autoplay started successfully
              // console.log('Audio playback started successfully');
            })
            .catch(error => {
              // Autoplay was prevented due to browser policy
              console.warn('Audio playback was prevented:', error);
              // Update UI state to reflect that playing actually failed
              setIsPlaying(false);
            });
        }
      }
    }
  }, [currentSongIndex, isPlaying]);

  // Set loop attribute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loopMode === 'one';
    }
  }, [loopMode]);

  return (
    <div className={classes.musicPlayer}>
      <span className={classes.musicTitleContainer}>
        <img src={currentSong.weatherIcon} alt="Weather Icon" className={classes.weatherIcon} style={{ transform: `scale(${currentSong.wiScale})` }} />
        <h2 className={classes.songTitle}
          style={{
            background: `radial-gradient(circle at 100%, ${currentSong.colorFrom}, ${currentSong.colorTo} 50%, ${currentSong.colorFrom} 75%, ${currentSong.colorFrom} 100%)`,
          }}
        >{currentSong.title}</h2>
        <img src={currentSong.timeIcon} alt="Time Icon" className={classes.timeIcon} style={{ transform: `scale(${currentSong.tiScale})` }} />
      </span>

      <div className={classes.timeControl}>
        <span className={classes.timeDisplay}>{formatTime(currentTime)}</span>
        <div
          ref={progressBarRef}
          className={classes.progressBarContainer}
          onClick={handleProgressClick}
        >
          <div
            className={classes.progressBar}
            style={{
              width: `${(currentTime / duration) * 100}%`,
              background: `linear-gradient(to right, ${currentSong.colorFrom}, ${currentSong.colorTo})`,
              opacity: isAuto || isFading ? 0.5 : 1
            }}
          ></div>
        </div>
        <span className={classes.timeDisplay}>{formatTime(duration)}</span>
      </div>

      <div className={classes.controller}>
        <div className={classes.controls}>
          <button onClick={playPrevious} className={classes.controlButton} disabled={isAuto || isFading}>
            <LuSkipBack style={{opacity: isAuto || isFading ? 0.5 : 1}} />
          </button>

          <button onClick={togglePlay} className={classes.controlButton} disabled={isAuto || isFading}>
            {isPlaying ? <LuPause style={{opacity: isAuto || isFading ? 0.5 : 1}} /> : <LuPlay style={{opacity: isAuto || isFading ? 0.5 : 1}} />}
          </button>

          <button onClick={playNext} className={classes.controlButton} disabled={isAuto || isFading}>
            <LuSkipForward style={{opacity: isAuto || isFading ? 0.5 : 1}} />
          </button>

          <button onClick={cycleLoopMode} className={classes.loopButton} disabled={isAuto || isFading}>
            {loopMode === 'all' ? <LuRepeat style={{opacity: isAuto || isFading ? 0.5 : 1}} /> : <LuRepeat1 style={{opacity: isAuto || isFading ? 0.5 : 1}} />}
          </button>
        </div>

        <div className={classes.volumeControl}>
          <LuVolume1 />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className={classes.volumeSlider}
            disabled={isFading}
            style={{opacity: isFading ? 0.5 : 1}}
          />
          <LuVolume2 />
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      >
        <source src={currentSong.src} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}