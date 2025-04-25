// App inner component
// Daniel Kim (jk254), Jason Chew (jgc23)

import { message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import MqttStatus from './components/MqttStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import type { MqttClient } from 'mqtt';
import { useSensorPreferences } from './contexts/SensorPreferencesContext';
import { usePiSelection } from './contexts/PiSelectionContext';
import { getTimeUsingTimezone, getMusicTime, getDayOrNight } from './utilities/utils';
import { PiData, IncomingMqttMessage } from './types';

import sunIcon from './assets/icons/sun.png';
import moonIcon from './assets/icons/moon.png';
import sunnyIcon from './assets/icons/brightness.png';
import rainyIcon from './assets/icons/storm.png';
import snowyIcon from './assets/icons/snowflakes.png';
import unknownIcon from './assets/icons/unknown.png';


// Color constants
const DAY_COLOR = '#b3e6ff';
const NIGHT_COLOR = '#3a3a5c';

interface AppContentProps {
  mqttClient: MqttClient | null;
}


function AppContent({ mqttClient }: AppContentProps): React.ReactElement {
  // Cache data for all Pis, keyed by Pi ID
  const [mqttDataCache, setMqttDataCache] = useState<Record<string, PiData>>({});
  // Current Pi data derived from cache based on selectedPiId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentPiData, setCurrentPiData] = useState<PiData | Record<string, any>>({});

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuto, setIsAuto] = useState<boolean>(true);    // To track if the user has enabled auto mode
  const [musicIsFading, setMusicIsFading] = useState<boolean>(false);
  const [manualWeather, setManualWeather] = useState('none');
  const [manualTime, setManualTime] = useState('day');

  const { useTime } = useSensorPreferences();
  const { selectedPiId, setSelectedPiId, piList, setPiList } = usePiSelection();
  const currentHour = new Date().getHours();    // just for setting initial background color

  const prevManualWeatherRef = useRef(manualWeather);
  const prevManualTimeRef = useRef(manualTime);
  const [messageApi, contextHolder] = message.useMessage();
  const hasConnected = useRef(false);           // To track if the initial connection has been made
  const hasSubscribed = useRef(false);          // To track if the subscription has been made)
  const selectedPiIdRef = useRef(selectedPiId);
  const prevMusicIsFadingRef = useRef(false);   // Track previous music fading state

  // Update the last connected time of the MQTT client and save it to local storage
  const lastConnectedTime = useRef<string | null>(
    localStorage.getItem('lastConnectedTime') || null
  );


  // Function to change the background color (slide the window) based on the time of day
  // This controls which portion of the background gradient is visible (see App.css)
  const changeBackgroundColor = (time: string) => {
    if (time === 'day') {
      // Show the day portion of the gradient (0-30%)
      document.documentElement.style.setProperty('--background-position', '0%');
      document.documentElement.style.setProperty('--background-color', DAY_COLOR);
    } else if (time === 'night') {
      // Show the night portion of the gradient (70-100%)
      document.documentElement.style.setProperty('--background-position', '85%');
      document.documentElement.style.setProperty('--background-color', NIGHT_COLOR);
    }
  };


  // Update the selected Pi ID when it changes
  useEffect(() => {
    selectedPiIdRef.current = selectedPiId;
    setCurrentPiData(mqttDataCache[selectedPiId] || {});
  }, [selectedPiId, mqttDataCache]);


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


  // If the selected Pi changes, show a toast message
  useEffect(() => {
    // Return if the piList is empty
    if (piList.length === 0) return;

    if (selectedPiId) {
      // Show toast message
      messageApi.info({
        content: `Selected Pi ID: ${selectedPiId}`,
        duration: 3,
      });

      // Publish selection to MQTT topic
      if (mqttClient && mqttClient.connected) {
        const message = JSON.stringify({
          "discovery": false,
          "target": selectedPiId
        });

        mqttClient.publish('emp/operations', message, { qos: 1 }, (error) => {
          if (error) {
            console.error('Error publishing Pi selection:', error);
          } else {
            console.log(`Published Pi selection to emp/operations: ${selectedPiId}`);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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


  // Update the list of available Pis
  useEffect(() => {
    if (mqttClient && currentPiData.pid) {
      setPiList(prevList => {
        if (!prevList.includes(currentPiData.pid)) {
          console.log(`Added new Pi ID ${currentPiData.pid} to the list`);
          return [...prevList, currentPiData.pid];
        }
        return prevList;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPiData.pid]);


  // Show notification only for manual mode changes or when music is changing (not for every MQTT update)
  useEffect(() => {
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
        duration: 3,
      });
    }

    // Update refs with current values for next comparison
    prevManualWeatherRef.current = manualWeather;
    prevManualTimeRef.current = manualTime;
  }, [messageApi, isAuto, manualWeather, manualTime]);


  // Show notification when music is changing instead of on every data update
  useEffect(() => {
    // Only show notification when music starts fading (transition begins)
    if (musicIsFading && !prevMusicIsFadingRef.current && isAuto && Object.keys(currentPiData).length > 0) {
      messageApi.info({
        content: <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ fontSize: '1.4rem', color: 'var(--black)' }}>{currentPiData.temperature}°C</p>
          {
            currentPiData.weather === 'none' ? <img src={sunnyIcon} alt="Sunny" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            currentPiData.weather === 'rain' ? <img src={rainyIcon} alt="Rainy" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            currentPiData.weather === 'snow' ? <img src={snowyIcon} alt="Snowy" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            <img src={unknownIcon} alt="Unknown" style={{ 'width': '2rem', 'height': '2rem' }} />
          }
          {
            currentPiData.time === 'day' ? <img src={sunIcon} alt="Day" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            currentPiData.time === 'night' ? <img src={moonIcon} alt="Night" style={{ 'width': '2rem', 'height': '2rem' }} /> :
            <img src={unknownIcon} alt="Unknown" style={{ 'width': '2rem', 'height': '2rem' }} />
          }
          <p style={{ fontSize: '1.4rem', color: 'var(--black)' }}>
            { currentPiData.light_level || 'Unknown' }
          </p>
        </div>,
        duration: 3,
      });
    }

    // Update the ref for the next render
    prevMusicIsFadingRef.current = musicIsFading;
  }, [musicIsFading, isAuto, currentPiData, messageApi]);


  // Initialize MQTT service
  useEffect(() => {
    // Reset connection state when client changes
    setIsConnected(false);
    hasConnected.current = false;
    hasSubscribed.current = false;

    // Initially set the auto mode to true
    setIsAuto(true);

    // Initially set the background color based on the time
    if (currentHour >= 6 && currentHour < 18) {
      changeBackgroundColor('day');
    } else {
      changeBackgroundColor('night');
    }

    // Make sure the client exists before setting up handlers
    if (mqttClient) {
      mqttClient.on('connect', function () {
        setIsConnected(true);
        hasConnected.current = true;
        console.log('Connected to MQTT broker');

        // Subscribe to the topic
        if (!hasSubscribed.current && mqttClient) {
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

            // Ensure pid is treated as a string for consistent comparisons
            const pidString = String(data.pid);

            // Add to piList if new
            if (pidString) {
              setPiList(prevList => {
                if (!prevList.includes(pidString)) {
                  console.log(`Added new Pi ID ${pidString} to the list`);
                  return [...prevList, pidString];
                }
                return prevList;
              });
            }

            // Auto-select the first Pi if we're still using the placeholder "?"
            const isFirstMessage = selectedPiIdRef.current === "?";
            if (isFirstMessage && pidString) {
              console.log(`Initially selecting Pi ID: ${pidString}`);
              setSelectedPiId(pidString);

              // Force process this message even though selectedPiId hasn't updated yet
              // This ensures we process the first message immediately
              processMessage(data);
            } else {
              // For subsequent messages, process and cache data for all Pis
              processMessage(data);
            }
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        }
      };

      // Function to process incoming messages
      function processMessage(data: IncomingMqttMessage) {
        // Set day/night status based on the current time and sunrise/sunset times
        const currentTime = getTimeUsingTimezone(data.timezone);
        const dayOrNight = getDayOrNight(currentTime, data.sunrise, data.sunset);

        // Parse temperature as a number
        const temperatureValue = typeof data.temperature === 'number' ? data.temperature : parseFloat(String(data.temperature));

        // Create a data object to store the new values
        const newData: PiData = {
          pid: data.pid,
          weather: data.precipitation_status,
          time: dayOrNight,
          timezone: data.timezone,
          temperature: temperatureValue,
          light_level: data.light_level,
          sunrise: data.sunrise,
          sunset: data.sunset,
          hasUpdated: false
        };

        // Update cache for all Pis
        setMqttDataCache(prevCache => ({
          ...prevCache,
          [data.pid]: newData
        }));

        // Update current Pi data if the message is from the selected Pi
        if (data.pid === selectedPiIdRef.current) {
          setCurrentPiData(newData);
        }
      }

      mqttClient.on('message', messageHandler);

      // Attempt to connect automatically
      mqttClient.connect();

      // Clean up on unmount or when client changes
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
  }, [mqttClient]); // Run this effect when the mqttClient changes


  // Add polling interval to request data from selected Pi every 10 seconds
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    // Only start polling if connected and a Pi is selected
    if (isConnected && selectedPiId && selectedPiId !== "?") {
      console.log('Starting polling for Pi data');

      // Initial request immediately upon connection
      requestPiData();

      // Set up regular polling interval
      pollInterval = setInterval(() => {
        requestPiData();
      }, 10000); // Poll every 10 seconds
    }

    // Function to request data from the selected Pi
    function requestPiData() {
      if (mqttClient && mqttClient.connected && selectedPiId) {
        const message = JSON.stringify({
          "target": selectedPiId
        });

        // Publish the message to the topic
        mqttClient.publish('emp/operations', message, { qos: 1 }, (error) => {
          if (error) {
            console.error('Error publishing data request:', error);
          } else {
            console.log(`Data request sent to Pi ${selectedPiId}`);
          }
        });
      }
    }

    // Clean up interval when component unmounts or connection state changes
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        console.log('Stopped polling for Pi data');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, selectedPiId]); // Re-establish polling when connection status or selected Pi changes


  // Change the background color based on the time or light level
  useEffect(() => {
    if (Object.keys(currentPiData).length > 0 && isAuto) {
      const calculatedTime = getMusicTime(currentPiData.time, currentPiData.light_level, useTime);

      if (calculatedTime === 'day') {
        changeBackgroundColor('day');
      } else if (calculatedTime === 'night') {
        changeBackgroundColor('night');
      }
    }
    else if (!isAuto) {
      // If auto mode is disabled, set the background color based on manual time
      if (manualTime === 'day') {
        changeBackgroundColor('day');
      } else if (manualTime === 'night') {
        changeBackgroundColor('night');
      }
    }

    // Reset the hasUpdated flag after processing
    if (currentPiData.hasUpdated) {
      setCurrentPiData(prevData => ({
        ...prevData,
        hasUpdated: false  // Reset the flag
      }));
    }
  }, [currentPiData, isAuto, useTime, manualTime]);


  // Manual connect function
  const handleConnect = () => {
    if (mqttClient) {
      console.log('Connecting to MQTT broker...');
      mqttClient.connect();
    }
  };


  // Manual disconnect function
  const handleDisconnect = () => {
    if (mqttClient) {
      hasSubscribed.current = false;
      setIsConnected(false);
      mqttClient.end(true);
      console.log('Manually disconnected from MQTT broker');
    }
  };


  // Broadcast to all Pis
  const handleBroadcast = () => {
    if (mqttClient && mqttClient.connected) {
      const message = JSON.stringify({
        "discovery": true,
        "target": "all"   // Actually this field is not being read in the RPi
      });

      // Publish the message to the topic
      mqttClient.publish('emp/operations', message, { qos: 1 }, (error) => {
        if (error) {
          console.error('Error broadcasting to all Pis:', error);
        } else {
          console.log('Broadcast message sent to all Pis');
          messageApi.info({
            content: 'Broadcast message sent to all Pis',
            duration: 3,
          });
        }
      });
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
        onBroadcast={handleBroadcast}
      />
      <TimeWeather
        piWeather={isAuto ? currentPiData.weather : manualWeather}
        piTime={isAuto ? currentPiData.time : manualTime}
        piTemperature={currentPiData.temperature}
        piLightLevel={currentPiData.light_level}
        piTimezone={currentPiData.timezone}
        piSunrise={currentPiData.sunrise}
        piSunset={currentPiData.sunset}
        musicIsFading={musicIsFading}
        isAuto={isAuto}
        setIsAuto={setIsAuto}
        setManualWeather={setManualWeather}
        setManualTime={setManualTime}
      />
      <MusicPlayer
        isAuto={isAuto}
        piWeather={isAuto ? currentPiData.weather : manualWeather}
        piTime={isAuto ? currentPiData.time : manualTime}
        piTemperature={currentPiData.temperature}
        piLightLevel={currentPiData.light_level}
        onFadingChange={setMusicIsFading}
      />
    </div>
  );
}

export default AppContent;
