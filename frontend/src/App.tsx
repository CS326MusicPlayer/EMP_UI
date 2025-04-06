import { ConfigProvider } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import PiStatus from './components/PiStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import mqttClient from './services/mqttService';
import './App.css';

function App(): React.ReactElement {
  const [piWeather, setPiWeather] = useState<'none' | 'rain' | 'snow' | 'unknown'>('none');
  const [piTime, setPiTime] = useState<'day' | 'night'>('day');
  const [isConnected, setIsConnected] = useState(false);    // TODO: Actually this is not RPi status, but MQTT connection status
  const hasSubscribed = useRef(false);    // To track if the subscription has been made)
  const [isAuto, setIsAuto] = useState(true);    // To track if the user has enabled auto mode

  const changeBackgroundColor = (newColor: string) => {
    document.documentElement.style.setProperty('--background-color', newColor);
  };

  const currentHour = new Date().getHours();

  // Initialize MQTT service
  useEffect(() => {
    // Initially set the auto mode to true
    setIsAuto(true);

    // Initially set the background color based on the time
    if (currentHour >= 6 && currentHour < 18) {
      changeBackgroundColor('#b3e6ff');
    } else {
      changeBackgroundColor('#3a3a5c');
    }

    mqttClient.on('connect', function () {
      setIsConnected(true);
      console.log('Connected to MQTT broker');

      // Only subscribe if we haven't already
      if (!hasSubscribed.current) {
        hasSubscribed.current = true;

        // Subscribe to topics
        mqttClient.subscribe('emp/environment', (err) => {
          if (!err) {
            console.log('Subscribed to topic: emp/environment');
          } else {
            console.error('Subscription error:', err);
          }
        });
      }
    });

    // Only set up the message handler once
    // The topic is 'emp/environment' and the message is a JSON string
    // Example: {"precipitation_status":"rain", "day_status":"day"}
    const messageHandler = function (topic: string, message: Buffer) {
      console.log('Received message:', topic, message.toString());
      // Check the topic and parse the message accordingly

      if (topic === 'emp/environment') {
        const data = JSON.parse(message.toString());
        const weather = data.precipitation_status;
        const time = data.day_status;
        console.log(`Weather: ${weather}, Time: ${time}`);

        // Update the state based on the received data
        setPiWeather(weather as 'none' | 'rain' | 'snow' | 'unknown');
        setPiTime(time as 'day' | 'night');

        // Change the background color based on the time
        if (time === 'day') {
          changeBackgroundColor('#b3e6ff');
        } else if (time === 'night') {
          changeBackgroundColor('#3a3a5c');
        }
      }
    };

    mqttClient.on('message', messageHandler);

    // Clean up on unmount
    return () => {
      mqttClient.off('message', messageHandler);
    };
  }, [currentHour]);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Varela Round',
          colorPrimary: '#52c597',
        },
      }}
    >
      <div className="App">
        <PiStatus
          senderPiConnected={isConnected}
          receiverPiConnected={isConnected}
        />
        <TimeWeather
          piWeather={piWeather}
          piTime={piTime}
          isAuto={isAuto}
          setIsAuto={setIsAuto}
        />
        <MusicPlayer
          isAuto={isAuto}
          piWeather={piWeather}
          piTime={piTime}
        />
      </div>
    </ConfigProvider>
  )
}

export default App
