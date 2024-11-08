import { ThemeProvider } from '@emotion/react';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { StyledContainer } from './styles/components';
import { Metronome } from './components/Metronome';
import { RecordingManager } from './components/RecordingManager';
import { useState } from 'react';
import { SettingsButton } from './components/SettingsButton';
import { Settings } from './components/Settings';

export const App = () => {
  const [metronomeIsPlaying, setMetronomeIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handlePlaybackStart = () => {
    if (metronomeIsPlaying) {
      setMetronomeIsPlaying(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <StyledContainer theme={theme}>
        <Metronome 
          isPlaying={metronomeIsPlaying} 
          onPlayingChange={setMetronomeIsPlaying} 
        />
        <RecordingManager 
          onPlaybackStart={handlePlaybackStart} 
        />
      </StyledContainer>
      <SettingsButton onClick={() => setShowSettings(true)} />
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </ThemeProvider>
  );
};
