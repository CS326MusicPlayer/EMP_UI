import { ConfigProvider } from 'antd';
import React from 'react';
import { SensorPreferencesProvider } from './contexts/SensorPreferencesContext';
import { PiSelectionProvider } from './contexts/PiSelectionContext';
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
        <PiSelectionProvider>
          <AppContent />
        </PiSelectionProvider>
      </SensorPreferencesProvider>
    </ConfigProvider>
  )
}

export default App;
