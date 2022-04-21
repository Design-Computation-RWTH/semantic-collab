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
  AccordionStylesParams,
  ButtonStylesParams,
} from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import ViewerProvider from "./context/dcwebviewerContext";
import { ModalsProvider } from "@mantine/modals";
import CAIA from "./App";

const Root = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <NotificationsProvider>
        <ViewerProvider>
          <MantineProvider
            theme={{
              colorScheme,
              colors: {
                // override dark colors to change them for all components
                dark: [
                  "#000000",
                  "#acaebf",
                  "#212121",
                  "#666980",
                  "#4d4f66",
                  "#e7effd",
                  "#868686",
                  "#363636",
                  "#01c0d21",
                  "#01010a",
                ],
              },
              primaryColor: colorScheme === "light" ? "dark" : "gray",
              fontFamily: "Verdana, sans-serif",
              spacing: { xs: 15, sm: 20, md: 25, lg: 30, xl: 40 },
            }}
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
      </NotificationsProvider>
    </ColorSchemeProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));
