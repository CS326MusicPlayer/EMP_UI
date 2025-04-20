// Based on: https://github.com/riotu-lab/react-mqtt/blob/main/src/config/mqtt.js

import mqtt from 'mqtt';

// Generate a random client ID if none is provided
const generateClientId = () => `client_${Math.random().toString(16).substring(2, 8)}`;

// Default client ID from env or generated
const DEFAULT_CLIENT_ID = import.meta.env.VITE_CLIENT_ID || generateClientId();

// Create a function to get an MQTT client with the given broker info
export const getMqttClient = (brokerInfo: {
  host: string;
  port: string;
  username?: string;
  password?: string;
}) => {
  const { host, port, username, password } = brokerInfo;

  // Use wss for secure connection, ws for non-secure
  const protocol = port === '8083' ? 'wss' : 'ws';
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


let defaultClient: mqtt.MqttClient | null = null;

export default defaultClient;
