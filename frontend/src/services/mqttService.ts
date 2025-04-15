// Based on: https://github.com/riotu-lab/react-mqtt/blob/main/src/config/mqtt.js

import mqtt from 'mqtt';

// Generate a random client ID if none is provided
const generateClientId = () => `client_${Math.random().toString(16).substring(2, 8)}`;

// const HOST = import.meta.env.VITE_HOST;
// const USERNAME = import.meta.env.VITE_USERNAME;
// const PASSWORD = import.meta.env.VITE_PASSWORD;
// const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || `client_${Math.random().toString(16).substring(2, 8)}`;
// const URL = `wss://${HOST}:8083/mqtt`;

// Default client ID from env or generated
const DEFAULT_CLIENT_ID = import.meta.env.VITE_CLIENT_ID || generateClientId();

// Create a function to get an MQTT client with the given broker info
export const getMqttClient = (brokerInfo: {
  host: string;
  port: number;
  username?: string;
  password?: string;
}) => {
  const { host, port, username, password } = brokerInfo;

  // Use wss for secure connection, ws for non-secure
  const protocol = port === 8083 ? 'wss' : 'ws';
  const url = `${protocol}://${host}:${port}/mqtt`;

  // Create client options
  const options = {
    clientId: DEFAULT_CLIENT_ID,
    username: username || undefined,
    password: password || undefined,
    protocol: 'mqtts' as mqtt.MqttProtocol,
    rejectUnauthorized: false,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 0,
    connectTimeout: 5000,
    manualConnect: true
  };

  // Create and return the client object without connecting
  return mqtt.connect(url, options);
};

// Create a default client with environment variables (for backward compatibility)
const HOST = import.meta.env.VITE_HOST;
const USERNAME = import.meta.env.VITE_USERNAME;
const PASSWORD = import.meta.env.VITE_PASSWORD;

let defaultClient: mqtt.MqttClient | null = null;

if (HOST) {
  defaultClient = getMqttClient({
    host: HOST,
    port: 8083,
    username: USERNAME,
    password: PASSWORD
  });
}

// Export the default client for backward compatibility
export default defaultClient;
