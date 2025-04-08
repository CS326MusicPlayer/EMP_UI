// originally has 0 to 1023, and currently taking 20 samples
const LIGHT_LEVEL_THRESHOLD = 0.2;  // Below 0.2 is dark
const SNOW_TEMPC_THRESHOLD = 0;    // below 0°C is snowing
const RAIN_TEMPC_THRESHOLD = 20;   // below 20°C is raining


export const getMusicWeather = (piWeather: string, piTemperature: string, useWeather: boolean) => {
  if (useWeather) {
    return piWeather;
  } else {
    // Convert temperature to number
    const temperature = parseFloat(piTemperature);
    if (temperature <= SNOW_TEMPC_THRESHOLD) {
      return 'snow';
    } else if (temperature <= RAIN_TEMPC_THRESHOLD) {
      return 'rain';
    } else {
      return 'none';
    }
  }
}

export const getMusicTime = (piTime: string, piLightLevel: string, useTime: boolean) => {
  if (useTime) {
    return piTime;
  } else {
    // Convert light level to number
    const lightLevel = parseFloat(piLightLevel);
    if (lightLevel <= LIGHT_LEVEL_THRESHOLD) {
      return 'night';
    } else {
      return 'day';
    }
  }
}

export const getTimeUsingTimezone = (timezone: string) => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
}

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
