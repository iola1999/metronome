import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// 注册 Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((registration) =>
        console.log("ServiceWorker 注册成功", registration)
      )
      .catch((error) => console.log("ServiceWorker 注册失败:", error));
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
