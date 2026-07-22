import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";

import App from "./App.jsx";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider
        clientId={googleClientId}
      >
        {app}
      </GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);
