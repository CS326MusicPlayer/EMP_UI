import React, { useState, useEffect }  from "react";
import sunIcon from '../../assets/icons/sun.png';
import moonIcon from '../../assets/icons/moon.png';
import sunnyIcon from '../../assets/icons/brightness.png';
import rainyIcon from '../../assets/icons/storm.png';
import snowyIcon from '../../assets/icons/snowflakes.png';
import unknownIcon from '../../assets/icons/unknown.png';

import classes from './styles.module.css';


export default function TimeWeather(): React.ReactElement {
  const [time, setTime] = useState(new Date());
  const [isAuto, setIsAuto] = useState(true);

  // Synchronize clock on component mount
  useEffect(() => {
    // First, update to exact second
    const now = new Date();
    setTime(now);
    
    // Then set up minute updates
    const minuteInterval = setInterval(() => {
      setTime(new Date());
    }, 60000);
    
    // Clean up
    return () => clearInterval(minuteInterval);
  }, []);

  // Format time display
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const hoursDisplay = hours.toString().padStart(2, '0');
  const minutesDisplay = minutes.toString().padStart(2, '0');
  const isDaytime = hours < 18 && hours >= 6;
  
  // Calculate the initial rotation for the second hand (6 degrees per second)
  const secondsInitialRotation = seconds * 6;
  
  // Calculate animation delay to synchronize with real time; start from the current second
  const animationDelay = -seconds; 
  
  const toggleMode = () => {
    setIsAuto(!isAuto);
  };
  
  const buttonStyle = {
    backgroundColor: isAuto ? '#52c597' : '#a5a5a5',
  };

  // Weather data (mock)
  const weather: 'SUNNY' | 'RAINY' | 'SNOWY' | 'UNKNOWN' = 'SUNNY';

  return (
    <div className={classes.container}>
      {/* Time */}
      <div className={classes.time}>
        <div className={classes.clock}>
          <div 
            className={classes.secondRing} 
            style={{
              transform: `rotate(${secondsInitialRotation}deg)`,
              animation: `${classes.rotate} 60s linear infinite`,
              animationDelay: `${animationDelay}s`
            }}
          ></div>
        </div>
        <div className={classes.digitalTime}>
          <p className={classes.digitalTimeText}>
            {hoursDisplay}<span className={classes.blinkingColon}>:</span>{minutesDisplay}
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
        {/* <Switch checkedChildren="Auto" unCheckedChildren="Manual" defaultChecked /> */}
        <button 
          style={buttonStyle} 
          className={classes.toggleButton}
          onClick={toggleMode}
        >
          {isAuto ? 'Auto' : 'Manual'}
      </button>
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
