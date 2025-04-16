// Broker authentication context (written with the help of Copilot)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { saveBrokerInfo, getBrokerInfo } from '../utilities/encryptionUtils';

// Define the shape of our broker information
export interface BrokerAuth {
  host: string;
  port: string;
  username?: string;
  password?: string;
  isConnected: boolean;
}

// Define the shape of our context
interface BrokerAuthContextType {
  brokerAuth: BrokerAuth;
  masterPassword: string;
  passwordDirty: boolean;
  setBrokerAuth: (auth: Partial<BrokerAuth>) => void;
  setMasterPassword: (password: string) => void;
  saveCredentials: () => Promise<boolean>;
  loadCredentials: () => Promise<boolean>;
  clearCredentials: () => void;
handlePasswordBlur: () => void;
}

// Create the context with default values
const BrokerAuthContext = createContext<BrokerAuthContextType>({
  brokerAuth: {
    host: '',
    port: '',
    username: '',
    password: '',
    isConnected: false,
  },
  masterPassword: '',
  passwordDirty: false,
  setBrokerAuth: () => {},
  setMasterPassword: () => {},
  saveCredentials: async () => false,
  loadCredentials: async () => false,
  clearCredentials: () => {},
  handlePasswordBlur: () => {},
});

// Custom hook to use the broker auth context
export const useBrokerAuth = () => useContext(BrokerAuthContext);

// Provide the broker auth context to the app
export const BrokerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brokerAuth, setBrokerAuthState] = useState<BrokerAuth>({
    host: '',
    port: '',
    username: '',
    password: '',
    isConnected: false,
  });

  const [masterPassword, setMasterPasswordState] = useState<string>('');
  const [passwordDirty, setPasswordDirty] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Update broker auth state
  const setBrokerAuth = (auth: Partial<BrokerAuth>) => {
    setBrokerAuthState(prev => ({ ...prev, ...auth }));
  };

  // Update master password and mark as dirty (changed but not yet validated)
  const setMasterPassword = (password: string) => {
    setMasterPasswordState(password);
    setPasswordDirty(true);
  };

  // Handle when password field loses focus - attempt credential load if dirty
  const handlePasswordBlur = () => {
    if (passwordDirty && masterPassword && !brokerAuth.host) {
      loadCredentials()
        .then(() => {
          setPasswordDirty(false); // Reset dirty flag after attempt
        })
        .catch(error => {
          console.error('Error loading credentials on blur:', error);
        });
    }
  };

  // Save credentials to local storage with encryption
  const saveCredentials = async (): Promise<boolean> => {
    if (!masterPassword) {
      messageApi.warning('Master password required for saving credentials');
      return false;
    }

    if (!brokerAuth.host || !brokerAuth.port) {
      messageApi.error('Host and port are required');
      return false;
    }

    try {
      await saveBrokerInfo({
        host: brokerAuth.host,
        port: brokerAuth.port,
        username: brokerAuth.username,
        password: brokerAuth.password,
      }, masterPassword);

      messageApi.success('Broker credentials saved securely');
      return true;
    } catch (error) {
      console.error('Failed to save broker credentials:', error);
      messageApi.error('Failed to save broker credentials');
      return false;
    }
  };

  // Load credentials from local storage with decryption
  const loadCredentials = async (): Promise<boolean> => {
    if (!masterPassword) {
      messageApi.warning('Master password required for loading credentials');
      return false;
    }

    try {
      const info = await getBrokerInfo(masterPassword);
      if (info) {
        setBrokerAuthState(prev => ({
          ...prev,
          host: info.host,
          port: info.port,
          username: info.username || '',
          password: info.password || '',
        }));

        messageApi.success('Broker credentials loaded successfully');
        return true;
      } else {
        messageApi.info('No stored broker credentials found');
        return false;
      }
    } catch (error) {
      console.error('Failed to load broker credentials:', error);
      messageApi.error('Incorrect master password or no saved data');
      return false;
    }
  };

  // Clear credentials from state (not from storage)
  const clearCredentials = () => {
    setBrokerAuthState({
      host: '',
      port: '',
      username: '',
      password: '',
      isConnected: false,
    });
    setMasterPasswordState('');
    setPasswordDirty(false);
    messageApi.info('Broker credentials cleared');
  };

  // Remove the automatic credential loading effect
  // Only load credentials when the password field loses focus

  const value = {
    brokerAuth,
    masterPassword,
    passwordDirty,
    setBrokerAuth,
    setMasterPassword,
    saveCredentials,
    loadCredentials,
    clearCredentials,
    handlePasswordBlur,
  };

  return (
    <BrokerAuthContext.Provider value={value}>
      {children}
    </BrokerAuthContext.Provider>
  );
};
