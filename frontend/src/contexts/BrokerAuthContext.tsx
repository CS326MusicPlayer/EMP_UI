// Broker authentication context (written with the help of Copilot)

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  setBrokerAuth: (auth: Partial<BrokerAuth>) => void;
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
  setBrokerAuth: () => {}
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


  // Update broker auth state
  const setBrokerAuth = (auth: Partial<BrokerAuth>) => {
    setBrokerAuthState(prev => ({ ...prev, ...auth }));
  };


  const value = {
    brokerAuth,
    setBrokerAuth,
  };

  return (
    <BrokerAuthContext.Provider value={value}>
      {children}
    </BrokerAuthContext.Provider>
  );
};
