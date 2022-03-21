import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'react-notifications/lib/notifications.css';
import {MantineProvider , ColorSchemeProvider, ColorScheme} from "@mantine/core";
import {ModalsProvider} from "@mantine/modals";
import CAIA from "./App";

const Root = () => {

    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{
                colorScheme,
                primaryColor: colorScheme === "light" ? "dark" : "gray",
                fontFamily: 'Verdana, sans-serif',
                spacing: { xs: 15, sm: 20, md: 25, lg: 30, xl: 40 },
            }}>
                <ModalsProvider>
                    <BrowserRouter>
                        <CAIA/>
                    </BrowserRouter>
                </ModalsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    )
}


ReactDOM.render(<Root />, document.getElementById('root'));
