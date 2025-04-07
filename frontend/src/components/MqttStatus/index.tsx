import React from "react";
import { LuCheck, LuEllipsis } from "react-icons/lu";
import { Popover } from "antd";
import classes from './styles.module.css';

export default function MqttStatus({
  mqttConnected,
  onConnect,
  onDisconnect
}: {
    mqttConnected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
  }
): React.ReactElement {
  // Hardcoded for demonstration
  const onlineSince = '3 minutes ago';

  const onlineContent = (
    <div>
      <p style={{ color: '#616161' }}>Your device seems to be online!</p>
      <p style={{ color: '#8e8e8e' }}>Online since {onlineSince}</p>
    </div>
  );

  const offlineContent = (
    <div>
      <p style={{ color: '#616161' }}>Your device seems to be offline</p>
      <p style={{ color: '#8e8e8e' }}>Last seen {onlineSince}</p>
    </div>
  );

  return (
    <div className={classes.container}>
      <span className={classes.status}>
        <Popover content={mqttConnected ? onlineContent : offlineContent} trigger="hover" placement="top">
          <div className={classes.statusIconContainer} style={{ backgroundColor: `${mqttConnected ? '#8ae9c9' : '#eeeeee'}`, borderColor: `${mqttConnected ? '#d1f3e7' : '#f3f3f3'}` }} >
            {mqttConnected ? <LuCheck className={classes.statusIcon} /> : <LuEllipsis className={classes.statusIcon} />}
          </div>
        </Popover>
        <p className={classes.statusText}>{mqttConnected ? 'Online' : 'Offline'}</p>
      </span>
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