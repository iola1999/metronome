import { useState, useEffect } from "react";
import { registerSW } from "virtual:pwa-register";
import {
  UpdatePromptContainer,
  UpdateMessage,
  ButtonGroup,
  UpdateButton,
} from "../styles/components/UpdatePromptStyles";

export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });

    window.updateSW = updateSW;
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      <UpdatePromptContainer visible={needRefresh || offlineReady}>
        {offlineReady && (
          <>
            <UpdateMessage>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              应用已可离线使用
            </UpdateMessage>
            <ButtonGroup>
              <UpdateButton onClick={close}>知道了</UpdateButton>
            </ButtonGroup>
          </>
        )}
        {needRefresh && (
          <>
            <UpdateMessage>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              发现新版本
            </UpdateMessage>
            <ButtonGroup>
              <UpdateButton variant="secondary" onClick={close}>
                稍后
              </UpdateButton>
              <UpdateButton
                variant="primary"
                onClick={() => window.updateSW?.(true)}
              >
                立即更新
              </UpdateButton>
            </ButtonGroup>
          </>
        )}
      </UpdatePromptContainer>
    </>
  );
}
