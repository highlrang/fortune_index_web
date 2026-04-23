import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

function applyNativeWebViewClass() {
  const userAgent = window.navigator.userAgent;

  if (!userAgent.includes("MY_APP")) return;

  const root = document.documentElement;
  const body = document.body;
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  root.classList.add("is-native-webview");
  body.classList.add("is-native-webview");
  root.classList.toggle("is-native-android", isAndroid);
  body.classList.toggle("is-native-android", isAndroid);
  root.classList.toggle("is-native-ios", isIOS);
  body.classList.toggle("is-native-ios", isIOS);
}

applyNativeWebViewClass();

createRoot(document.getElementById("root")!).render(<App />);
