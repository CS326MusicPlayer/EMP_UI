import { ConfigProvider, message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import MqttStatus from './components/MqttStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import mqttClient from './services/mqttService';
import { SensorPreferencesProvider } from './contexts/SensorPreferencesContext';
import { getTimeUsingTimezone } from './utilities/utils';
import './App.css';


function App(): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mqttData, setMqttData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // TODO: It will later have three modes rather than two: INTERNET, SENSOR, and MANUAL
  const [isAuto, setIsAuto] = useState<boolean>(true);    // To track if the user has enabled auto mode

  const [musicIsFading, setMusicIsFading] = useState<boolean>(false);
  const [manualWeather, setManualWeather] = useState('none');
  const [manualTime, setManualTime] = useState('day');
  const prevManualWeatherRef = useRef(manualWeather);
  const prevManualTimeRef = useRef(manualTime);

  const [messageApi, contextHolder] = message.useMessage();
  const hasConnected = useRef(false);    // To track if the initial connection has been made
  const hasSubscribed = useRef(false);    // To track if the subscription has been made)

  // Update the last connected time of the MQTT client and save it to local storage
  const lastConnectedTime = useRef<string | null>(
    localStorage.getItem('lastConnectedTime') || null
  );

  // Update the last connected time when the connection status changes
  useEffect(() => {
    if (isConnected) {
      // Store the raw timestamp in a consistent format
      const now = new Date();
      lastConnectedTime.current = now.toISOString(); // Use ISO format for consistent parsing
      localStorage.setItem('lastConnectedTime', lastConnectedTime.current);
      console.log('Last connected time stored:', lastConnectedTime.current);
    } else {
      // We keep the last connected time when disconnecting
      console.log('Not connected to mqtt server. Last seen: ', lastConnectedTime.current);
    }
  }, [isConnected]);


  const changeBackgroundColor = (newColor: string) => {
    document.documentElement.style.setProperty('--background-color', newColor);
  };

  // TODO: we should get the time (timezone) from the RPi
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

  // Show notification when data is updated
  // Also, if the user manually sets the weather/time, show a notification
  useEffect(() => {
    // TODO: change the message to be more user-friendly
    if (mqttData.hasUpdated && isAuto) {
      messageApi.info({
        content: `Weather: ${mqttData.weather}, Time: ${mqttData.time}, Temperature: ${mqttData.temperature}, Light Level: ${mqttData.light_level}`,
        duration: 5,
      });
    }

    // Show notification only when manual values change (not on initial render)
    if (!isAuto && (prevManualWeatherRef.current !== manualWeather || prevManualTimeRef.current !== manualTime)) {
      messageApi.info({
        content: `Weather: ${manualWeather}, Time: ${manualTime}`,
        duration: 5,
      });
    }

    // Update refs with current values for next comparison
    prevManualWeatherRef.current = manualWeather;
    prevManualTimeRef.current = manualTime;
  }, [mqttData, messageApi, isAuto, manualWeather, manualTime]);


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

      mqttClient.on('error', function (error: Error) {
        setIsConnected(false);
        console.error('MQTT error:', error);
      });

      // Message handler
      const messageHandler = function (topic: string, message: Buffer) {
        console.log('Received message:', topic, message.toString());

        if (topic === 'emp/environment') {
          try {
            const data = JSON.parse(message.toString());
            // console.log('Parsed data:', data);
            // Data will have the following format:
            // {precipitation_status: 'snow', sunrise: '07:23', sunset: '20:14', timezone: 'America/Detroit' , temperature: '25', light_level: 0.5}

            // Set day/night status based on the current time and sunrise/sunset times
            const currentTime = getTimeUsingTimezone(data.timezone);
            const dayOrNight = currentTime.getHours() >= parseInt(data.sunrise.split(':')[0]) && currentTime.getHours() < parseInt(data.sunset.split(':')[0]) ? 'day' : 'night';

            console.log('Current time:', currentTime, 'Timezone:', data.timezone, 'Day/Night:', dayOrNight);

            // Create a data object to store the new values
            const newData = {
              weather: data.precipitation_status,
              time: dayOrNight,
              timezone: data.timezone,
              temperature: data.temperature,
              light_level: data.light_level,
              hasUpdated: false // Flag to track if data was updated
            };

            // Curate the data (to be edited later)
            // If the data is not the same as the previous one, update the state
            setMqttData(prevData => {
              // Only update if there are actual changes
              if (
                prevData.weather !== data.precipitation_status ||
                prevData.time !== dayOrNight ||
                prevData.temperature !== data.temperature ||
                prevData.light_level !== data.light_level
              ) {
                // console.log('Updating state with new data');

                // Return the new state with update flag
                return {
                  ...newData,
                  hasUpdated: true
                };
              }

              // console.log('No update needed');
              return prevData; // Return unchanged state
            });

            // Change the background color based on the time if auto mode is enabled
            if (isAuto) {
              if (dayOrNight === 'day') {
                changeBackgroundColor('#b3e6ff');
              } else if (dayOrNight === 'night') {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHour]);



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
      <SensorPreferencesProvider>
        <div className="App">
          {contextHolder}
          <MqttStatus
            mqttConnected={isConnected}
            musicIsFading={musicIsFading}
            lastConnectedTime={lastConnectedTime.current}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <TimeWeather
            piWeather={isAuto ? mqttData.weather : manualWeather}
            piTime={isAuto ? mqttData.time : manualTime}
            piTemperature={mqttData.temperature}
            piLightLevel={mqttData.light_level}
            timezone={mqttData.timezone}
            isAuto={isAuto}
            setIsAuto={setIsAuto}
            setManualWeather={setManualWeather}
            setManualTime={setManualTime}
          />
          <MusicPlayer
            isAuto={isAuto}
            piWeather={isAuto ? mqttData.weather : manualWeather}
            piTime={isAuto ? mqttData.time : manualTime}
            piTemperature={mqttData.temperature}
            piLightLevel={mqttData.light_level}
            onFadingChange={setMusicIsFading}
          />
        </div>
      </SensorPreferencesProvider>
    </ConfigProvider>
  )
}

export default App
