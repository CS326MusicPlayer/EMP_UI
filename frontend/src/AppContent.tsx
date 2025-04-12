import { message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import MqttStatus from './components/MqttStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import mqttClient from './services/mqttService';
import { useSensorPreferences } from './contexts/SensorPreferencesContext';
import { usePiSelection } from './contexts/PiSelectionContext';
import { getTimeUsingTimezone, getMusicTime, getDayOrNight } from './utilities/utils';

import sunIcon from './assets/icons/sun.png';
import moonIcon from './assets/icons/moon.png';
import sunnyIcon from './assets/icons/brightness.png';
import rainyIcon from './assets/icons/storm.png';
import snowyIcon from './assets/icons/snowflakes.png';
import unknownIcon from './assets/icons/unknown.png';

// Color constants
const DAY_COLOR = '#b3e6ff';
const NIGHT_COLOR = '#3a3a5c';



function AppContent(): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mqttData, setMqttData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuto, setIsAuto] = useState<boolean>(true);    // To track if the user has enabled auto mode
  const [musicIsFading, setMusicIsFading] = useState<boolean>(false);
  const [manualWeather, setManualWeather] = useState('none');
  const [manualTime, setManualTime] = useState('day');

  const { useTime } = useSensorPreferences();
  const { selectedPiId, setSelectedPiId, piList, setPiList } = usePiSelection();
  const currentHour = new Date().getHours();  // just for setting initial background color

  const prevManualWeatherRef = useRef(manualWeather);
  const prevManualTimeRef = useRef(manualTime);
  const [messageApi, contextHolder] = message.useMessage();
  const hasConnected = useRef(false);    // To track if the initial connection has been made
  const hasSubscribed = useRef(false);    // To track if the subscription has been made)
  const selectedPiIdRef = useRef(selectedPiId);

  // Update the last connected time of the MQTT client and save it to local storage
  const lastConnectedTime = useRef<string | null>(
    localStorage.getItem('lastConnectedTime') || null
  );

  // Function to change the background color based on the time of day
  // This sets the CSS variable on the :root element (document.documentElement)
  const changeBackgroundColor = (newColor: string) => {
    document.documentElement.style.setProperty('--background-color', newColor);
    // console.log('Background color changed to:', newColor);
  };


  // Update the selected Pi ID when it changes
  useEffect(() => {
    selectedPiIdRef.current = selectedPiId;
  }, [selectedPiId]);


  // Update the last connected time when the connection status changes
  useEffect(() => {
    if (isConnected) {
      // Store the raw timestamp in a consistent format
      const now = new Date();
      lastConnectedTime.current = now.toISOString(); // Use ISO format for consistent parsing
      localStorage.setItem('lastConnectedTime', lastConnectedTime.current);
    } else {
      // We keep the last connected time when disconnecting
      console.log('Not connected to mqtt server. Last seen: ', lastConnectedTime.current);
    }
  }, [isConnected]);


  // Update the list of available Pis
  useEffect(() => {
    if (mqttClient && mqttData.pid) {
      // Use the functional update pattern to safely update without dependencies
      setPiList(prevList => {
        if (!prevList.includes(mqttData.pid)) {
          console.log(`Added new Pi ID ${mqttData.pid} to the list`);
          return [...prevList, mqttData.pid];
        }
        return prevList;
      });
    }
  }, [mqttData.pid]);


  // If the selected Pi changes, show a toast message
  useEffect(() => {
    // Return if the piList is empty
    if (piList.length === 0) return;

    if (selectedPiId) {
      messageApi.info({
        content: `Selected Pi ID: ${selectedPiId}`,
        duration: 3,
      });
    }
  }, [selectedPiId, messageApi]);


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
    if (mqttData.hasUpdated && isAuto) {
      messageApi.info({
        content: <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ fontSize: '1.4rem', color: 'var(--black)' }}>{mqttData.temperature}°C</p>
          {
            mqttData.weather === 'none' ? <img src={sunnyIcon} alt="Sunny" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            mqttData.weather === 'rain' ? <img src={rainyIcon} alt="Rainy" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            mqttData.weather === 'snow' ? <img src={snowyIcon} alt="Snowy" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            <img src={unknownIcon} alt="Unknown" style={{ 'width': '2rem', 'height': '2rem' }} />
          }
          {
            mqttData.time === 'day' ? <img src={sunIcon} alt="Day" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            mqttData.time === 'night' ? <img src={moonIcon} alt="Night" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            <img src={unknownIcon} alt="Unknown" style={{ 'width': '2rem', 'height': '2rem' }} />
          }
          <p style={{ fontSize: '1.4rem', color: 'var(--black)' }}>
            {
              getMusicTime(mqttData.time, mqttData.light_level, false) === 'day' ? 'Bright' :
              getMusicTime(mqttData.time, mqttData.light_level, false) === 'night' ? 'Dark' :
              'Unknown'
            }
            </p>
        </div>,
        duration: 5,
      });
    }

    // Show notification only when manual values change (not on initial render)
    if (!isAuto && (prevManualWeatherRef.current !== manualWeather || prevManualTimeRef.current !== manualTime)) {
      messageApi.info({
        content: <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Weather: {
            manualWeather === 'none' ? <img src={sunnyIcon} alt="Sunny" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            manualWeather === 'rain' ? <img src={rainyIcon} alt="Rainy" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            manualWeather === 'snow' ? <img src={snowyIcon} alt="Snowy" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            <img src={unknownIcon} alt="Unknown" style={{ 'width': '2rem', 'height': '2rem' }} />
          }
          Time: {
            manualTime === 'day' ? <img src={sunIcon} alt="Day" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            manualTime === 'night' ? <img src={moonIcon} alt="Night" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            <img src={unknownIcon} alt="Unknown" style={{ 'width': '2rem', 'height': '2rem' }} />
          }
        </div>,
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
      changeBackgroundColor(DAY_COLOR);
    } else {
      changeBackgroundColor(NIGHT_COLOR);
    }

    // Make sure the client exists before setting up handlers
    if (mqttClient) {
      mqttClient.on('connect', function () {
        setIsConnected(true);
        hasConnected.current = true;
        console.log('Connected to MQTT broker');
  
        // Subscribe to the topic
        if (!hasSubscribed.current) {
          hasSubscribed.current = true;
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
      
            // Add to piList if new
            if (data.pid) {
              setPiList(prevList => {
                if (!prevList.includes(data.pid)) {
                  console.log(`Added new Pi ID ${data.pid} to the list`);
                  return [...prevList, data.pid];
                }
                return prevList;
              });
            }
      
            // Auto-select the first Pi if we're still using the placeholder "0"
            const isFirstMessage = selectedPiIdRef.current === "0";
            if (isFirstMessage && data.pid) {
              setSelectedPiId(data.pid);
              console.log(`Initially selected Pi ID: ${data.pid}`);
              
              // Force process this message even though selectedPiId hasn't updated yet
              // This ensures we process the first message immediately
              processMessage(data);
            } else {
              // For subsequent messages, only process if it's from the selected Pi
              const currentSelectedPiId = selectedPiIdRef.current;
              if (data.pid !== currentSelectedPiId) {
                console.log(`Skipping message from Pi ${data.pid} - selected Pi is ${currentSelectedPiId}`);
                return;
              }
              
              processMessage(data);
            }
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        }
      };


      function processMessage(data: { timezone: string; sunrise: string; sunset: string; pid: any; precipitation_status: any; temperature: any; light_level: any; }) {
        // Set day/night status based on the current time and sunrise/sunset times
        const currentTime = getTimeUsingTimezone(data.timezone);
        const dayOrNight = getDayOrNight(currentTime, data.sunrise, data.sunset);

        // Create a data object to store the new values
        const newData = {
          pid: data.pid,
          weather: data.precipitation_status,
          time: dayOrNight,
          timezone: data.timezone,
          temperature: data.temperature,
          light_level: data.light_level,
          sunrise: data.sunrise,
          sunset: data.sunset,
          hasUpdated: false // Flag to track if data was updated
        };

        // Update if the data is not the same as the previous one
        setMqttData(prevData => {
          // Force update on first message
          const isFirstMessage = Object.keys(prevData).length === 0;
          
          // Only update if first message or there are actual changes
          if (
            isFirstMessage ||
            prevData.pid !== data.pid ||
            prevData.weather !== data.precipitation_status ||
            prevData.time !== dayOrNight ||
            prevData.temperature !== data.temperature ||
            prevData.light_level !== data.light_level ||
            prevData.timezone !== data.timezone ||
            prevData.sunrise !== data.sunrise ||
            prevData.sunset !== data.sunset
          ) {
            return {
              ...newData,
              hasUpdated: true
            };
          }
          return prevData; // Return unchanged state
        });
      }

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
  }, []);


  // Change the background color based on the time or light level
  useEffect(() => {
    if (Object.keys(mqttData).length > 0 && isAuto) {
      const calculatedTime = getMusicTime(mqttData.time, mqttData.light_level, useTime);

      if (calculatedTime === 'day') {
        changeBackgroundColor(DAY_COLOR);
      } else if (calculatedTime === 'night') {
        changeBackgroundColor(NIGHT_COLOR);
      }
    }
    else if (!isAuto) {
      // If auto mode is disabled, set the background color based on manual time
      if (manualTime === 'day') {
        changeBackgroundColor(DAY_COLOR);
      } else if (manualTime === 'night') {
        changeBackgroundColor(NIGHT_COLOR);
      }
    }

    // Reset the hasUpdated flag after processing
    if (mqttData.hasUpdated) {
      setMqttData(prevData => ({
        ...prevData,
        hasUpdated: false  // Reset the flag
      }));
    }
  }, [mqttData, isAuto, useTime, manualTime]);

  // Manual connect/disconnect function
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
        piTimezone={mqttData.timezone}
        piSunrise={mqttData.sunrise}
        piSunset={mqttData.sunset}
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
  );
}

export default AppContent;
