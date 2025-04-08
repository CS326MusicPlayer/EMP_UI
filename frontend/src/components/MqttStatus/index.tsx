import React, { useState, useEffect } from "react";
import { LuCheck, LuEllipsis } from "react-icons/lu";
import { Popover, Spin } from "antd";
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
  const [timeDisplay, setTimeDisplay] = useState<string>('');
  
  // Update the time display initially and when lastConnectedTime changes
  useEffect(() => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
  }, [lastConnectedTime]);
  
  // Handle mouse enter to refresh the time display
  const handleMouseEnter = () => {
    setTimeDisplay(formatTimeAgo(lastConnectedTime));
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
      </span>
      {musicIsFading && (<Spin className={classes.musicStatusSpinner} />)}
      <span className={classes.connection}>
        {mqttConnected ? (
          <button className={classes.connButton} onClick={onDisconnect}>Disconnect</button>
        ) : (
          <button className={classes.connButton} onClick={onConnect}>Connect</button>
        )}
      </span>
    </div>
  );
}
