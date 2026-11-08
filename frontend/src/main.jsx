import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { store } from "../common/Store";
import "antd/dist/reset.css";
import { Provider } from "react-redux";
import CommonRoutes from "../common/CommonRoutes";
import "../common/CommonStyle.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <CommonRoutes />
    </Provider>
    
  </GoogleOAuthProvider>,
);
