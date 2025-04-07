import { useState, useRef, useEffect } from 'react';
import { Popover } from 'antd';
import { /*LuPlay, LuPause, LuRepeat, LuRepeat1, LuSkipForward, LuSkipBack,*/ LuVolume1, LuVolume2 } from "react-icons/lu";
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
  piTime,
  onFadingChange
}: {
    isAuto: boolean;
    piWeather: string;
    piTime: string;
    onFadingChange?: (isFading: boolean) => void;
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
  const [volume, setVolume] = useState(1);
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


  // Update the parent component whenever isFading changes
  useEffect(() => {
    if (onFadingChange) {
      onFadingChange(isFading);
    }
  }, [isFading, onFadingChange]);


  // Fade in and fade out functions
  // Based on: https://stackoverflow.com/questions/64520315/how-to-fade-in-and-out-of-audio/64521347#64521347
  function fadeIn(audioElement: HTMLAudioElement, targetVolume: number, duration: number = 1000): number {
    const startVolume = 0;
    audioElement.volume = startVolume;
    
    const startTime = performance.now();
    
    const fadeId = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audioElement.volume = startVolume + (targetVolume - startVolume) * progress;
      
      if (progress >= 1) {
        clearInterval(fadeId);
        audioElement.volume = targetVolume; // Ensure we end at exactly the target volume
      }
    }, 16); // ~60fps for smooth transition
    
    return fadeId;
  }
  
  function fadeOut(audioElement: HTMLAudioElement, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const startVolume = audioElement.volume;
      const startTime = performance.now();
      
      const fadeId = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audioElement.volume = startVolume * (1 - progress);
        
        if (progress >= 1) {
          clearInterval(fadeId);
          audioElement.volume = 0; // Ensure we end at exactly 0
          resolve();
        }
      }, 16); // ~60fps for smooth transition
      
      fadeIntervalRef.current.fadeOut = fadeId;
    });
  }

  // If auto mode is enabled, loopMode should change to 'one'
  useEffect(() => {
    // If auto mode is enabled, set loop mode to 'one'
    if (isAuto && loopMode !== 'one') {
      setLoopMode('one');
      console.log('Auto mode enabled, setting loop mode to: one');
    }
  }, [isAuto]); 

  // Effect to change song based on weather and time (and fade in/out)
  // Fade in/out only done when weather/time condition changes (music control will have no fade in/out)
  // Written with the help of Copilot
  useEffect(() => {
    let safetyTimeoutId: NodeJS.Timeout | null = null;
  
    async function handleSongChange() {
      if (!piWeather || !piTime) return;
      
      const matchingSongIndex = musicList.findIndex(
        song => song.weather === piWeather && song.time === piTime
      );
  
      if (matchingSongIndex !== -1 && matchingSongIndex !== currentSongIndex && audioRef.current) {
        console.log(`Changing song to match weather: ${piWeather}, time: ${piTime}`);
        
        // Only fade if currently playing
        if (isPlaying && !audioRef.current.paused) {
          setIsFading(true);
          const initialVolume = volume;
  
          // Set safety timeout
          safetyTimeoutId = setTimeout(() => {
            if (isFading) {
              console.warn('Fade safety timeout triggered');
              setIsFading(false);
              if (audioRef.current) audioRef.current.volume = initialVolume;
              // Clear any intervals
              if (fadeIntervalRef.current.fadeOut) {
                clearInterval(fadeIntervalRef.current.fadeOut);
                fadeIntervalRef.current.fadeOut = null;
              }
              if (fadeIntervalRef.current.fadeIn) {
                clearInterval(fadeIntervalRef.current.fadeIn);
                fadeIntervalRef.current.fadeIn = null;
              }
            }
          }, (FADE_OUT_TIME + FADE_IN_TIME + 2) * 1000);
  
          // Clear any existing fade intervals
          if (fadeIntervalRef.current.fadeOut) {
            clearInterval(fadeIntervalRef.current.fadeOut);
            fadeIntervalRef.current.fadeOut = null;
          }
          if (fadeIntervalRef.current.fadeIn) {
            clearInterval(fadeIntervalRef.current.fadeIn);
            fadeIntervalRef.current.fadeIn = null;
          }
  
          // Fade out current song
          try {
            await fadeOut(audioRef.current, FADE_OUT_TIME * 1000);
            
            // Change song
            setCurrentSongIndex(matchingSongIndex);
            
            // Small delay to ensure React updates with new song
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (audioRef.current) {
              audioRef.current.volume = 0;
              
              try {
                await audioRef.current.play();
                // Start fade in
                fadeIntervalRef.current.fadeIn = fadeIn(audioRef.current, initialVolume, FADE_IN_TIME * 1000);
                
                // Set a timeout to mark fading as complete
                setTimeout(() => {
                  setIsFading(false);
                }, FADE_IN_TIME * 1000);
              } catch (error) {
                console.warn('Auto-play prevented:', error);
                setIsPlaying(false);
                setIsFading(false);
                audioRef.current.volume = initialVolume;
              }
            }
          } catch (error) {
            console.error('Error during fade transition:', error);
            setIsFading(false);
          }
        } else {
          // No fade needed - directly change song
          setCurrentSongIndex(matchingSongIndex);
          setIsPlaying(true);
        }
      }
    }
    
    handleSongChange();
    
    // Clean up function
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
  }, [piWeather, piTime, currentSongIndex, volume, isFading, isPlaying, isAuto]);

  // Event handlers
  // const togglePlay = () => {
  //   if (!audioRef.current) return;
  //   if (isAuto) return; // Disable play/pause in auto mode

  //   if (isPlaying) {
  //     audioRef.current.pause();
  //   } else {
  //     const playPromise = audioRef.current.play();

  //     if (playPromise !== undefined) {
  //       playPromise.catch(error => {
  //         console.warn('Play was prevented:', error);
  //         setIsPlaying(false);
  //       });
  //     }
  //   }
  //   setIsPlaying(!isPlaying);
  // };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // On keyboard event 'm' toggle mute
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'm') {
      if (audioRef.current) {
        if (audioRef.current.volume > 0) {
          audioRef.current.volume = 0;
          setVolume(0);
        } else {
          audioRef.current.volume = 1;
          setVolume(1);
        }
      }
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Loop mode control
  // const cycleLoopMode = () => {
  //   if (isAuto) return; // Disable loop mode in auto mode (it should be always 'one')
  //   if (loopMode === 'all') {
  //     setLoopMode('one');
  //   } else {
  //     setLoopMode('all');
  //   }
  // };

  // // Play previous and next song
  // const playPrevious = () => {
  //   if (isAuto || isFading) return; // Disable previous song in auto mode or during fade
  //   let newIndex = currentSongIndex - 1;
  //   if (newIndex < 0) {
  //     newIndex = musicList.length - 1;
  //   }
  //   setCurrentSongIndex(newIndex);
  // };

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
        <img
          src={currentSong.weatherIcon}
          alt="Weather Icon"
          className={classes.weatherIcon}
          style={{ transform: `scale(${currentSong.wiScale})`, opacity: isFading ? 0.5 : 1 }}
        />
        <h2 className={classes.songTitle}
          style={{
            background: `radial-gradient(circle at 100%, ${currentSong.colorFrom}, ${currentSong.colorTo} 50%, ${currentSong.colorFrom} 75%, ${currentSong.colorFrom} 100%)`,
            opacity: isFading ? 0.5 : 1
          }}
        >{currentSong.title}</h2>
        <img
          src={currentSong.timeIcon}
          alt="Time Icon" className={classes.timeIcon}
          style={{ transform: `scale(${currentSong.tiScale})`, opacity: isFading ? 0.5 : 1 }}
        />
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
        {/* <div className={classes.controls}>
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
        </div> */}

        <div className={classes.volumeControl}>
          <LuVolume1 />
          {isFading ? (
            <Popover content={<p>Music is currently fading in/out!</p>} trigger="hover" placement="bottom">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={classes.volumeSlider}
                disabled={true}
                style={{opacity: 0.5}}
              />
            </Popover>
          ) : (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={classes.volumeSlider}
              disabled={false}
            />
          )}
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
