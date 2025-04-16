// Settings modal to set up broker information
import React, { useState } from 'react';
import { Modal, Form, Input, message, Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useBrokerAuth } from '../../contexts/BrokerAuthContext';
import classes from './styles.module.css';

interface BrokerInfoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brokerInfo: { host: string; port: number; username?: string; password?: string }) => void;
}

const BrokerInfoModal: React.FC<BrokerInfoProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { brokerAuth, setBrokerAuth, masterPassword, setMasterPassword, saveCredentials, handlePasswordBlur } = useBrokerAuth();
  const [savingToLocalStorage, setSavingToLocalStorage] = useState(false);

  // When form fields are updated, update the context
  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ host: e.target.value });
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ port: Number(e.target.value) });
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ username: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerAuth({ password: e.target.value });
  };

  const handleMasterPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterPassword(e.target.value);
  };

  const handleSave = async () => {
    if (!brokerAuth.host || !brokerAuth.port) {
      message.error('Host and port are required');
      return;
    }

    // Pass the broker info to the parent component
    onSave({
      host: brokerAuth.host,
      port: brokerAuth.port,
      username: brokerAuth.username,
      password: brokerAuth.password
    });

    // If user wants to save to localStorage, encrypt and save it
    if (savingToLocalStorage) {
      await saveCredentials();
    }

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
        <button key="save" onClick={handleSave} className={classes.saveButton}>
          Save
        </button>
      </div>
}
    >
      <Form layout="vertical">
<Form.Item>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', color: 'var(--black)' }}>
              Load/Save Broker Credentials
              <Checkbox
                checked={savingToLocalStorage}
                onChange={(e: CheckboxChangeEvent) => setSavingToLocalStorage(e.target.checked)}
                data-testid="save-credentials-checkbox"
                style={{ marginLeft: '0.2rem' }}
              ></Checkbox>
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#888' }}>
              Load/Save your broker information securely to brower
            </p>
          </div>
        </Form.Item>

        {savingToLocalStorage && (
          <Form.Item label={<p style={{ color: 'var(--black)' }}>Master Password</p>} required={savingToLocalStorage}>
            <Input.Password
              value={masterPassword}
              onChange={handleMasterPasswordChange}
              onBlur={handlePasswordBlur}
              placeholder="Enter a master password to load or save credentials"
              autoComplete="new-password"
            />
            <div style={{ fontSize: '0.75rem', color: '#ff4d4f' }}>
              Remember this password! You'll need it to decrypt your saved information.
            </div>
          </Form.Item>
        )}

        <hr />

        <Form.Item
          label={<p style={{ color: 'var(--black)' }}>Host</p>}
          required
          rules={[
            {
              required: true,
              message: 'Host address is required!'
            }
          ]}
        >
          <Input value={brokerAuth.host} onChange={handleHostChange} />
        </Form.Item>
        <Form.Item label={<p style={{ color: 'var(--black)' }}>Port</p>} required>
          <Input value={brokerAuth.port} onChange={handlePortChange} />
        </Form.Item>
        <Form.Item label={<p style={{ color: 'var(--black)' }}>Username</p>}>
          <Input value={brokerAuth.username} onChange={handleUsernameChange}
            allowClear
            autoComplete="username"
            placeholder="Optional username for broker authentication"
/>
        </Form.Item>
        <Form.Item label={<p style={{ color: 'var(--black)' }}>Password</p>}>
          <Input.Password value={brokerAuth.password} onChange={handlePasswordChange}
            autoComplete="current-password"
            placeholder="Optional password for broker authentication"
          />
        </Form.Item>

        {savingToLocalStorage && (
          <Form.Item label="Master Password (for encryption)" required={savingToLocalStorage}>
            <Input.Password
              value={masterPassword}
              onChange={handleMasterPasswordChange}
              placeholder="Password to encrypt/decrypt your broker credentials"
            />
            <div style={{ fontSize: '0.8rem', color: '#ff4d4f', marginTop: 4 }}>
              Remember this password! You'll need it to decrypt your saved information.
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default BrokerInfoModal;
