import React, { useState, useEffect }  from "react";
import { Popover } from 'antd';
import sunIcon from '../../assets/icons/sun.png';
import moonIcon from '../../assets/icons/moon.png';
import sunnyIcon from '../../assets/icons/brightness.png';
import rainyIcon from '../../assets/icons/storm.png';
import snowyIcon from '../../assets/icons/snowflakes.png';
import unknownIcon from '../../assets/icons/unknown.png';

import classes from './styles.module.css';


export default function TimeWeather({
  piWeather,
  piTime,
  isAuto,
  setIsAuto
}: {
    piWeather: string;
    piTime: string;
    isAuto: boolean;
    setIsAuto: (isAuto: boolean) => void;
  }

): React.ReactElement {
  // const [isAuto, setIsAuto] = useState(true);
  const [time, setTime] = useState(new Date());
  const [prevSeconds, setPrevSeconds] = useState(0);
  const [rotationCount, setRotationCount] = useState({
    seconds: 0,
    minutes: 0,
    hours: 0
  });


  useEffect(() => {
    // Update the time every second
    const interval = setInterval(() => {
      const newTime = new Date();
      const newSeconds = newTime.getSeconds();

      // Check if we've completed a full rotation
      if (prevSeconds > 50 && newSeconds < 10) {
        setRotationCount(prev => ({
          ...prev,
          seconds: prev.seconds + 1
        }));
      }

      setPrevSeconds(newSeconds);
      setTime(newTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [prevSeconds]);

  // Calculate hand positions with more precision
  const seconds = time.getSeconds();
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const hoursDisplay = Math.floor(hours).toString().padStart(2, '0');
  const minutesDisplay = Math.floor(minutes).toString().padStart(2, '0');
  const secondRotation = seconds * 6 + rotationCount.seconds * 360;
  // const isDaytime = time.getHours() < 18 && time.getHours() >= 6;   // We might want to get the sunrise and sunset time from an API


  const toggleMode = () => {
    setIsAuto(!isAuto);
  };

  const buttonStyle = {
    backgroundColor: isAuto ? '#52c597' : '#a5a5a5',
  };

  const modeSwitchContent = (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#616161' }}>Click to switch to "{isAuto ? 'Manual' : 'Auto'}" mode</p>
      <p style={{ color: '#8e8e8e' }}>{isAuto ? '"Auto" mode is on' : '"Manual" mode is on'}</p>
    </div>
  );

  return (
    <div className={classes.container}>
      {/* Weather */}
      <div className={classes.weather}>
        <div className={classes.forecast}>
          <div className={classes.forecastData}>
            <p className={classes.temperature}>88°F</p>
            <hr />
            <span className={classes.condition}>
              {
                piWeather === 'SUNNY' ? <img src={sunnyIcon} alt="Sunny" className={classes.weatherIcon} /> :
                piWeather === 'RAINY' ? <img src={rainyIcon} alt="Rainy" className={classes.weatherIcon} /> :
                piWeather === 'SNOWY' ? <img src={snowyIcon} alt="Snowy" className={classes.weatherIcon} /> :
                <img src={unknownIcon} alt="Unknown" className={classes.weatherIcon} />
              }
            </span>
          </div>
        </div>
      </div>

      {/* Control */}
      <div className={classes.control}>
        <Popover content={modeSwitchContent} trigger="hover" placement="top">
          <button
            style={buttonStyle}
            className={classes.toggleButton}
            onClick={toggleMode}
          >
            <p className={classes.toggleButtonText}>{isAuto ? 'AUTO' : 'MANUAL'}</p>
          </button>
        </Popover>
      </div>

      {/* Time */}
      <div className={classes.time}>
        <div className={classes.clock}>
          <div className={classes.secondRing} style={{ transform: `rotate(${secondRotation}deg)` }}></div>
        </div>
        <div className={classes.digitalTime}>
          <p className={classes.digitalTimeText}>
            {hoursDisplay}<span className={classes.blinkingColon}>:</span>{minutesDisplay}
          </p>
          <hr />
          <span className={classes.dayOrNight}>
            {/* {isDaytime ?
              <img src={sunIcon} alt="AM" className={classes.sunIcon} />
              :
              <img src={moonIcon} alt="PM" className={classes.moonIcon} />
            } */}
            {
              piTime === 'DAY' ? <img src={sunIcon} alt="AM" className={classes.sunIcon} /> :
              piTime === 'NIGHT' ? <img src={moonIcon} alt="PM" className={classes.moonIcon} /> :
              <img src={unknownIcon} alt="Unknown" className={classes.weatherIcon} />
            }
          </span>
        </div>
      </div>

    </div>
  )
}
