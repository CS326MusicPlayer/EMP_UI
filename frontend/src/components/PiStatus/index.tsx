import React, { useState } from "react";
import { LuCheck, LuEllipsis } from "react-icons/lu";
import { Popover } from "antd";
import classes from './styles.module.css';

export default function PiStatus(): React.ReactElement {
  // TODO: Replace with actual Pi status, received from MQTT
  const [isOnline, _setIsOnline] = useState(true);
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
      <p style={{ color: '#616161' }}>Your device seems to be offline!</p>
      <p style={{ color: '#8e8e8e' }}>Last seen {onlineSince}</p>
    </div>
  );

  return (
    <div className={classes.container}>
      <span className={classes.status}>
        <Popover content={isOnline ? onlineContent : offlineContent} trigger="hover" placement="top">
          <div className={classes.statusIconContainer} style={{ backgroundColor: `${isOnline && '#8ae9c9'}` }} >
            {isOnline ? <LuCheck className={classes.statusIcon} /> : <LuEllipsis className={classes.statusIcon} />}
          </div>
        </Popover>
        <p className={classes.piName}>Sender Pi</p>
      </span>
      <span className={classes.status}>
        <p className={classes.piName}>Receiver Pi</p>
        <Popover content={isOnline ? onlineContent : offlineContent} trigger="hover" placement="top">
          <div className={classes.statusIconContainer} style={{ backgroundColor: `${isOnline && '#8ae9c9'}` }} >
            {isOnline ? <LuCheck className={classes.statusIcon} /> : <LuEllipsis className={classes.statusIcon} />}
          </div>
        </Popover>
      </span>
    </div>
  );
}