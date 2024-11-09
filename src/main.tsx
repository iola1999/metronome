// 只保留 Service Worker 注册逻辑
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
