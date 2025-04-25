// Main App root component
// Daniel Kim (jk254), Jason Chew (jgc23)

import { ConfigProvider, FloatButton, Popover } from 'antd';
import { GithubOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { SensorPreferencesProvider } from './contexts/SensorPreferencesContext';
import { PiSelectionProvider } from './contexts/PiSelectionContext';
import { BrokerAuthProvider, useBrokerAuth } from './contexts/BrokerAuthContext';
import AppContent from './AppContent';
import SettingsModal from './components/SettingsModal';
import { getMqttClient } from './services/mqttService';
import type { MqttClient } from 'mqtt';
import './App.css';


function AppContainer(): React.ReactElement {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const { brokerAuth, setBrokerAuth } = useBrokerAuth();
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);

  // Create MQTT client when broker info changes
  useEffect(() => {
    // Only create a client if we have the required host and port
    if (brokerAuth.host && brokerAuth.port) {
      const client = getMqttClient({
        host: brokerAuth.host,
        port: brokerAuth.port,
        username: brokerAuth.username,
        password: brokerAuth.password
      });

      setMqttClient(client);

      // Clean up by ending the client connection when component unmounts
      return () => {
        if (client) {
          client.end(true);
        }
      };
    }
  }, [brokerAuth]);


  const handleSaveBrokerInfo = (brokerInfo: {
    host: string;
    port: string;
    username?: string;
    password?: string
  }) => {
    // Update broker auth with connection info
    setBrokerAuth({
      host: brokerInfo.host,
      port: brokerInfo.port,
      username: brokerInfo.username,
      password: brokerInfo.password
    });

    console.log('Broker info saved!');
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
      <AppContent mqttClient={mqttClient} />
      <SettingsModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        onSave={handleSaveBrokerInfo}
      />
      <Popover
        content={!(brokerAuth.host && brokerAuth.port) && 
          <div>
            <p style={{ color: 'var(--black)' }}>It seems like you haven't set up the broker info yet!</p>
            <p style={{ color: 'var(--gray)' }}>Click the settings button to configure</p>
          </div>
        }
        trigger="hover"
        placement="left"
      >
        {/* Float Button (bottom right) */}
        <FloatButton.Group
          shape="circle"
          trigger='hover'
          icon={<InfoCircleOutlined />}
          badge={brokerAuth.host && brokerAuth.port ? undefined : { count: 1, color: 'var(--emerald2)' }}
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
            // Show the badge if the broker info is not set
            badge={brokerAuth.host && brokerAuth.port ? undefined : { count: 1, color: 'var(--emerald2)' }}
          />
        </FloatButton.Group>
      </Popover>
    </ConfigProvider>
  );
}

function App(): React.ReactElement {
  return (
    <BrokerAuthProvider>
      <SensorPreferencesProvider>
        <PiSelectionProvider>
          <AppContainer />
        </PiSelectionProvider>
      </SensorPreferencesProvider>
    </BrokerAuthProvider>
  );
}

export default App;
