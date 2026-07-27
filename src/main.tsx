
  import { createRoot } from "react-dom/client";
  import { PostHogProvider } from "posthog-js/react";
  import App from "./app/App.tsx";
  import { posthog, initAnalytics } from "./lib/analytics.ts";
  import "./styles/index.css";

  // Initialise PostHog before render (no-op if VITE_POSTHOG_KEY is unset).
  initAnalytics();

  createRoot(document.getElementById("root")!).render(
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  );
