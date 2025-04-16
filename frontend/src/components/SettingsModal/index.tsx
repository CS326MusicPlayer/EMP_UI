// Settings modal to set up broker information
import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { useBrokerAuth } from '../../contexts/BrokerAuthContext';
import classes from './styles.module.css';

interface BrokerInfoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brokerInfo: { host: string; port: string; username?: string; password?: string }) => void;
}

const BrokerInfoModal: React.FC<BrokerInfoProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { brokerAuth, setBrokerAuth } = useBrokerAuth();
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // When form fields are updated, update the context
  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ host: e.target.value });
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ port: e.target.value });
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ username: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ password: e.target.value });
  };


  const handleSave = async () => {
    if (!brokerAuth.host || !brokerAuth.port) {
      setWarningMsg('Host and port are required!');
      return;
    }

    // Pass the broker info to the parent component
    onSave({
      host: brokerAuth.host,
      port: brokerAuth.port,
      username: brokerAuth.username,
      password: brokerAuth.password
    });


    onClose();
  };

  return (
    <Modal
      title={<h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--black)' }}>Broker Settings</h3>}
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className={classes.modalFooter}>
        <button key="cancel" onClick={onClose} className={classes.cancelButton}>
          Cancel
        </button>
        {warningMsg && <p className={classes.warningMsg}>{warningMsg}</p>}
        <button key="save" onClick={handleSave} className={classes.saveButton}>
          Save
        </button>
      </div>
}
    >
      <Form layout="vertical">
        <Form.Item
          label={<p style={{ color: 'var(--black)' }}>Host</p>}
          required
        >
          <Input
            value={brokerAuth.host}
            onChange={handleHostChange}
            placeholder='e.g., test.mosquitto.org'
          />
        </Form.Item>

        <Form.Item
          label={<p style={{ color: 'var(--black)' }}>Port</p>}
          required
        >
          <Input
            value={brokerAuth.port}
            onChange={handlePortChange}
            placeholder='e.g., 8083, or 1883' 
          />
        </Form.Item>

        <Form.Item label={<p style={{ color: 'var(--black)' }}>Username</p>}>
          <Input value={brokerAuth.username} onChange={handleUsernameChange}
            placeholder="Optional username for broker authentication"
            allowClear
            autoComplete="username"
        />
        </Form.Item>
        <Form.Item label={<p style={{ color: 'var(--black)' }}>Password</p>}>
          <Input.Password value={brokerAuth.password} onChange={handlePasswordChange}
            autoComplete="current-password"
            placeholder="Optional password for broker authentication"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BrokerInfoModal;
