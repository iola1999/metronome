import { ThemeProvider } from "@emotion/react";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { StyledContainer } from "./styles/components";
import { Metronome } from "./components/Metronome";
import { RecordingManager } from "./components/RecordingManager";
import { useState, lazy, Suspense, useTransition, useEffect } from "react";
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

  useEffect(() => {
    // 检查是否支持 Service Worker
    if ('serviceWorker' in navigator) {
      // 注册更新检查的消息监听
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          // 显示更新提示
          if (confirm('发现新版本，是否刷新页面？')) {
            window.location.reload();
          }
        }
      });

      // 页面加载时检查更新
      const checkForUpdates = async () => {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage('CHECK_UPDATES');
      };

      checkForUpdates();
    }
  }, []);

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
