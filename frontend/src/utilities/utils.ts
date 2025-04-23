// Utility functions for various operations
// Daniel Kim (jk254), Jason Chew (jgc23)


// Define constants
const LIGHT_LEVEL_THRESHOLD = 0.4;  // Below 0.4 is dark (data ranges between 0 and 1)
const LIGHT_LEVEL_HYSTERESIS = 0.1;  // Hysteresis band for light level transitions
const SNOW_TEMPC_THRESHOLD = 0;    // below 0°C is snowing
const RAIN_TEMPC_THRESHOLD = 20;   // below 20°C is raining
const TEMP_HYSTERESIS = 2;         // 2°C hysteresis band for temperature transitions


// Store previous weather and time states to implement hysteresis
let prevWeather = '';
let prevTime = '';

// For testing
export const resetHysteresisState = () => {
  prevWeather = '';
  prevTime = '';
};


/**
 * Determines the music weather condition based on weather preference and temperature.
 * Uses bang-bang control with hysteresis to prevent frequent switching.
 *
 * @param piWeather - Current weather condition string from Pi device
 * @param piTemperature - Temperature number from Pi device
 * @param useWeather - Boolean flag indicating whether to use actual weather or temperature-based condition
 * @returns The determined weather condition: 'snow', 'rain', or 'none' based on temperature thresholds
 *          or the actual weather condition if useWeather is true
 */
export const getMusicWeather = (piWeather: string, piTemperature: number, useWeather: boolean) => {
  if (useWeather) {
    prevWeather = piWeather;
    return piWeather;
  } else {
    // Bang-bang control with hysteresis for temperature-based weather
    if (prevWeather === 'snow') {
      // Currently snow, only switch to rain if temperature rises above threshold + hysteresis
      if (piTemperature > SNOW_TEMPC_THRESHOLD + TEMP_HYSTERESIS) {
        prevWeather = 'rain';
        return 'rain';
      }
      return 'snow';
    } else if (prevWeather === 'rain') {
      // Currently rain, switch to snow if temp falls below threshold - hysteresis
      if (piTemperature <= SNOW_TEMPC_THRESHOLD - TEMP_HYSTERESIS) {
        prevWeather = 'snow';
        return 'snow';
      }
      // Switch to none if temp rises above threshold + hysteresis
      else if (piTemperature > RAIN_TEMPC_THRESHOLD + TEMP_HYSTERESIS) {
        prevWeather = 'none';
        return 'none';
      }
      return 'rain';
    } else if (prevWeather === 'none') {
      // Currently none, switch to rain if temp falls below threshold - hysteresis
      if (piTemperature <= RAIN_TEMPC_THRESHOLD - TEMP_HYSTERESIS) {
        prevWeather = 'rain';
        return 'rain';
      }
      return 'none';
    } else {
      // Currently undefined, set initial state based on temperature
      if (piTemperature <= SNOW_TEMPC_THRESHOLD) {
        prevWeather = 'snow';
        return 'snow';
      } else if (piTemperature <= RAIN_TEMPC_THRESHOLD) {
        prevWeather = 'rain';
        return 'rain';
      } else {
        prevWeather = 'none';
        return 'none';
      }
    }
  }
}


/**
 * Determines the music time condition based on light level and time preference.
 * Uses bang-bang control with hysteresis to prevent frequent switching.
 *
 * @param piTime - Current time from Pi device
 * @param piLightLevel - Light level from Pi device
 * @param useTime - Boolean flag indicating whether to use actual time or light level-based condition
 * @returns The determined time condition: 'night' or 'day' based on light level threshold
 *          or the actual time if useTime is true
 */
export const getMusicTime = (piTime: string, piLightLevel: string, useTime: boolean) => {
  if (useTime) {
    prevTime = piTime;
    return piTime;
  } else {
    // Convert light level to number
    const lightLevel = parseFloat(piLightLevel);

    // Bang-bang control with hysteresis for light level
    if (prevTime === 'night') {
      // Currently night, only switch to day if light rises above threshold + hysteresis
      if (lightLevel > LIGHT_LEVEL_THRESHOLD + LIGHT_LEVEL_HYSTERESIS) {
        prevTime = 'day';
        return 'day';
      }
      return 'night';
    } else if (prevTime === 'day') {
      // Currently day, switch to night if light falls below threshold - hysteresis
      if (lightLevel <= LIGHT_LEVEL_THRESHOLD - LIGHT_LEVEL_HYSTERESIS) {
        prevTime = 'night';
        return 'night';
      }
      return 'day';
    } else {
      // Initially undefined, set state based on current light level
      if (lightLevel <= LIGHT_LEVEL_THRESHOLD) {
        prevTime = 'night';
        return 'night';
      } else {
        prevTime = 'day';
        return 'day';
      }
    }
  }
}


/**
 * Determines if it's day or night based on sunrise and sunset times.
 *
 * @param sunrise - The sunrise time as a string in "HH:MM" format
 * @param sunset - The sunset time as a string in "HH:MM" format
 * @returns 'day' if current time is between sunrise and sunset, otherwise 'night'
 */
export const getDayOrNight = (currentTime: Date, sunrise: string, sunset: string) => {
  const sunriseTime = new Date(currentTime.toDateString() + ' ' + sunrise);
  const sunsetTime = new Date(currentTime.toDateString() + ' ' + sunset);
  return currentTime.getHours() >= sunriseTime.getHours() && currentTime.getHours() < sunsetTime.getHours() ? 'day' : 'night';
}


/**
 * Converts a timestamp to a human-readable format.
 *
 * @param timezone - The timezone to use to get the time
 * @returns A formatted date string
 */
