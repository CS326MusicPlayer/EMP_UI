import { ConfigProvider } from 'antd';
import React from 'react';
import PiStatus from './components/PiStatus';
import TimeWeather from './components/TimeWeather';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

function App(): React.ReactElement {

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
