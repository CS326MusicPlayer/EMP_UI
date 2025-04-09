import { ConfigProvider } from 'antd';
import React from 'react';
import { SensorPreferencesProvider } from './contexts/SensorPreferencesContext';
import AppContent from './AppContent';
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
      <SensorPreferencesProvider>
        <AppContent />
      </SensorPreferencesProvider>
    </ConfigProvider>
  )
}

export default App;
