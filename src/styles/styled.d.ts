import "@emotion/react";
import { theme } from "./theme";

declare module "@emotion/react" {
  export interface Theme {
    colors: {
      primary: string;
      accent: string;
      background: string;
      surface: string;
      error: string;
      success: string;
      warning: string;
      text: string;
      border: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    transitions: {
      default: string;
      slow: string;
    };
  }
}
