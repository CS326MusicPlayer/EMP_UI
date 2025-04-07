import { ConfigProvider, message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import MqttStatus from './components/MqttStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import mqttClient from './services/mqttService';
import './App.css';


function App(): React.ReactElement {
  const [piWeather, setPiWeather] = useState<'none' | 'rain' | 'snow' | 'unknown'>('none');
  const [piTime, setPiTime] = useState<'day' | 'night'>('day');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuto, setIsAuto] = useState<boolean>(true);    // To track if the user has enabled auto mode
  const [messageApi, contextHolder] = message.useMessage();
  const hasConnected = useRef(false);    // To track if the initial connection has been made
  const hasSubscribed = useRef(false);    // To track if the subscription has been made)


  const changeBackgroundColor = (newColor: string) => {
    document.documentElement.style.setProperty('--background-color', newColor);
  };

  const currentHour = new Date().getHours();

  // Toast message according to the connection status
  useEffect(() => {
    if (isConnected) {
      messageApi.success({
        content: 'Successfully connected to MQTT broker',
        duration: 3,
      });
    }
    // This should not show in the initial connection
    else if (!isConnected && hasConnected.current) {
      messageApi.success({
        content: 'Successfully disconnected from MQTT broker',
        duration: 3,
      });
    }
  }, [isConnected, messageApi]);


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

    // Make sure the client exists before setting up handlers
    if (mqttClient) {
      // Set up MQTT event handlers
      mqttClient.on('connect', function () {
        setIsConnected(true);
        hasConnected.current = true;
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
        hasSubscribed.current = false;
        hasConnected.current = false;
        console.log('Disconnected from MQTT broker');
      });

      mqttClient.on('end', function () {
        setIsConnected(false);
        hasSubscribed.current = false;
        console.log('MQTT connection ended');
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
            console.log('Parsed data:', data);

            const weather = data.precipitation_status;
            const time = data.day_status;
            
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
        if (mqttClient) {
          mqttClient.off('message', messageHandler);
          if (mqttClient.connected) {
            mqttClient.end(true);
            console.log('MQTT client disconnected');
          }
        }
        setIsConnected(false);
      };
    }
  }, [currentHour, isAuto]);



  // Manual connect/disconnect function that ensures the status is updated
  const handleConnect = () => {
    if (mqttClient) {
      console.log('Connecting to MQTT broker...');
      mqttClient.connect();
    }
  };

  const handleDisconnect = () => {
    if (mqttClient) {
      hasSubscribed.current = false;
      setIsConnected(false);
      mqttClient.end(true);
      console.log('Manually disconnected from MQTT broker');
    }
  };

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
        {contextHolder}
        <MqttStatus
          mqttConnected={isConnected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
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
