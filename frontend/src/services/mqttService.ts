// Based on: https://github.com/riotu-lab/react-mqtt/blob/main/src/config/mqtt.js

import mqtt from 'mqtt';

// Environment variables
const HOST = import.meta.env.VITE_HOST;
const USERNAME = import.meta.env.VITE_USERNAME;
const PASSWORD = import.meta.env.VITE_PASSWORD;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || `client_${Math.random().toString(16).substring(2, 8)}`;
const URL = `wss://${HOST}:8083/mqtt`;


const client = mqtt.connect(URL, {
  clientId: CLIENT_ID,
  username: USERNAME,
  password: PASSWORD,
  protocol: 'wss',
  rejectUnauthorized: false,
  port: 8083,
  keepalive: 60,
  clean: true,
  reconnectPeriod: 0,
  connectTimeout: 5000,
});

export default client;