export const getTimeUsingTimezone = (timezone: string) => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
}


/**
 * Formats a timestamp to a human-readable "time ago" format.
 *
 * @param timestamp - The timestamp string to format
 * @returns A formatted string representing the time elapsed since the timestamp
 */
export const formatTimeAgo = (timestamp: string | null): string => {
  if (!timestamp) return 'Unknown';

  try {
    // Parse the timestamp
    const date = new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format received:', timestamp);
      return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Convert to appropriate units
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Format as human-readable string
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Error';
  }
};


/**
 * Calculates the sun position in a circular display based on the current time, sunrise, and sunset times.
 * Written with the help of Copilot
 *
 * @param timezone - The current time as a Date object or string
 * @param sunriseTime - The sunrise time as a string in "HH:MM" format
 * @param sunsetTime - The sunset time as a string in "HH:MM" format
 * @returns The sun position in degrees
 */
export const calculateSunPosition = (timezone: string, sunriseTime: string, sunsetTime: string) => {
  // Get the current time in the specified timezone
  const currentDate = getTimeUsingTimezone(timezone.toString());
  const sunriseDate = new Date(currentDate.toDateString() + ' ' + sunriseTime);
  const sunsetDate = new Date(currentDate.toDateString() + ' ' + sunsetTime);

  // Create noon date
  const noonDate = new Date(currentDate.toDateString() + ' 12:00');

  // Get the current hour as a decimal (e.g., 6.5 for 6:30)
  const currentHour = currentDate.getHours() + currentDate.getMinutes() / 60;

  // Determine if it's day or night
  const isDaytime = currentDate >= sunriseDate && currentDate <= sunsetDate;

  let sunPosition;

  if (isDaytime) {
    // During daylight: position from -90° (sunrise) through 0° (noon) to 90° (sunset)
    if (currentDate < noonDate) {
      // Morning: Map from sunrise (-90°) to noon (0°)
      const morningProgress = (currentDate.getTime() - sunriseDate.getTime()) / (noonDate.getTime() - sunriseDate.getTime());
      sunPosition = -90 + (morningProgress * 90);
    } else {
      // Afternoon: Map from noon (0°) to sunset (90°)
      const afternoonProgress = (currentDate.getTime() - noonDate.getTime()) / (sunsetDate.getTime() - noonDate.getTime());
      sunPosition = 0 + (afternoonProgress * 90);
    }
  } else {
    // Night time
    if (currentDate < sunriseDate) {
      // Before sunrise
      // Calculate position from midnight (-180°) to sunrise (-90°)
      const midnightDate = new Date(currentDate.toDateString() + ' 00:00');

      // If we're closer to midnight
      if (currentHour < 6) {
        const nightProgress = currentHour / 6; // 0 at midnight, 1 at 6am
        sunPosition = -180 + (nightProgress * 90); // -180° at midnight to -90° approaching sunrise
      } else {
        // Approaching sunrise
        const dawnProgress = (currentDate.getTime() - midnightDate.getTime()) / (sunriseDate.getTime() - midnightDate.getTime());
        sunPosition = -180 + (dawnProgress * 90);
      }
    } else {
      // After sunset
      // Calculate position from sunset (90°) to midnight (180°)
      const midnightDate = new Date(currentDate.toDateString());
      midnightDate.setDate(midnightDate.getDate() + 1); // Next day midnight
      midnightDate.setHours(0, 0, 0, 0);

      const nightProgress = (currentDate.getTime() - sunsetDate.getTime()) / (midnightDate.getTime() - sunsetDate.getTime());
      sunPosition = 90 + (nightProgress * 90); // 90° at sunset to 180° at midnight
    }
  }

  return sunPosition;
};


/**
 * Converts temperature value between Celsius and Fahrenheit based on the current temperature unit setting.
 *
 * @param temp - The temperature value as a number
 * @returns The converted temperature as a string with no decimal places
 *
 * If the current unit is Celsius (tempUnit === 'C'), returns the original temperature.
 * If the current unit is Fahrenheit, converts from Celsius to Fahrenheit
 */
export const convertTemp = (temp: number, tempunit: string): string => {
  if (!temp) {
    return '--';
  }
  if (tempunit === 'C') {
    return temp.toFixed(0);
  } else {
    // Convert Celsius to Fahrenheit: (C × 9/5) + 32
    return (temp * 9 / 5 + 32).toFixed(0);
  }
};


/**
 * Formats a time value in seconds to a human-readable string in "MM:SS" format.
 *
 * @param time - The time value in seconds
 * @returns A formatted string representing the time in "MM:SS" format
 */
export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};


/**
 * Returns the appropriate placement based on screen size
 * Used for components like Popover, Tooltip, etc. that have placement props
 *
 * @param defaultPlacement - The placement to use for smaller screens
 * @param largePlacement - The placement to use for screens larger than 768px
 * @returns The appropriate placement based on current screen size
 */
export const getResponsivePlacement = (defaultPlacement: string, largePlacement: string = 'right'): string => {
  // Check if window is defined (for SSR)
  if (typeof window !== 'undefined') {
    return window.innerWidth > 768 ? largePlacement : defaultPlacement;
  }
  return defaultPlacement;
};


/**
 * Returns the next Pi ID in the list, wrapping around to the start if necessary.
 *
 * @param currentPiId - The current Pi ID
 * @param piList - The list of available Pi IDs
 * @returns The next Pi ID in the list
 */
export const getNextPiId = (currentPiId: string, piList: string[]) => {
  const currentIndex = piList.indexOf(currentPiId);
  const nextIndex = (currentIndex + 1) % piList.length;
  return piList[nextIndex];
};
