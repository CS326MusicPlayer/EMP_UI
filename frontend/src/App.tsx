import { ConfigProvider } from 'antd';
import React, { useEffect, useState } from 'react';
import PiStatus from './components/PiStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

function App(): React.ReactElement {
  // Hardcoded for demonstration, replace with actual MQTT data
  // #b3e6ff for day, #3a3a5c for night
  const [backgroundColor, setBackgroundColor] = useState('#b3e6ff');
  
  const mqttMessage = { bgColor: '#b3e6ff' };
  const changeBackgroundColor = (newColor: string) => {
    document.documentElement.style.setProperty('--background-color', newColor);
  };

  useEffect(() => {
    // Simulate receiving a message from MQTT
    setBackgroundColor(mqttMessage.bgColor);
    changeBackgroundColor(backgroundColor);
  }, [mqttMessage]);

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
        <PiStatus />
        <TimeWeather />
        <MusicPlayer />
      </div>
    </ConfigProvider>
  )
}

export default App
