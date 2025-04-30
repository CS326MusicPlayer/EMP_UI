// Settings modal to set up broker information
// Daniel Kim (jk254), Jason Chew (jgc23)

import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Modal, Form, Input } from 'antd';
import { useBrokerAuth } from '../../contexts/BrokerAuthContext';
import classes from './styles.module.css';

// BrokerInfoModal props
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
  const { brokerAuth, setBrokerAuth } = useBrokerAuth();              // Broker authentication context
  const [warningMsg, setWarningMsg] = useState<string | null>(null);  // Warning message (when host or port is empty)
  const [formValues, setFormValues] = useState({
    host: brokerAuth.host || '',
    port: brokerAuth.port || '',
    username: brokerAuth.username || '',
    password: brokerAuth.password || ''
  });


  // When the modal opens, initialize form values with current brokerAuth values
  // Written with the help of Copilot
  useEffect(() => {
    if (isOpen) {
      setFormValues({
        host: brokerAuth.host || '',
        port: brokerAuth.port || '',
        username: brokerAuth.username || '',
        password: brokerAuth.password || ''
      });
      setWarningMsg(null);
    }
  }, [isOpen, brokerAuth]);


  // Handle form field changes locally
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormValues({
      ...formValues,
      [field]: e.target.value
    });
  };


  // Handle key press event
  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };


  // Handle save button click (Written with the help of Copilot)
  const handleSave = async () => {
    if (!formValues.host || !formValues.port) {
      setWarningMsg('Host and port are required!');
      return;
    }

    // Close the modal if the new values are the same as the current values
    if (
      formValues.host === brokerAuth.host &&
      formValues.port === brokerAuth.port &&
      formValues.username === brokerAuth.username &&
      formValues.password === brokerAuth.password
    ) {
      onClose();
      return;
    }


    // Update broker auth context with form values only on save
    setBrokerAuth({
      host: formValues.host,
      port: formValues.port,
      username: formValues.username || undefined,
      password: formValues.password || undefined
    });


    // Pass the broker info to the parent component
    onSave({
      host: formValues.host,
      port: formValues.port,
      username: formValues.username || undefined,
      password: formValues.password || undefined
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
      <p style={{ textAlign: 'center', color: 'var(--black)' }}>
        Enter the broker information to connect to the MQTT broker
      </p>
      <p style={{ textAlign: 'center', color: 'var(--black)' }}>
        Also set up your <a href="https://github.com/CS326MusicPlayer/MusicPlayer" target="_blank" rel="noopener noreferrer">Raspberry Pi</a> MQTT broker
      </p>
      <br />
      <Form layout="vertical" onKeyDown={handleKeyDown}>
        <Form.Item
          label={<p style={{ color: 'var(--black)' }}>Host</p>}
          required
        >
          <Input
            value={formValues.host}
            onChange={(e) => handleInputChange(e, 'host')}
            placeholder='e.g., test.mosquitto.org'
            allowClear
          />
        </Form.Item>

        <Form.Item
          label={<p style={{ color: 'var(--black)' }}>Port</p>}
          required
        >
          <Input
            value={formValues.port}
            onChange={(e) => handleInputChange(e, 'port')}
            allowClear
            placeholder='e.g., 8083, or 1883'
          />
        </Form.Item>

        <Form.Item label={<p style={{ color: 'var(--black)' }}>Username</p>}>
          <Input
            value={formValues.username}
            onChange={(e) => handleInputChange(e, 'username')}
            placeholder="Optional username for broker authentication"
            allowClear
            autoComplete="username"
          />
        </Form.Item>
        <Form.Item label={<p style={{ color: 'var(--black)' }}>Password</p>}>
          <Input.Password
            value={formValues.password}
            onChange={(e) => handleInputChange(e, 'password')}
            autoComplete="current-password"
            placeholder="Optional password for broker authentication"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BrokerInfoModal;
