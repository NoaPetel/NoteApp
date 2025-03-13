import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Authenticator } from "@aws-amplify/ui-react";
import { createGlobalStyle } from "styled-components";
import "@aws-amplify/ui-react/styles.css";

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure({
  ...amplifyConfig,
  API: {
    ...amplifyConfig.API,
    REST: outputs.custom.API,
  },
});

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    {/* <React.StrictMode> */}
    <GlobalStyle />
    <Authenticator>
      <App />
    </Authenticator>
    {/* </React.StrictMode> */}
  </>
);
