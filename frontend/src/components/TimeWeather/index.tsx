// Display panel of weather and time

import React, { useState, useEffect } from "react";
import { Popover } from 'antd';
import { useSensorPreferences } from '../../contexts/SensorPreferencesContext';
import {
  getMusicWeather,
  getMusicTime,
  getTimeUsingTimezone,
  calculateSunPosition,
  getDayOrNight,
  convertTemp
} from '../../utilities/utils';

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
  piTimezone,
  piSunrise,
  piSunset,
  isAuto,
  setIsAuto,
  setManualWeather,
  setManualTime
}: {
  piWeather: string;
  piTime: string;
  piTemperature: number;
  piLightLevel: string;
  piTimezone: string;
  piSunrise: string;
  piSunset: string;
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
  const [sunAngle, setSunAngle] = useState(0); // Default to sunrise position
  const [time, setTime] = useState(new Date());


  // Initially set the sun angle based on the current time and sunrise/sunset times
  useEffect(() => {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    // Temporary sunrise and sunset times
    const angle = calculateSunPosition(currentTimezone, '06:00', '18:00');
    setSunAngle(angle);
  }, []);


  // Update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = piTimezone ? getTimeUsingTimezone(piTimezone) : new Date();
      setTime(newTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [piTimezone]);


  // Update the sun angle based on the current time and sunrise/sunset times
  useEffect(() => {
    // Update the sun position every time the current time changes
    if (piSunrise && piSunset) {
      const angle = calculateSunPosition(piTimezone, piSunrise, piSunset);
      setSunAngle(angle);
    }
  }, [piTimezone, piSunrise, piSunset]);


  // Calculate hand positions with more precision
  const currentTime = time;
  const seconds = currentTime.getSeconds();
  const minutes = currentTime.getMinutes() + seconds / 60;

  // Format the time for 24-hour display
  const hoursDisplay = currentTime.getHours().toString().padStart(2, '0');
  const minutesDisplay = Math.floor(minutes).toString().padStart(2, '0');


  // Toggle between Celsius and Fahrenheit
  const toggleTempUnit = () => {
    setTempUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  // Toggle between auto and manual mode
  const toggleMode = () => {
    setIsAuto(!isAuto);
  };

  // Button style based on the mode
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

    // Toggle-rotate the weather condition using the setter function from props
    if (piWeather === 'none') {
      setManualWeather('rain');
    } else if (piWeather === 'rain') {
      setManualWeather('snow');
    } else if (piWeather === 'snow' || piWeather === 'unknown' || piWeather === undefined || piWeather === null) {
      setManualWeather('none');
    }
  };

  // Toggle between day and night
  const toggleDayNight = () => {
    // Safe return if the mode is not manual
    if (isAuto) return;

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
        {isAuto ?
          <Popover
            content={
              <>
                <p>Music played based on {useWeather ? '"precipitation"' : '"temperature"'}</p>
                <p style={{ 'color': 'var(--black)' }}>
                  Click to switch to {!useWeather ? '"precipitation"' : '"temperature"'}
                </p>
              </>
            }
            trigger="hover"
            placement="left"
            mouseEnterDelay={0.2}
          >
            <div
              className={!isAuto ? classes.toggleWeatherTemperatureDisabled : classes.toggleWeatherTemperature}
              onClick={() => {
                // Toggle whether to use weather or temperature
                if (!isAuto) return;
                setUseWeather(!useWeather);
              }}
            >
              <img src={useWeather ? precipitation : temperature} alt="Weather" className={classes.toggleChipIcon} />
            </div>
          </Popover>
          :
          <div
            className={!isAuto ? classes.toggleWeatherTemperatureDisabled : classes.toggleWeatherTemperature}
            onClick={() => {
              // Toggle whether to use weather or temperature
              if (!isAuto) return;
              setUseWeather(!useWeather);
            }}
          >
            <img src={useWeather ? precipitation : temperature} alt="Weather" className={classes.toggleChipIcon} />
          </div>
        }

        {/* Weather Data */}
        <div className={classes.forecast}>
          <Popover
            title={
              <span style={{ display: 'inline-flex' }}>
                {isAuto ?
                  <>
                    <h3 style={{opacity: useWeather ? 1 : 0.5 }}>
                      {
                        piWeather==='none' ? 'Sunny or Overcast' :
                        piWeather==='rain' ? 'Rainy' :
                        piWeather==='snow' ? 'Snowy' : 'Unknown'
                      }
                    </h3>
                    <h3 style={{ padding: '0 0.2rem' }}>/</h3>
                    <h3 style={{ opacity: !useWeather ? 1 : 0.5 }}>
                      {convertTemp(piTemperature, tempUnit)}°{tempUnit}
                    </h3>
                  </>
                  :
                  <h3>Manual Mode</h3>
                }
              </span>
            }
            content={isAuto ?
              <p style={{ 'color': 'var(--black)' }}>
                You are using "{useWeather ? 'weather' : 'temperature'}" for playing music
              </p>
              :
              <p style={{ 'color': 'var(--black)' }}>
                Click to toggle sunny/rainy/snowy
              </p>
            }
            trigger="hover"
            placement="left"
          >
            <div className={classes.forecastData}>
              <p
                className={classes.temperature}
                style={{ opacity: useWeather ? 0.3 : 1 }}
                onClick={toggleTempUnit}>{convertTemp(piTemperature, tempUnit)}°{tempUnit}
              </p>
              <hr />
              <span
                className={classes.condition}
                onClick={toggleWeather}
                onMouseEnter={() => setIsHoveringWeather(true)}
                onMouseLeave={() => setIsHoveringWeather(false)}
                style={{
                  opacity: !isAuto && isHoveringWeather ? 0.5 : 1,
                  transition: 'opacity 0.2s ease-in-out'
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
          </Popover>
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
      <Popover
        content={
          <>
            <h3 style={{ 'color': 'black' }}>
            Sunrise: {piSunrise} / Sunset: {piSunset}
            </h3>
            <p style={{ 'color': 'var(--black)' }}>
              Currently the sun is {getDayOrNight(time, piSunrise, piSunset) === 'day' ? 'above' : 'below'} the horizon
            </p>
          </>
        }
        trigger="hover"
        placement="bottom"
        mouseEnterDelay={0.4}
      >
        <div
          className={classes.time}
          style={{ backgroundColor: getDayOrNight(time, piSunrise, piSunset) === 'day' ? 'var(--day1)' : 'var(--night1)' }}
        >
          {/* Toggle Chip */}
          {isAuto ?
            <Popover
              content={
                <>
                  <p>Music played based on {useTime ? '"time"' : '"light level"'}</p>
                  <p style={{ 'color': 'var(--black)' }}>Click to switch to {!useTime ? '"time"' : '"light level"'}</p>
                </>
              }
              trigger="hover"
              placement="left"
              mouseEnterDelay={0.2}
            >
              <div
                className={!isAuto ? classes.toggleTimeLightsensorDisabled : classes.toggleTimeLightsensor}
                onClick={() => {
                  // Toggle whether to use time or lightsensor
                  if (!isAuto) return;
                  setUseTime(!useTime);
                }}
              >
                <img src={useTime ? clocktime : lightsensor} alt="Time" className={classes.toggleChipIcon} />
              </div>
            </Popover>
            :
            <div
              className={!isAuto ? classes.toggleTimeLightsensorDisabled : classes.toggleTimeLightsensor}
              onClick={() => {
                // Toggle whether to use time or lightsensor
                if (!isAuto) return;
                setUseTime(!useTime);
              }}
            >
              <img src={useTime ? clocktime : lightsensor} alt="Time" className={classes.toggleChipIcon} />
            </div>
          }

          <div className={classes.clock}>
            <div
              className={classes.secondRing}
              style={{
                transform: `rotate(${sunAngle}deg)`,
                borderColor:
                  getDayOrNight(time, piSunrise, piSunset) === 'day' ? 'var(--yellow)' :
                  getDayOrNight(time, piSunrise, piSunset) === 'night' ? 'var(--lightblue)' : 'var(--white)'
              }}>
            </div>
          </div>
          <Popover
            title={
              <span style={{ display: 'inline-flex' }}>
                {isAuto ?
                  <>
                    <h3 style={{ opacity: useTime ? 1 : 0.5 }}>{piTime==='day' ? 'Day' : piTime==='night' ? 'Night' : 'Unknown'}</h3>
                    <h3 style={{ padding: '0 0.2rem' }}>/</h3>
                    <h3 style={{ opacity: !useTime ? 1 : 0.5 }}>{piLightLevel ? (Number(piLightLevel)/1.2).toFixed(2) : '--'}%</h3>
                  </>
                  :
                  <h3>Manual Mode</h3>
                }
              </span>
            }
            content={isAuto ?
              <p style={{ 'color': 'var(--black)' }}>You are using "{useTime ? 'time' : 'light level'}" for playing music</p>
              :
              <p style={{ 'color': 'var(--black)' }}>Click to toggle day/night</p>
            }
            trigger="hover"
            placement="right"
          >
            <div className={classes.digitalTime}>
              <p className={classes.digitalTimeText} style={{ opacity: !useTime ? 0.3 : 1 }}>
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
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                {
                  getMusicTime(piTime, piLightLevel, useTime) === 'day' ? <img src={sunIcon} alt="AM" className={classes.sunIcon} /> :
                  getMusicTime(piTime, piLightLevel, useTime) === 'night' ? <img src={moonIcon} alt="PM" className={classes.moonIcon} /> :
                  <img src={unknownIcon} alt="Unknown" className={classes.weatherIcon} />
                }
              </span>
            </div>
          </Popover>
        </div>
      </Popover>

    </div>
  )
}
