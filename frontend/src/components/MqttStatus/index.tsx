// Display and manage the MQTT connection status
// and the selected Raspberry Pi device.

import React, { useState, useEffect } from "react";
import { LuCheck, LuEllipsis } from "react-icons/lu";
import { Popover, Spin } from "antd";
import { LuPower, LuPowerOff } from "react-icons/lu";
import { SwapOutlined } from '@ant-design/icons';
import { usePiSelection } from "../../contexts/PiSelectionContext";
import { formatTimeAgo } from '../../utilities/utils';
import classes from './styles.module.css';


export default function MqttStatus({
  mqttConnected,
  musicIsFading,
  lastConnectedTime,
  onConnect,
  onDisconnect
}: {
  mqttConnected: boolean;
  musicIsFading: boolean;
  lastConnectedTime: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}
): React.ReactElement {
  const { selectedPiId, setSelectedPiId, piList } = usePiSelection();
  const [timeDisplay, setTimeDisplay] = useState<string>('');

  // Update the time display initially and when lastConnectedTime changes
  useEffect(() => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
  }, [lastConnectedTime]);

  // Handle mouse enter to refresh the time display
  const handleMouseEnter = () => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
  };


  // Rotate the pi
  const getNextPiId = (currentPiId: string, piList: string[]) => {
    const currentIndex = piList.indexOf(currentPiId);
    const nextIndex = (currentIndex + 1) % piList.length;
    return piList[nextIndex];
  };


  const onlineContent = (
    <div>
      <p style={{ color: '#616161' }}>Your device seems to be online!</p>
      <p style={{ color: '#8e8e8e' }}>Connected to MQTT Server</p>
    </div>
  );

  const offlineContent = (
    <div>
      <p style={{ color: '#616161' }}>Your device seems to be offline</p>
      <p style={{ color: '#8e8e8e' }}>Last seen: {timeDisplay}</p>
    </div>
  );

  return (
    <div className={classes.container}>
      <span className={classes.status}>
        <Popover content={mqttConnected ? onlineContent : offlineContent} trigger="hover" placement="top">
          <div
            className={classes.statusIconContainer}
            style={{
              backgroundColor: `${mqttConnected ? '#8ae9c9' : '#eeeeee'}`,
              borderColor: `${mqttConnected ? '#d1f3e7' : '#f3f3f3'}`
            }}
            onMouseEnter={handleMouseEnter}
          >
            {mqttConnected ? <LuCheck className={classes.statusIcon} /> : <LuEllipsis className={classes.statusIcon} />}
          </div>
        </Popover>
        <p className={classes.statusText}>{mqttConnected ? 'Online' : 'Offline'}</p>
        {/* Pi Swap button */}
        { mqttConnected &&
          <>
            <Popover
              content={
                piList.length > 1 ?
                  <div>
                    <h3 style={{ color: 'var(--black)' }}>Switch Pi</h3>
                    <p style={{ color: 'var(--black)' }}>Click to switch to another Pi</p>
                    <p style={{ color: 'var(--gray)' }}>Current Pi: {selectedPiId}</p>
                    <p style={{ color: 'var(--gray)' }}>Available Pis: {piList.join(', ')}</p>
                  </div>
                  :
                  <div>
                    <h3 style={{ color: 'var(--black)' }}>Switch Pi</h3>
                    <p style={{ color: 'var(--black)' }}>Only one Pi available</p>
                  </div>
              }
              trigger="hover"
              placement="top"
            >
              <div
                className={piList.length > 1 && !musicIsFading ? classes.piSwitchButton : classes.piSwitchButtonDisabled}
                onClick={() => {
                  // Only rotate if there are multiple Pis
                  if (piList.length > 1 && !musicIsFading) {
                    const nextPiId = getNextPiId(selectedPiId, piList);
                    setSelectedPiId(nextPiId);
                  }
                }}
              >
                <SwapOutlined style={{ color: 'var(--black)' }} />
              </div>
            </Popover>
            <p className={classes.statusText}>Pi: {selectedPiId}</p>
          </>
        }
      </span>
      {musicIsFading && (<Spin className={classes.musicStatusSpinner} />)}
      <span className={classes.connection}>
        <Popover
          content={
            <div>
              <h3 style={{ color: 'var(--black)' }}>{mqttConnected ? 'Disconnect' : 'Connect'}</h3>
              <p style={{ color: 'var(--black)' }}>
                {mqttConnected ? 'Click to disconnect from the MQTT server' : 'Click to connect to the MQTT server'}
              </p>
            </div>
          }
          trigger="hover"
          placement="top"
        >
          {mqttConnected ? (
            <button className={classes.connButton} onClick={onDisconnect}><LuPowerOff /></button>
          ) : (
            <button className={classes.connButton} onClick={onConnect}><LuPower /></button>
          )}
        </Popover>
      </span>
    </div>
  );
}
