import { ThemeProvider } from "@emotion/react";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { StyledContainer } from "./styles/components";
import { Metronome } from "./components/Metronome";
import { RecordingManager } from "./components/RecordingManager";
import { useState, lazy, Suspense, useTransition } from "react";
import { SettingsButton } from "./components/SettingsButton";
import { Settings } from "./components/Settings";

// 懒加载 MessageContainer
const MessageContainer = lazy(() => import("./components/MessageContainer"));

export const App = () => {
  const [isPending, startTransition] = useTransition();
  const [metronomeIsPlaying, setMetronomeIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handlePlaybackStart = () => {
    startTransition(() => {
      if (metronomeIsPlaying) {
        setMetronomeIsPlaying(false);
      }
    });
  };

  const handleSettingsToggle = (show: boolean) => {
    startTransition(() => {
      setShowSettings(show);
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <StyledContainer theme={theme}>
        <Metronome
          isPlaying={metronomeIsPlaying}
          onPlayingChange={(playing) => {
            startTransition(() => {
              setMetronomeIsPlaying(playing);
            });
          }}
        />
        <RecordingManager onPlaybackStart={handlePlaybackStart} />
      </StyledContainer>
      <SettingsButton onClick={() => handleSettingsToggle(true)} />
      <Settings
        isOpen={showSettings}
        onClose={() => handleSettingsToggle(false)}
      />
      <Suspense fallback={null}>
        <MessageContainer />
      </Suspense>
    </ThemeProvider>
  );
};
