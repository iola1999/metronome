import { Global, css } from "@emotion/react";
import type { Theme } from "./theme";

export const GlobalStyles = ({ theme }: { theme: Theme }) => (
  <Global
    styles={css`
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version */
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        min-height: -webkit-fill-available;
        background-color: ${theme.colors.background};
        color: ${theme.colors.primary};
        overflow: hidden;
        touch-action: none;
        position: fixed;
        width: 100%;
        height: 100%;
        padding-top: 0;
        overscroll-behavior: none;
        -webkit-overflow-scrolling: none;
      }

      html {
        height: -webkit-fill-available;
        background-color: ${theme.colors.background};
      }

      button {
        cursor: pointer;
        border: none;
        background: none;
        font-family: inherit;
      }

      input {
        font-family: inherit;
      }
    `}
  />
);
