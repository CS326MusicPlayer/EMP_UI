// Component to display and manage the MQTT connection status, and select Raspberry Pi device
// Daniel Kim (jk254), Jason Chew (jgc23)

import React, { useState, useEffect } from "react";
import { LuCheck, LuEllipsis } from "react-icons/lu";
import { Popover, Spin, Dropdown, Typography } from "antd";
import { LuPower, LuPowerOff } from "react-icons/lu";
import { DownOutlined } from '@ant-design/icons';
import { RiBroadcastFill } from "react-icons/ri";
import { useBrokerAuth } from '../../contexts/BrokerAuthContext';
import { usePiSelection } from "../../contexts/PiSelectionContext";
import { formatTimeAgo } from '../../utilities/utils';
import classes from './styles.module.css';


export default function MqttStatus({
  mqttConnected,
  musicIsFading,
  lastConnectedTime,
  onConnect,
  onDisconnect,
  onBroadcast
}: {
  mqttConnected: boolean;
  musicIsFading: boolean;
  lastConnectedTime: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onBroadcast: () => void;
}
): React.ReactElement {
  const { selectedPiId, setSelectedPiId, piList } = usePiSelection(); // Pi selection
  const [timeDisplay, setTimeDisplay] = useState<string>('');         // Time display for last seen
  const [showStatus, setShowStatus] = useState<boolean>(true);        // Pi's last seen status
  const { brokerAuth } = useBrokerAuth();                             // Broker information

  // Update the time display initially and when lastConnectedTime changes
  useEffect(() => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
  }, [lastConnectedTime]);

  
  // Handle mouse enter to refresh the time display
  const handleMouseEnter = () => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
    setShowStatus(false);
  };


  const onlineContent = (
    <div>
      <h3 style={{ color: '#616161' }}>Your device seems to be online!</h3>
      <p style={{ color: 'var(--black)' }}>Click to disconnect from the MQTT server</p>
      <p style={{ color: 'var(--emerald2)' }}>Connected to MQTT Server</p>
    </div>
  );

  const offlineContent = (
    <div>
      <p style={{ color: '#616161' }}>Your device seems to be offline</p>
      <p style={{ color: 'var(--black)' }}>
        {(brokerAuth.host && brokerAuth.port) ? 'Click to connect to the MQTT server' : 'Set up your MQTT server in the settings!'}
      </p>
      <p style={{ color: 'var(--gray)' }}>Last seen: {timeDisplay}</p>
    </div>
  );

  return (
    <div className={classes.container}>
      <span className={classes.status}>
        <Popover
          content={mqttConnected ? onlineContent : offlineContent}
          trigger="hover"
          placement="top">
          <div
            className={classes.statusIconContainer}
            style={{
              backgroundColor: `${mqttConnected ? '#8ae9c9' : '#eeeeee'}`,
              borderColor: `${mqttConnected ? '#d1f3e7' : '#f3f3f3'}`
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowStatus(true)}
            onClick={mqttConnected ? onDisconnect : onConnect}
          >
            {mqttConnected ?
              (showStatus ? <LuPower className={classes.statusIcon} /> : <LuCheck className={classes.statusIcon} />):
              (showStatus ? <LuPowerOff className={classes.statusIcon} /> : <LuEllipsis className={classes.statusIcon} />)
            }
          </div>
        </Popover>
        <p className={classes.statusText}>{mqttConnected ? 'Online' : 'Offline'}</p>
      </span>
      {musicIsFading && (<Spin size="large" className={classes.musicStatusSpinner} />)}

      {/* Pi Broadcast button */}
      {mqttConnected && (
        <span className={classes.piBroadcast}>
          <Popover
            content={!musicIsFading &&
              <div>
                <h3 style={{ color: 'var(--black)' }}>Pi Discovery</h3>
                <p style={{ color: 'var(--black)' }}>Click to discover all available Pis!</p>
                <p style={{ color: 'var(--gray)' }}>Current Pi: {selectedPiId}</p>
                <p style={{ color: 'var(--gray)' }}>Available Pis: {piList.join(', ')}</p>
              </div>
            }
            trigger="hover"
            placement="top"
          >
            <div
              className={!musicIsFading ? classes.piBroadcastButton : classes.piBroadcastButtonDisabled}
              onClick={() => {
                // Broadcast to all Pis
                if (mqttConnected && !musicIsFading) {
                  onBroadcast();
                }
              }}
            >
              <RiBroadcastFill />
            </div>
          </Popover>
        </span>
      )}

      {/* Pi Swap dropdown */}
      <span className={classes.piStatusContainer}>
        { mqttConnected &&
          <>
            <p className={classes.statusText}>Pi:</p>
            {piList.length > 0 ? (
              <Dropdown
                menu={{
                  items: piList.map(id => ({
                    key: id,
                    label: `Pi ${id}`,
                    disabled: musicIsFading || id === selectedPiId
                  })),
                  onClick: ({ key }) => setSelectedPiId(key),
                }}
                placement="top"
                disabled={piList.length <= 1 || musicIsFading}
                trigger={['hover']}
              >
                <div className={piList.length > 1 && !musicIsFading ? classes.piDropdownButton : classes.piDropdownButtonDisabled}>
                  <Typography.Text strong style={{ marginRight: '5px', color: 'var(--black)' }}>
                    {selectedPiId}
                  </Typography.Text>
                  <DownOutlined style={{ color: 'var(--black)', fontSize: '10px' }} />
                </div>
              </Dropdown>
            ) : (
              <div className={classes.piDropdownButtonDisabled}>
                <Typography.Text strong style={{ marginRight: '5px', color: 'var(--gray)' }}>
                  {selectedPiId}
                </Typography.Text>
              </div>
            )}
          </>
        }
      </span>
    </div>
  );
}
