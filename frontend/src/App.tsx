import { ConfigProvider } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import PiStatus from './components/PiStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import mqttClient from './services/mqttService';
import './App.css';

function App(): React.ReactElement {
  const [piWeather, setPiWeather] = useState<'SUNNY' | 'RAINY' | 'SNOWY' | 'UNKNOWN'>('SUNNY');
  const [piTime, setPiTime] = useState<'DAY' | 'NIGHT'>('DAY');
  const [isConnected, setIsConnected] = useState(false);    // TODO: Actually this is not RPi status, but MQTT connection status
  const hasSubscribed = useRef(false);    // To track if the subscription has been made)

  const changeBackgroundColor = (newColor: string) => {
    document.documentElement.style.setProperty('--background-color', newColor);
  };

  const currentHour = new Date().getHours();

  // Initialize MQTT service
  useEffect(() => {
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

        mqttClient.subscribe('emp/weather', (err) => {
          if (!err) {
            console.log('Subscribed to topic: emp/weather');
          } else {
            console.error('Subscription error:', err);
          }
        });

        mqttClient.subscribe('emp/time', (err) => {
          if (!err) {
            console.log('Subscribed to topic: emp/time');
          } else {
            console.error('Subscription error:', err);
          }
        });
      }
    });

    // Only set up the message handler once
    const messageHandler = function (topic: string, message: Buffer) {
      if (topic === 'emp/weather') {
        const weather = message.toString().toUpperCase();
        console.log('Weather:', weather);
        setPiWeather(weather as 'SUNNY' | 'RAINY' | 'SNOWY' | 'UNKNOWN');
      } else if (topic === 'emp/time') {
        const time = message.toString().toUpperCase();
        console.log('Time:', time);
        setPiTime(time as 'DAY' | 'NIGHT');
        if (time === 'DAY') {
          changeBackgroundColor('#b3e6ff');
        } else if (time === 'NIGHT') {
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
        />
        <MusicPlayer
          piWeather={piWeather}
          piTime={piTime}
        />
      </div>
    </ConfigProvider>
  )
}

export default App
