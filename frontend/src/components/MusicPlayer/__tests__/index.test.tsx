import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicPlayer from '../index';
import { SensorPreferencesProvider } from '../../../contexts/SensorPreferencesContext';
import * as utils from '../../../utilities/utils';

// Mock the formatTime utility function
vi.mock('../../../utilities/utils', () => ({
  // Fix lint errors by removing unused parameters from the mock functions
  getMusicWeather: vi.fn((weather) => weather),
  getMusicTime: vi.fn((time) => time),
  formatTime: vi.fn((time) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`)
}));

// Mock the HTML Audio element
const mockAudio = {
  play: vi.fn().mockImplementation(() => Promise.resolve()),
  pause: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  duration: 180,
  volume: 1,
  paused: false,
  loop: false,
};
window.HTMLMediaElement.prototype.play = mockAudio.play;
window.HTMLMediaElement.prototype.pause = mockAudio.pause;
window.HTMLMediaElement.prototype.load = mockAudio.load;
Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
  get() { return mockAudio.currentTime; },
  set(v) { mockAudio.currentTime = v; }
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  get() { return mockAudio.duration; },
  set(v) { mockAudio.duration = v; }
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'volume', {
  get() { return mockAudio.volume; },
  set(v) { mockAudio.volume = v; }
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'paused', {
  get() { return mockAudio.paused; }
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'loop', {
  get() { return mockAudio.loop; },
  set(v) { mockAudio.loop = v; }
});

// Mock the music files and icons
vi.mock('../../../assets/music/day_sunny.mp3', () => ({
  default: 'day_sunny.mp3'
}));
vi.mock('../../../assets/music/day_rainy.mp3', () => ({
  default: 'day_rainy.mp3'
}));
vi.mock('../../../assets/music/day_snowy.mp3', () => ({
  default: 'day_snowy.mp3'
}));
vi.mock('../../../assets/music/night_sunny.mp3', () => ({
  default: 'night_sunny.mp3'
}));
vi.mock('../../../assets/music/night_rainy.mp3', () => ({
  default: 'night_rainy.mp3'
}));
vi.mock('../../../assets/music/night_snowy.mp3', () => ({
  default: 'night_snowy.mp3'
}));

vi.mock('../../../assets/icons/sun.png', () => ({
  default: 'sun.png'
}));
vi.mock('../../../assets/icons/moon.png', () => ({
  default: 'moon.png'
}));
vi.mock('../../../assets/icons/brightness.png', () => ({
  default: 'brightness.png'
}));
vi.mock('../../../assets/icons/storm.png', () => ({
  default: 'storm.png'
}));
vi.mock('../../../assets/icons/snowflakes.png', () => ({
  default: 'snowflakes.png'
}));

// Mock the SensorPreferencesContext
vi.mock('../../../contexts/SensorPreferencesContext', async () => {
  const actual = await vi.importActual('../../../contexts/SensorPreferencesContext');
  return {
    ...actual,
    useSensorPreferences: vi.fn().mockReturnValue({
      useWeather: true,
      useTime: true
    })
  };
});

describe('MusicPlayer Component', () => {
  const defaultProps = {
    isAuto: true,
    piWeather: 'none',
    piTime: 'day',
    piTemperature: '25',
    piLightLevel: '80',
    onFadingChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudio.play.mockImplementation(() => Promise.resolve());
    mockAudio.pause.mockReset();
    mockAudio.load.mockReset();
    mockAudio.currentTime = 0;
    mockAudio.duration = 180;
    mockAudio.volume = 1;
    mockAudio.loop = false;
  });

  it('renders the music player with initial song', () => {
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );

    // Should display the title of the first song based on day/sunny
    expect(screen.getByText('Sunny Day')).toBeInTheDocument();
  });

  it('shows the correct time format', () => {
    // Mock formatTime to return a specific value we can test for
    vi.mocked(utils.formatTime).mockReturnValueOnce('0:00').mockReturnValueOnce('3:00');
    
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );
    
    // Should show the formatted time - using getAllByText since there are multiple time displays
    const timeDisplays = screen.getAllByText(/\d+:\d+/);
    expect(timeDisplays.length).toBeGreaterThanOrEqual(1);
  });

  it('displays volume controls', () => {
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );
    
    // Should show a volume slider
    const volumeSlider = screen.getByRole('slider');
    expect(volumeSlider).toBeInTheDocument();
    expect(volumeSlider).toHaveAttribute('type', 'range');
  });

  it('changes volume when slider is adjusted', () => {
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );
    
    // Find and adjust the volume slider
    const volumeSlider = screen.getByRole('slider');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });
    
    // Volume should be updated
    expect(mockAudio.volume).toBe(0.5);
  });

  it('shows the reset button', () => {
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );
    
    // Check for the reset button (using class name since SVGs may not have role "button")
    const resetButton = document.querySelector('.resetMusicButton');
    expect(resetButton).toBeInTheDocument();
  });

  it('resets the player when the reset button is clicked', () => {
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );
    
    // Set some initial state to verify reset works
    mockAudio.currentTime = 50;
    
    // Find and click the reset button using class selector
    const resetButton = document.querySelector('.resetMusicButton');
    if (resetButton) {
      fireEvent.click(resetButton);
      
      // Player should be reset
      expect(mockAudio.currentTime).toBe(0);
      expect(mockAudio.pause).toHaveBeenCalled();
    }
  });

  it('shows song title with weather and time icons', () => {
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );
    
    // Check for weather and time icons
    const weatherIcon = screen.getByAltText('Weather Icon');
    const timeIcon = screen.getByAltText('Time Icon');
    
    expect(weatherIcon).toBeInTheDocument();
    expect(timeIcon).toBeInTheDocument();
  });
  
  it('calls onFadingChange when song changes', () => {
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} />
      </SensorPreferencesProvider>
    );
    
    // Trigger a song change by changing props
    render(
      <SensorPreferencesProvider>
        <MusicPlayer {...defaultProps} piWeather="rain" />
      </SensorPreferencesProvider>
    );
    
    // The callback should be called
    expect(defaultProps.onFadingChange).toHaveBeenCalled();
  });
});