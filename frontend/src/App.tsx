import { ConfigProvider, FloatButton } from 'antd';
import { GithubOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { SensorPreferencesProvider } from './contexts/SensorPreferencesContext';
import { PiSelectionProvider } from './contexts/PiSelectionContext';
import AppContent from './AppContent';
import './App.css';

function App(): React.ReactElement {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

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
          <FloatButton.Group
            shape="circle"
            trigger='hover'
            icon={<InfoCircleOutlined />}
          >
            <FloatButton
              icon={<GithubOutlined />}
              href="https://github.com/CS326MusicPlayer/EMP_UI" 
              target="_blank"
              tooltip="View project on GitHub"
            />
            <FloatButton
              icon={<SettingOutlined className="floatSettingsButton" />}
              tooltip="Settings"
              onClick={() => setIsSettingModalOpen(true)}
            />
          </FloatButton.Group>
        </PiSelectionProvider>
      </SensorPreferencesProvider>
    </ConfigProvider>
  )
}

export default App;
