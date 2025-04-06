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
      weather: "SUNNY",
      time: "DAY"
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
      weather: "RAINY",
      time: "DAY"
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
      weather: "SNOWY",
      time: "DAY"
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
      weather: "SUNNY",
      time: "NIGHT"
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
      weather: "RAINY",
      time: "NIGHT"
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
      weather: "SNOWY",
      time: "NIGHT"
    }
  ];

  // State variables
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopMode, setLoopMode] = useState('all'); // 'one', 'all'

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Current song
  const currentSong = musicList[currentSongIndex];

  // Effect to change song based on weather and time
  // This is only done if auto mode is enabled
  useEffect(() => {
    if (isAuto && piWeather && piTime) {
      const matchingSongIndex = musicList.findIndex(
        song => song.weather === piWeather && song.time === piTime
      );

      if (matchingSongIndex !== -1 && matchingSongIndex !== currentSongIndex) {
        setCurrentSongIndex(matchingSongIndex);
        // Start playing automatically when weather/time changes
        setIsPlaying(true);
      }
    }
  }, [piWeather, piTime, isAuto]);

  // Event handlers
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
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
    if (loopMode === 'all') {
      setLoopMode('one');
    } else {
      setLoopMode('all');
    }
  };

  // Play previous and next song
  const playPrevious = () => {
    let newIndex = currentSongIndex - 1;
    if (newIndex < 0) {
      newIndex = musicList.length - 1;
    }
    setCurrentSongIndex(newIndex);
  };
  const playNext = () => {
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
        audioRef.current.play();
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
    if (progressBarRef.current && audioRef.current && !isAuto) {
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
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSongIndex, isPlaying]);



  // Set loop attribute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loopMode === 'one';
    }
  }, [loopMode]);


  // TODO: disable controls (play, pause, next, previous, progressbar, loop) when auto mode is enabled
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
              opacity: isAuto ? 0.5 : 1
            }}
          ></div>
        </div>
        <span className={classes.timeDisplay}>{formatTime(duration)}</span>
      </div>

      <div className={classes.controller}>
        <div className={classes.controls}>
          <button onClick={playPrevious} className={classes.controlButton} disabled={isAuto}>
            <LuSkipBack style={{opacity: isAuto ? 0.5 : 1}} />
          </button>

          <button onClick={togglePlay} className={classes.controlButton} disabled={isAuto}>
            {isPlaying ? <LuPause style={{opacity: isAuto ? 0.5 : 1}} /> : <LuPlay style={{opacity: isAuto ? 0.5 : 1}} />}
          </button>

          <button onClick={playNext} className={classes.controlButton} disabled={isAuto}>
            <LuSkipForward style={{opacity: isAuto ? 0.5 : 1}} />
          </button>

          <button onClick={cycleLoopMode} className={classes.loopButton} disabled={isAuto}>
            {loopMode === 'all' ? <LuRepeat style={{opacity: isAuto ? 0.5 : 1}} /> : <LuRepeat1 style={{opacity: isAuto ? 0.5 : 1}} />}
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