import { createContext, useContext, useState, ReactNode } from 'react';

interface SensorPreferencesContextType {
  useWeather: boolean;
  setUseWeather: (value: boolean) => void;
  useTime: boolean;
  setUseTime: (value: boolean) => void;
}

const defaultContextValue: SensorPreferencesContextType = {
  useWeather: true,
  setUseWeather: () => { },
  useTime: true,
  setUseTime: () => { },
};

const SensorPreferencesContext = createContext<SensorPreferencesContextType>(defaultContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export const useSensorPreferences = () => useContext(SensorPreferencesContext);

export const SensorPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [useWeather, setUseWeather] = useState(true);
  const [useTime, setUseTime] = useState(true);

  return (
    <SensorPreferencesContext.Provider
      value={{
        useWeather,
        setUseWeather,
        useTime,
        setUseTime,
      }}
    >
      {children}
    </SensorPreferencesContext.Provider>
  );
};
