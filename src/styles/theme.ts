export const theme = {
  colors: {
    primary: '#2d3436',
    accent: '#0984e3',
    background: '#dfe6e9',
    surface: '#ffffff',
    error: '#ff3b30',
    success: '#34c759',
    warning: '#ff9500'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
    md: '0 5px 15px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.1)'
  },
  transitions: {
    default: 'all 0.2s ease',
    slow: 'all 0.3s ease'
  }
};

export type Theme = typeof theme; 