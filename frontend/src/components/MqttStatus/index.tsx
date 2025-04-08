import React, { useState, useEffect } from "react";
import { LuCheck, LuEllipsis } from "react-icons/lu";
import { Popover, Spin } from "antd";
import classes from './styles.module.css';


// This should move to separate utility file
const formatTimeAgo = (timestamp: string | null): string => {
  if (!timestamp) return 'Unknown';
  
  try {
    // Parse the timestamp
    const date = new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format received:', timestamp);
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Convert to appropriate units
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Format as human-readable string
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Error';
  }
};


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
