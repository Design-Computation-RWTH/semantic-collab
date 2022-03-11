import Cookies from 'js-cookie'
import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {ReactSession} from 'react-client-session';
import {NotificationManager} from "react-notifications";

const base_uri = "https://caia.herokuapp.com";

async function doLogin(login, password) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    console.log("login: "+login);
    let raw = JSON.stringify({
        "id": login,
        "password": password
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    await fetch(base_uri+"/bcf/3.0/auth/login", requestOptions)
        .then(response => response.json())
        .then(result =>
        {
            if(result.token)
            {
            Cookies.set('access_token',result.token);
            Cookies.set('refresh_token',result.token);

            window.location.replace(
                `${"/projects"}`
            )
            NotificationManager.success("logged in", "Successful Login");
            }
        }
        )
        .catch(error => {
                console.log('error', error);
        }
        );
}


class Login extends React.Component{
    handleSubmit(event) {
        event.preventDefault();
        ReactSession.set("username", event.target.formLoginEmail.value);
        doLogin(event.target.formLoginEmail.value,event.target.formPassword.value)
    }
    render() {
        return <div class="caia-fill">
            <div class="caia-center">
                <div class="caia-outline">
                    <Form class="caia-center" onSubmit={this.handleSubmit} >
                        <Form.Group className="mb-3"  controlId="formLoginEmail">
                            <Form.Label>E-Mail</Form.Label>
                            <Form.Control type="text" placeholder="Enter your email address" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="btn-caia">
                            Submit
                        </Button>
                        <Button variant="primary" type="submit" className="btn-caia">
                            Register
                        </Button>
                    </Form>
                </div>
        </div>
    </div>;
    }
}


export default Login;