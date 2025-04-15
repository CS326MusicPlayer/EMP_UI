// Settings modal to set up broker information
import React, { useState } from 'react';
import { Modal, Form, Input, message, Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useBrokerAuth } from '../../contexts/BrokerAuthContext';

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
  const { brokerAuth, setBrokerAuth, masterPassword, setMasterPassword, saveCredentials } = useBrokerAuth();
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
      title="Broker Information"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <button key="cancel" onClick={onClose}>
          Cancel
        </button>,
        <button key="save" onClick={handleSave}>
          Save
        </button>
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="Host"
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
        <Form.Item label="Port" required>
          <Input value={brokerAuth.port} onChange={handlePortChange} />
        </Form.Item>
        <Form.Item label="Username">
          <Input value={brokerAuth.username} onChange={handleUsernameChange} />
        </Form.Item>
        <Form.Item label="Password">
          <Input.Password value={brokerAuth.password} onChange={handlePasswordChange} />
        </Form.Item>

        <Form.Item>
          <div style={{ marginBottom: 16, borderTop: '1px solid #e8e8e8', paddingTop: 16 }}>
            <h4>Secure Storage Options</h4>
            <p style={{ fontSize: '12px', color: '#888' }}>
              Save your broker information securely to local storage using encryption
            </p>
          </div>
          <Checkbox
            checked={savingToLocalStorage}
            onChange={(e: CheckboxChangeEvent) => setSavingToLocalStorage(e.target.checked)}
          >
            Save broker information securely
          </Checkbox>
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
}
export default BrokerInfoModal;
