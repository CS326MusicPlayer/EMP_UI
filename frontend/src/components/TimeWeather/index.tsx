import React, { useState, useEffect }  from "react";
import { Switch } from "antd";
import sunIcon from '../../assets/sun.png';
import moonIcon from '../../assets/moon.png';
import sunnyIcon from '../../assets/brightness.png';
import rainyIcon from '../../assets/storm.png';
import snowyIcon from '../../assets/snowflakes.png';
import unknownIcon from '../../assets/unknown.png';

import classes from './styles.module.css';


export default function TimeWeather(): React.ReactElement {
  const [time, setTime] = useState(new Date());
  const [prevSeconds, setPrevSeconds] = useState(0);
  const [rotationCount, setRotationCount] = useState({
    seconds: 0,
    minutes: 0,
    hours: 0
  });

  
  // Hardcoded weather data for demonstration
  // Replace with actual API call
  const weather: 'SUNNY' | 'RAINY' | 'SNOWY' | 'UNKNOWN' = 'SUNNY';



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
  const isDaytime = time.getHours() < 18 && time.getHours() >= 6;   // We might want to get the sunrise and sunset time from an API

  return (
    <div className={classes.container}>
      {/* Time */}
      <div className={classes.time}>
        <div className={classes.clock}>
          <div className={classes.secondRing} style={{ transform: `rotate(${secondRotation}deg)` }}></div>
        </div>
        <div className={classes.digitalTime}>
          <p className={classes.digitalTimeText}>
            {hoursDisplay}<span style={{ opacity: time.getSeconds()%2 ? '100%' : '50%'}}>:</span>{minutesDisplay}
          </p>
          <hr />
          <span className={classes.dayOrNight}>
            {isDaytime ?
              <img src={sunIcon} alt="AM" className={classes.sunIcon} />
              :
              <img src={moonIcon} alt="PM" className={classes.moonIcon} />
            }
          </span>
        </div>
      </div>

      {/* Control */}
      <div className={classes.control}>
        <Switch checkedChildren="Auto" unCheckedChildren="Manual" defaultChecked />
      </div>

      {/* Weather */}
      <div className={classes.weather}>
        <div className={classes.forecast}>
          <div className={classes.forecastData}>
            <p className={classes.temperature}>88°F</p>
            <hr />
            <span className={classes.condition}>
              {
                weather === 'SUNNY' ? <img src={sunnyIcon} alt="Sunny" className={classes.weatherIcon} /> :
                weather === 'RAINY' ? <img src={rainyIcon} alt="Rainy" className={classes.weatherIcon} /> :
                weather === 'SNOWY' ? <img src={snowyIcon} alt="Snowy" className={classes.weatherIcon} /> :
                <img src={unknownIcon} alt="Unknown" className={classes.weatherIcon} />
              }
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
