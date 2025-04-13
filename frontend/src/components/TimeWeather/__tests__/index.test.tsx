import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeWeather from '../index';
import * as utils from '../../../utilities/utils';

// Mock the utility functions
vi.mock('../../../utilities/utils', () => ({
  // Fix lint errors by removing unused parameters from the mock functions
  getMusicWeather: vi.fn((weather) => weather),
  getMusicTime: vi.fn((time) => time),
  getTimeUsingTimezone: vi.fn(() => new Date('2023-04-13T12:00:00')),
  calculateSunPosition: vi.fn(() => 0),
  getDayOrNight: vi.fn(() => 'day'),
  convertTemp: vi.fn((temp) => temp)
}));

// Mock the images to avoid issues with asset imports
vi.mock('../../../assets/icons/sun.png', () => ({
  default: 'sun-icon-path'
}));
vi.mock('../../../assets/icons/moon.png', () => ({
  default: 'moon-icon-path'
}));
vi.mock('../../../assets/icons/brightness.png', () => ({
  default: 'brightness-icon-path'
}));
vi.mock('../../../assets/icons/storm.png', () => ({
  default: 'storm-icon-path'
}));
vi.mock('../../../assets/icons/snowflakes.png', () => ({
  default: 'snowflakes-icon-path'
}));
vi.mock('../../../assets/icons/unknown.png', () => ({
  default: 'unknown-icon-path'
}));
vi.mock('../../../assets/icons/lightsensor.png', () => ({
  default: 'lightsensor-icon-path'
}));
vi.mock('../../../assets/icons/clocktime.png', () => ({
  default: 'clocktime-icon-path'
}));
vi.mock('../../../assets/icons/temperature.png', () => ({
  default: 'temperature-icon-path'
}));
vi.mock('../../../assets/icons/precipitation.png', () => ({
  default: 'precipitation-icon-path'
}));

// Mock directly in the component instead of mocking the hook
vi.mock('../../../contexts/SensorPreferencesContext', () => ({
  SensorPreferencesProvider: ({ children }: { children: React.ReactNode }) => children,
  useSensorPreferences: () => ({
    useWeather: true,
    setUseWeather: vi.fn(),
    useTime: true,
    setUseTime: vi.fn()
  })
}));

// Mock Ant Design's Popover component
vi.mock('antd', async () => {
  const antd = await vi.importActual('antd');
  return {
    ...antd,
    Popover: ({ children }: { children: React.ReactNode }) => children, // Simple mock that just renders children
  };
});

describe('TimeWeather Component', () => {
  const defaultProps = {
    piWeather: 'none',
    piTime: 'day',
    piTemperature: '25',
    piLightLevel: '80',
    piTimezone: 'America/New_York',
    piSunrise: '06:00',
    piSunset: '18:00',
    isAuto: true,
    setIsAuto: vi.fn(),
    setManualWeather: vi.fn(),
    setManualTime: vi.fn(),
  };

  // Fix for Date.now is not a function
  const realDateNow = Date.now;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore and mock Date.now
    Date.now = vi.fn(() => 1649853600000); // 2022-04-13T12:00:00Z
  });
  
  afterEach(() => {
    // Restore the original implementation
    Date.now = realDateNow;
  });

  it('renders time and weather information', () => {
    render(<TimeWeather {...defaultProps} />);
    
    // Check that temperature is displayed
    expect(screen.getByText(/25/i)).toBeInTheDocument();
    
    // Auto mode button should be visible
    const autoButton = screen.getByText('AUTO');
    expect(autoButton).toBeInTheDocument();
  });

  it('toggles mode when auto button is clicked', () => {
    render(<TimeWeather {...defaultProps} />);
    
    // Find and click the auto mode button
    const autoButton = screen.getByText('AUTO');
    fireEvent.click(autoButton);
    
    // The setIsAuto function should have been called
    expect(defaultProps.setIsAuto).toHaveBeenCalledWith(false);
  });

  it('displays different UI elements in manual mode', () => {
    // Render with manual mode enabled
    render(<TimeWeather {...defaultProps} isAuto={false} />);
    
    // Manual mode button should be visible
    const manualButton = screen.getByText('MANUAL');
    expect(manualButton).toBeInTheDocument();
  });

  it('calls setManualWeather when weather is clicked in manual mode', () => {
    render(<TimeWeather {...defaultProps} isAuto={false} />);
    
    // Since we're mocking getMusicWeather to return the first arg (piWeather),
    // and our default props has piWeather: 'none',
    // we should find 'Sunny' as the alt text
    const weatherIcon = screen.getByAltText('Sunny');
    fireEvent.click(weatherIcon);
    
    // The function should be called to toggle weather
    expect(defaultProps.setManualWeather).toHaveBeenCalled();
  });

  it('doesnt call setManualWeather when weather is clicked in auto mode', () => {
    render(<TimeWeather {...defaultProps} />);
    
    const weatherIcon = screen.getByAltText('Sunny');
    fireEvent.click(weatherIcon);
    
    // The function should NOT be called in auto mode
    expect(defaultProps.setManualWeather).not.toHaveBeenCalled();
  });

  it('renders the correct time in the clock', () => {
    // Create a fixed time
    const mockTime = new Date('2023-04-13T12:30:00');
    
    // Use spyOn instead of mockImplementation for more control
    vi.spyOn(global, 'Date')
      .mockImplementation(() => mockTime);

    render(<TimeWeather {...defaultProps} />);
    
    // Since the text might be broken up by spans, use a more flexible approach
    // to find the digital time text by using the class name
    const digitalTimeText = document.querySelector('.digitalTimeText');
    expect(digitalTimeText).toBeInTheDocument();
    expect(digitalTimeText?.textContent).toContain('12');
    expect(digitalTimeText?.textContent).toContain('30');
    
    // Clean up
    vi.restoreAllMocks();
  });

  it('correctly shows sun icon for day time', () => {
    // Mock the getMusicTime to return 'day'
    vi.mocked(utils.getMusicTime).mockReturnValue('day');
    
    render(<TimeWeather {...defaultProps} />);
    
    // Check that the sun icon is displayed
    expect(screen.getByAltText('AM')).toBeInTheDocument();
  });

  it('correctly shows moon icon for night time', () => {
    // Mock the getMusicTime to return 'night'
    vi.mocked(utils.getMusicTime).mockReturnValue('night');
    
    render(<TimeWeather {...defaultProps} piTime="night" />);
    
    // Check that the moon icon is displayed
    expect(screen.getByAltText('PM')).toBeInTheDocument();
  });
});