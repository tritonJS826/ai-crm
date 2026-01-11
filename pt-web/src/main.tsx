
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {Provider as JotaiProvider} from "jotai";
import {App} from "src/App";
import "src/styles/main.scss";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element \"#root\" not found");
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </BrowserRouter>
  </StrictMode>,
);
