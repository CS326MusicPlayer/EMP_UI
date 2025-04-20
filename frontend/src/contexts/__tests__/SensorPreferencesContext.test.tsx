// Test for SensorPreferencesContext (written with the help of CoPilot)
// Daniel Kim (jk254), Jason Chew (jgc23)

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SensorPreferencesProvider, useSensorPreferences } from '../SensorPreferencesContext';

describe('SensorPreferencesContext', () => {
  it('provides default values', () => {
    const { result } = renderHook(() => useSensorPreferences(), {
      wrapper: ({ children }) => <SensorPreferencesProvider>{children}</SensorPreferencesProvider>
    });
    
    // Check initial values (defaults to true)
    expect(result.current.useWeather).toBe(true);
    expect(result.current.useTime).toBe(true);
  });
  
  it('updates useWeather preference', () => {
    const { result } = renderHook(() => useSensorPreferences(), {
      wrapper: ({ children }) => <SensorPreferencesProvider>{children}</SensorPreferencesProvider>
    });
    
    // Toggle useWeather from true to false
    act(() => {
      result.current.setUseWeather(false);
    });
    
    // Check if state updated correctly
    expect(result.current.useWeather).toBe(false);
  });
  
  it('updates useTime preference', () => {
    const { result } = renderHook(() => useSensorPreferences(), {
      wrapper: ({ children }) => <SensorPreferencesProvider>{children}</SensorPreferencesProvider>
    });
    
    // Toggle useTime from true to false
    act(() => {
      result.current.setUseTime(false);
    });
    
    // Check if state updated correctly
    expect(result.current.useTime).toBe(false);
  });
  
  it('allows toggling preferences multiple times', () => {
    const { result } = renderHook(() => useSensorPreferences(), {
      wrapper: ({ children }) => <SensorPreferencesProvider>{children}</SensorPreferencesProvider>
    });
    
    // Series of toggles for useWeather
    act(() => {
      result.current.setUseWeather(false);
    });
    expect(result.current.useWeather).toBe(false);
    
    act(() => {
      result.current.setUseWeather(true);
    });
    expect(result.current.useWeather).toBe(true);
    
    // Series of toggles for useTime
    act(() => {
      result.current.setUseTime(false);
    });
    expect(result.current.useTime).toBe(false);
    
    act(() => {
      result.current.setUseTime(true);
    });
    expect(result.current.useTime).toBe(true);
  });
});