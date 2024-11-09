export default {
  presets: [
    [
      "@babel/preset-react",
      { runtime: "automatic", importSource: "@emotion/react" },
    ],
    "@babel/preset-typescript",
  ],
  plugins: [
    "@emotion/babel-plugin",
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: true,
        version: "^7.24.0",
        useESModules: true,
      },
    ],
  ],
};
