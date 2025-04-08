import React, { useState, useEffect }  from "react";
import { Popover } from 'antd';
import { useSensorPreferences } from '../../contexts/SensorPreferencesContext';
import { getMusicWeather, getMusicTime, getTimeUsingTimezone } from '../../utilities/utils';

import sunIcon from '../../assets/icons/sun.png';
import moonIcon from '../../assets/icons/moon.png';
import sunnyIcon from '../../assets/icons/brightness.png';
import rainyIcon from '../../assets/icons/storm.png';
import snowyIcon from '../../assets/icons/snowflakes.png';
import unknownIcon from '../../assets/icons/unknown.png';
import lightsensor from '../../assets/icons/lightsensor.png';
import clocktime from '../../assets/icons/clocktime.png';
import temperature from '../../assets/icons/temperature.png';
import precipitation from '../../assets/icons/precipitation.png';
import classes from './styles.module.css';


export default function TimeWeather({
  piWeather,
  piTime,
  piTemperature,
  piLightLevel,
  timezone,
  isAuto,
  setIsAuto,
  setManualWeather,
  setManualTime
}: {
    piWeather: string;
    piTime: string;
    piTemperature: string;
    piLightLevel: string;
    timezone: string;
    isAuto: boolean;
    setIsAuto: (isAuto: boolean) => void;
    setManualWeather: (weather: string) => void;
    setManualTime: (time: string) => void;
  }

): React.ReactElement {
  const { useWeather, setUseWeather, useTime, setUseTime } = useSensorPreferences();
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isHoveringWeather, setIsHoveringWeather] = useState(false);
  const [isHoveringTime, setIsHoveringTime] = useState(false);

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
      const newTime = timezone ? getTimeUsingTimezone(timezone) : new Date();
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
  const currentTime = time;
  const seconds = currentTime.getSeconds();
  const minutes = currentTime.getMinutes() + seconds / 60;
  const hours = (currentTime.getHours() % 12) + minutes / 60;

  // Format the time for 12-hour display
  const hoursDisplay = Math.floor(hours).toString().padStart(2, '0');
  const minutesDisplay = Math.floor(minutes).toString().padStart(2, '0');
  const secondRotation = seconds * 6 + rotationCount.seconds * 360;

  const convertTemp = (temp: string | null): string => {
    if (!temp || temp === "--") return "--";
    
    try {
      const tempValue = parseFloat(temp);
      if (isNaN(tempValue)) return "--";
      
      if (tempUnit === 'C') {
        return tempValue.toFixed(0);
      } else {
        // Convert Celsius to Fahrenheit: (C × 9/5) + 32
        return (tempValue * 9/5 + 32).toFixed(0);
      }
    } catch (error) {
      console.error('Error converting temperature:', error);
      return "--";
    }
  };

  const toggleTempUnit = () => {
    setTempUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const toggleMode = () => {
    setIsAuto(!isAuto);
  };

  const buttonStyle = {
    backgroundColor: isAuto ? '#52c597' : '#a5a5a5',
  };

  const modeSwitchContent = (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#616161' }}>Click to switch to "{isAuto ? 'Manual' : 'Auto'}" mode</p>
      <p style={{ color: '#8e8e8e' }}>"{isAuto ? 'Auto' : 'Manual'}" mode enabled</p>
    </div>
  );

  // In the manual mode, user can change the weather and day/night
  const toggleWeather = () => {
    // Safe return if the mode is not manual
    if (isAuto) return;

    // console.log('Toggling weather condition...');
    // console.log('Current weather condition:', piWeather);

    // Toggle-rotate the weather condition using the setter function from props
    if (piWeather === 'none') {
      setManualWeather('rain');
    } else if (piWeather === 'rain') {
      setManualWeather('snow');
    } else if (piWeather === 'snow' || piWeather === 'unknown' || piWeather === undefined || piWeather === null) {
      setManualWeather('none');
    }
  };

  const toggleDayNight = () => {
    // Safe return if the mode is not manual
    if (isAuto) return;

    console.log('Toggling day/night condition...');
    console.log('Current day/night condition:', piTime);

    // Toggle-rotate the day/night condition using the setter function from props
    if (piTime === 'day') {
      setManualTime('night');
    } else if (piTime === 'night') {
      setManualTime('day');
    } else if (piTime === 'unknown' || piTime === undefined || piTime === null) {
      setManualTime('day');
    }
  };

  return (
    <div className={classes.container}>
      {/* Weather */}
      <div className={classes.weather}>
        {/* Toggle Chip */}
        <div
          className={classes.toggleWeatherTemperature}
          onClick={ () => {
            // Toggle whether to use weather or temperature
            setUseWeather(!useWeather);
          }}
        >
          <img src={useWeather ? precipitation : temperature} alt="Weather" className={classes.toggleChipIcon} />
        </div>
        <div className={classes.forecast}>
          <div className={classes.forecastData}>
            <p className={classes.temperature} onClick={toggleTempUnit}>{convertTemp(piTemperature)}°{tempUnit}</p>
            <hr />
            <span
              className={classes.condition}
              onClick={toggleWeather}
              onMouseEnter={() => setIsHoveringWeather(true)}
              onMouseLeave={() => setIsHoveringWeather(false)}
              style={{ 
                opacity: !isAuto && isHoveringWeather ? 0.5 : 1,
                transition: 'opacity 0.2s ease'
              }}
            >
              {
                getMusicWeather(piWeather, piTemperature, useWeather) === 'none' ? <img src={sunnyIcon} alt="Sunny" className={classes.weatherIcon} /> :
                getMusicWeather(piWeather, piTemperature, useWeather) === 'rain' ? <img src={rainyIcon} alt="Rainy" className={classes.weatherIcon} /> :
                getMusicWeather(piWeather, piTemperature, useWeather) === 'snow' ? <img src={snowyIcon} alt="Snowy" className={classes.weatherIcon} /> :
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
        {/* Toggle Chip */}
        <div
          className={classes.toggleTimeLightsensor}
          onClick={ () => {
            // Toggle whether to use time or lightsensor
            setUseTime(!useTime);
          }}
        >
          <img src={useTime ? clocktime : lightsensor} alt="Time" className={classes.toggleChipIcon} />
        </div>

        <div className={classes.clock}>
          <div className={classes.secondRing} style={{ transform: `rotate(${secondRotation}deg)` }}></div>
        </div>
        <div className={classes.digitalTime}>
          <p className={classes.digitalTimeText}>
            {hoursDisplay}<span className={classes.blinkingColon}>:</span>{minutesDisplay}
          </p>
          <hr />
          <span
            className={classes.dayOrNight}
            onClick={toggleDayNight}
            onMouseEnter={() => setIsHoveringTime(true)}
            onMouseLeave={() => setIsHoveringTime(false)}
            style={{ 
              opacity: !isAuto && isHoveringTime ? 0.5 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            {
              getMusicTime(piTime, piLightLevel, useTime) === 'day' ? <img src={sunIcon} alt="AM" className={classes.sunIcon} /> :
              getMusicTime(piTime, piLightLevel, useTime) === 'night' ? <img src={moonIcon} alt="PM" className={classes.moonIcon} /> :
              <img src={unknownIcon} alt="Unknown" className={classes.weatherIcon} />
            }
          </span>
        </div>
      </div>

    </div>
  )
}
