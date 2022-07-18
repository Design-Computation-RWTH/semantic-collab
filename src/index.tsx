import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-notifications/lib/notifications.css";
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
} from "@mantine/core";
import { useLocalStorage } from '@mantine/hooks';
import { NotificationsProvider } from "@mantine/notifications";
import ViewerProvider from "./context/dcwebviewerContext";
import BcfOWLProvider from "./context/bcfOWLservercontext";
import { ModalsProvider } from "@mantine/modals";
import CAIA from "./App";

const Root = () => {
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
      key: 'mantine-color-scheme',
      defaultValue: 'dark',
      getInitialValueInEffect: true,
    });

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <NotificationsProvider>
        <BcfOWLProvider>
          <ViewerProvider>
            <MantineProvider
              theme={{colorScheme: colorScheme}} withGlobalStyles withNormalizeCSS
            >
              <ModalsProvider>
                <React.StrictMode>
                  <BrowserRouter>
                    <CAIA />
                  </BrowserRouter>
                </React.StrictMode>
              </ModalsProvider>
            </MantineProvider>
          </ViewerProvider>
        </BcfOWLProvider>
      </NotificationsProvider>
   </ColorSchemeProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));
