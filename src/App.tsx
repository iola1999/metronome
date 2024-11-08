import { ThemeProvider } from '@emotion/react';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { StyledContainer } from './styles/components';
import { Metronome } from './components/Metronome';
import { RecordingManager } from './components/RecordingManager';
import { useState } from 'react';

export const App = () => {
  const [metronomeIsPlaying, setMetronomeIsPlaying] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <StyledContainer theme={theme}>
        <Metronome 
          isPlaying={metronomeIsPlaying} 
          onPlayingChange={setMetronomeIsPlaying} 
        />
        <RecordingManager 
          onPlaybackStart={() => setMetronomeIsPlaying(false)} 
        />
      </StyledContainer>
    </ThemeProvider>
  );
};
