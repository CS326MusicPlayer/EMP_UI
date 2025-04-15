import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { saveBrokerInfo, getBrokerInfo } from '../utilities/encryptionUtils';

// Define the shape of our broker information
export interface BrokerAuth {
  host: string;
  port: number;
  username?: string;
  password?: string;
  isConnected: boolean;
}

// Define the shape of our context
interface BrokerAuthContextType {
  brokerAuth: BrokerAuth;
  masterPassword: string;
  setBrokerAuth: (auth: Partial<BrokerAuth>) => void;
  setMasterPassword: (password: string) => void;
  saveCredentials: () => Promise<boolean>;
  loadCredentials: () => Promise<boolean>;
  clearCredentials: () => void;
}

// Create the context with default values
const BrokerAuthContext = createContext<BrokerAuthContextType>({
  brokerAuth: {
    host: '',
    port: 1883,
    username: '',
    password: '',
    isConnected: false,
  },
  masterPassword: '',
  setBrokerAuth: () => {},
  setMasterPassword: () => {},
  saveCredentials: async () => false,
  loadCredentials: async () => false,
  clearCredentials: () => {},
});

// Custom hook to use the broker auth context
export const useBrokerAuth = () => useContext(BrokerAuthContext);

// Provide the broker auth context to the app
export const BrokerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brokerAuth, setBrokerAuthState] = useState<BrokerAuth>({
    host: '',
    port: 1883,
    username: '',
    password: '',
    isConnected: false,
  });

  const [masterPassword, setMasterPasswordState] = useState<string>('');

  // Update broker auth state
  const setBrokerAuth = (auth: Partial<BrokerAuth>) => {
    setBrokerAuthState(prev => ({ ...prev, ...auth }));
  };

  // Update master password
  const setMasterPassword = (password: string) => {
    setMasterPasswordState(password);
  };

  // Save credentials to local storage with encryption
  const saveCredentials = async (): Promise<boolean> => {
    if (!masterPassword) {
      message.warning('Master password required for saving credentials');
      return false;
    }

    if (!brokerAuth.host || !brokerAuth.port) {
      message.error('Host and port are required');
      return false;
    }

    try {
      await saveBrokerInfo({
        host: brokerAuth.host,
        port: brokerAuth.port,
        username: brokerAuth.username,
        password: brokerAuth.password,
      }, masterPassword);

      message.success('Broker credentials saved securely');
      return true;
    } catch (error) {
      console.error('Failed to save broker credentials:', error);
      message.error('Failed to save broker credentials');
      return false;
    }
  };

  // Load credentials from local storage with decryption
  const loadCredentials = async (): Promise<boolean> => {
    if (!masterPassword) {
      message.warning('Master password required for loading credentials');
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

        message.success('Broker credentials loaded successfully');
        return true;
      } else {
        message.info('No stored broker credentials found');
        return false;
      }
    } catch (error) {
      console.error('Failed to load broker credentials:', error);
      message.error('Incorrect master password or no saved data');
      return false;
    }
  };

  // Clear credentials from state (not from storage)
  const clearCredentials = () => {
    setBrokerAuthState({
      host: '',
      port: 1883,
      username: '',
      password: '',
      isConnected: false,
    });
    setMasterPasswordState('');
    message.info('Broker credentials cleared');
  };

  // Try to load credentials when master password changes
  useEffect(() => {
    if (masterPassword && !brokerAuth.host) {
      loadCredentials().catch(console.error);
    }
  }, [masterPassword]);

  const value = {
    brokerAuth,
    masterPassword,
    setBrokerAuth,
    setMasterPassword,
    saveCredentials,
    loadCredentials,
    clearCredentials,
  };

  return (
    <BrokerAuthContext.Provider value={value}>
      {children}
    </BrokerAuthContext.Provider>
  );
};