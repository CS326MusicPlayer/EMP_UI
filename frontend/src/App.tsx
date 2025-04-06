import { ConfigProvider } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import MqttStatus from './components/MqttStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import mqttClient from './services/mqttService';
import './App.css';


function App(): React.ReactElement {
  const [piWeather, setPiWeather] = useState<'none' | 'rain' | 'snow' | 'unknown'>('none');
  const [piTime, setPiTime] = useState<'day' | 'night'>('day');
  const [isConnected, setIsConnected] = useState(false);
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

    // Set up MQTT event handlers
    mqttClient.on('connect', function () {
      setIsConnected(true);
      console.log('Connected to MQTT broker');
      
      // Subscribe to the topic
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

    mqttClient.on('disconnect', function () {
      setIsConnected(false);
      console.log('Disconnected from MQTT broker');
    });

    mqttClient.on('offline', function () {
      setIsConnected(false);
      console.log('Offline from MQTT broker');
    });

    mqttClient.on('error', function (error: any) {
      setIsConnected(false);
      console.error('MQTT error:', error);
    });

    // Message handler
    const messageHandler = function (topic: string, message: Buffer) {
      console.log('Received message:', topic, message.toString());
      
      if (topic === 'emp/environment') {
        try {
          const data = JSON.parse(message.toString());
          const weather = data.precipitation_status;
          const time = data.day_status;
          console.log(`Weather: ${weather}, Time: ${time}`);

          // Update the state based on the received data
          setPiWeather(weather as 'none' | 'rain' | 'snow' | 'unknown');
          setPiTime(time as 'day' | 'night');

          // Change the background color based on the time if auto mode is enabled
          if (isAuto) {
            if (time === 'day') {
              changeBackgroundColor('#b3e6ff');
            } else if (time === 'night') {
              changeBackgroundColor('#3a3a5c');
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      }
    };

    mqttClient.on('message', messageHandler);

    // Clean up on unmount
    return () => {
      mqttClient.off('message', messageHandler);
      mqttClient.end(true);
      console.log('MQTT client disconnected');
      setIsConnected(false);
    };
  }, [currentHour, isAuto]);

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
        <MqttStatus
          mqttConnected={isConnected}
          onConnect={() => {
            mqttClient.connect();
          }}
          onDisconnect={() => {
            mqttClient.end(true);
          }}
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
