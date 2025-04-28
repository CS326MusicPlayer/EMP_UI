// Type definitions

/**
 * Interface for the internal Pi data structure used throughout the application
 */
export interface PiData {
  pid: string;
  weather: string;
  time: string;
  timezone: string;
  temperature: number;
  light_level: string;
  sunrise: string;
  sunset: string;
  hasUpdated: boolean;
}

/**
 * Interface for the raw incoming MQTT message data structure
 */
export interface IncomingMqttMessage {
  timezone: string;
  sunrise: string;
  sunset: string;
  pid: string;
  precipitation_status: string;
  temperature: string | number;
  light_level: string;
  timestamp: number;
}