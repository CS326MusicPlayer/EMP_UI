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