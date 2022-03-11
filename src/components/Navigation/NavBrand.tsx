import logo from "../Branding/ContextAwareLogo_v2.svg";
import Navbar from "react-bootstrap/Navbar";
import PropTypes from 'prop-types';
import React from "react";
import Nav from "react-bootstrap/Nav";
// @ts-ignore
import PubSub from "pubsub-js";
import Cookies from "js-cookie";

// Tutorial: https://dev.to/stephanieopala/simple-navigation-bar-in-react-js-4d5m
// Navlink --> PubSub?
// Split Page up in Components! Test Components in Storybook

type NavBrandProp = {
    project: {
        projectName: string,
        projectId: string,
    },
    user: string
}

export default function NavBrand(props: NavBrandProp) {

    function Logout() {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        PubSub.publish("ProjectName", {name: null})
    }

    function Navlinks(props: { projectName: any; }) {
        if (props.projectName) {
            return (
                <div className="navbar-links">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="test">
                        <Nav>
                            <a className="navbar-text-links" href={`/projects/${props.projectName}/overview`}>Overview</a>
                            <a className="navbar-text-links" href={`/projects/${props.projectName}/setup`}>Setup</a>
                        </Nav>
                    </Navbar.Collapse>
                </div>
            )
        } else {
            return (
                <span></span>
            )
        }
    }

    function LoggedStatus(props: { user: any; }) {
        if (props.user) {
            return (
                <div className="navbar-logout">
                    <Navbar.Collapse>
                        <Navbar.Text className="navbar-text">
                            {props.user}, <a href="/" onClick={() => {
                            Logout()
                        }
                        }>logout </a>
                        </Navbar.Text>
                    </Navbar.Collapse>
                </div>
            )
        } else {
            return <span className="navbar-text"/>
        }
    }

    return (
        <Navbar variant="dark" expand="md" className="navbar-wrapper">
            <Navbar.Brand href="/projects" className="navbar-logo" onClick={() => {
                PubSub.publish("ProjectName", {name: null})
            }
            }>
                <img
                    src={logo}
                    width="316"
                    height="93"
                    className="d-inline-block align-content-center"
                    alt="CAIA Logo"
                />
                <Navbar.Collapse>
                    <Navbar.Text className="navbar-text-project">
                        {props.project.projectName}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar.Brand>
            <Navlinks projectName={props.project.projectName}/>
            <LoggedStatus user={props.user}/>
        </Navbar>
    )
}

NavBrand.propTypes = {
    project: PropTypes.shape({
        projectName: PropTypes.string,
        projectId: PropTypes.string,
    }),
    user: PropTypes.string
}