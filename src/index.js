import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'react-notifications/lib/notifications.css';
import CAIA from "./App";

//Hello World

const Root = () => (
        <BrowserRouter>
            <CAIA/>
        </BrowserRouter>
)

ReactDOM.render(<Root />, document.getElementById('root'));
