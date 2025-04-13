// Display and manage the MQTT connection status
// and the selected Raspberry Pi device.

import React, { useState, useEffect } from "react";
import { LuCheck, LuEllipsis } from "react-icons/lu";
import { Popover, Spin } from "antd";
import { LuPower, LuPowerOff } from "react-icons/lu";
import { SwapOutlined } from '@ant-design/icons';
import { RiBroadcastFill } from "react-icons/ri";
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
  const { selectedPiId, setSelectedPiId, piList } = usePiSelection();
  const [timeDisplay, setTimeDisplay] = useState<string>('');
  const [showStatus, setShowStatus] = useState<boolean>(true);

  // Update the time display initially and when lastConnectedTime changes
  useEffect(() => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
  }, [lastConnectedTime]);

  // Handle mouse enter to refresh the time display
  const handleMouseEnter = () => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
    setShowStatus(false);
  };


  // Rotate the pi
  const getNextPiId = (currentPiId: string, piList: string[]) => {
    const currentIndex = piList.indexOf(currentPiId);
    const nextIndex = (currentIndex + 1) % piList.length;
    return piList[nextIndex];
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
      <p style={{ color: 'var(--black)' }}>Click to connect to the MQTT server</p>
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
      {musicIsFading && (<Spin className={classes.musicStatusSpinner} />)}

      {/* Pi Broadcast button */}
      {mqttConnected && (
        <span className={classes.piBroadcast}>
          <Popover
            content={
              <div>
                <h3 style={{ color: 'var(--black)' }}>Pi Discovery</h3>
                <p style={{ color: 'var(--black)' }}>Click to discover all available Pis!</p>
              </div>
            }
            trigger="hover"
            placement="top"
          >
            <div
              className={classes.piBroadcastButton}
              onClick={() => {
                // Broadcast to all Pis
                if (mqttConnected) {
                  onBroadcast();
                }
              }}
            >
              <RiBroadcastFill style={{ color: 'var(--black)' }} />
            </div>
          </Popover>
        </span>
      )}

      {/* Pi Swap button */}
      <span className={classes.piStatusContainer}>
        { mqttConnected &&
            <>
              <p className={classes.statusText}>Pi: {selectedPiId}</p>
              <Popover
                content={
                  piList.length === 1 ?
                    <div>
                      <h3 style={{ color: 'var(--black)' }}>Switch Pi</h3>
                      <p style={{ color: 'var(--black)' }}>Only one Pi available</p>
                    </div>
                    :
                  piList.length > 1 ?
                    <div>
                      <h3 style={{ color: 'var(--black)' }}>Switch Pi</h3>
                      <p style={{ color: 'var(--black)' }}>Click to switch to another Pi</p>
                      <p style={{ color: 'var(--gray)' }}>Current Pi: {selectedPiId}</p>
                      <p style={{ color: 'var(--gray)' }}>Available Pis: {piList.join(', ')}</p>
                    </div>
                    :
                  piList.length === 0 ?
                    <div>
                      <h3 style={{ color: 'var(--black)' }}>Switch Pi</h3>
                      <p style={{ color: 'var(--black)' }}>No Pi available yet!</p>
                    </div>
                    :
                    <div>
                      <h3 style={{ color: 'var(--black)' }}>Switch Pi</h3>
                      <p style={{ color: 'var(--black)' }}>Click to switch to another Pi</p>
                      <p style={{ color: 'var(--gray)' }}>Current Pi: {selectedPiId}</p>
                      <p style={{ color: 'var(--gray)' }}>Available Pis: {piList.join(', ')}</p>
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
            </>
        }
      </span>
    </div>
  );
}
