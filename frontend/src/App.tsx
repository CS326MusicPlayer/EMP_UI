import { ConfigProvider, FloatButton } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
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
          <FloatButton
            icon={<GithubOutlined />}
            href="https://github.com/CS326MusicPlayer/EMP_UI" 
            target="_blank"
            tooltip="View project on GitHub"
          />
        </PiSelectionProvider>
      </SensorPreferencesProvider>
    </ConfigProvider>
  )
}

export default App;
