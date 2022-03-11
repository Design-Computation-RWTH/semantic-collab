import "./App.css";
import React from "react";

import { Route, Routes } from "react-router-dom";

import { ReactSession } from "react-client-session";

import Cookies from "js-cookie";
import PubSub from "pubsub-js";

import Login from "./services/Login";
import AuthenticatedRoute from "./services/Authentication";
import { Logout, id, parseJWT } from "./services/AuthenticationUtils";

import ProjectListView from "./pages/ProjectsView";
import AdvancedView from "./pages/AdvancedView";

import SetupView from "./pages/SetupsView";
import XeoKitView from "./components/Viewport/XeoKitView";

import NavBrand from "./components/Navigation/NavBrand";
import Footer from "./components/Navigation/Footer";

import {NotificationContainer, NotificationManager} from 'react-notifications';

import { useNavigate } from 'react-router-dom';


export const getAccessToken = () => Cookies.get("access_token");

let caia_app = null;
let caia_notifications = [];

// To be able to load static files like web-ifc.wasm
const reload = () => window.location.reload();

export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const navigate = useNavigate();

    return (
        <Component
            navigate={navigate}
            {...props}
        />
    );
  };

  return Wrapper;
};

class CAIA extends React.Component {
  constructor() {
    super();
    caia_app = this;
    ReactSession.setStoreType("sessionStorage");
    console.log("CAIA this: " + id(this));

    this.un_subProjects_token = PubSub.subscribe(
      "ProjectName",
      this.subProjects
    );
    this.un_subNotifications_token = PubSub.subscribe(
      "Update",
      this.subUpdates
    );
    this.un_subSidebarName_token = PubSub.subscribe(
      "SidebarName",
      this.subSidebar
    );
    this.un_subCloseMenu_token = PubSub.subscribe(
      "CloseMenu",
      this.subCloseMenu
    );

    this.un_subAlert = PubSub.subscribe("Alert", this.subAlert.bind(this))

    let initial_pname = "";
    let initial_sidbarname = "Overview";
    let initial_menustate = false;
    if (ReactSession.get("projectname")) {
      initial_pname = ReactSession.get("projectname");
      initial_menustate = true;
    }
    this.state = {
      projectName: initial_pname,
      notifications: [],
      sidebarName: initial_sidbarname,
      projectSelected: initial_menustate,
    };
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.un_subProjects_token);
    PubSub.unsubscribe(this.un_subNotifications_token);
    PubSub.unsubscribe(this.un_subSidebarName_token);
    PubSub.unsubscribe(this.un_subCloseMenu_token);
    PubSub.unsubscribe(this.un_subAlert);
  }

  componentWillMount(){
    document.body.style.overflow = "clip";
  }

  closeToast(message) {
    caia_notifications = caia_notifications.filter((e) => e !== message);
    caia_app.setState({ notifications: caia_notifications });
  }

  // subCloseMenu(msg, data) {
  //   ReactSession.remove("projectname");
  //   caia_app.setState({ projectSelected: false });
  // }

  createNotification = (type) => {
    return () => {
      switch (type) {
        case 'info':
          NotificationManager.info('Info message');
          break;
        case 'success':
          NotificationManager.success('Success message', 'Title here');
          break;
        case 'warning':
          NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);
          break;
        case 'error':
          NotificationManager.error('Error message', 'Click me!', 5000, () => {
            alert('callback');
          });
          break;
        default:
          break;
      }
    };
  };

  subAlert(msg, data) {
    switch (data.type) {
      case 'info':
        NotificationManager.info(data.message);
        break;
      case 'success':
        NotificationManager.success(data.message, data.title);
        break;
      case 'warning':
        NotificationManager.warning(data.message, data.title, 3000);
        break;
      case 'error':
        NotificationManager.error('Error message', 'Click me!', 5000, () => {
          alert('callback');
        });
        break;
      default:
        break;
    }
  }

  subProjects(msg, data) {
    console.log("logout?")
    caia_app.setState({ projectName: data.name });
    ReactSession.set("projectname", data.name);
    caia_notifications = caia_notifications.filter(
      (e) => e !== "Select a project"
    );
    caia_app.setState({ notifications: caia_notifications });
    caia_app.setState({ projectSelected: true });
  }

  subUpdates(msg, data) {
    if (caia_notifications.length > 2) caia_notifications = [];
    caia_notifications = caia_notifications.concat(data.txt);
    caia_app.setState({ notifications: caia_notifications });
  }

  subSidebar(msg, data) {
    caia_app.setState({ sidebarName: data.name });
  }

  render() {
/*    const toasts_list = this.state.notifications
      .filter((m) => m)
      .map((message) => {
        return (
          <Col md={4} className="mb-2">
            <Toast onClose={(e) => this.closeToast(message)}>
              <Toast.Header>
                <img
                  src="holder.js/20x20?text=%20"
                  className="rounded me-2"
                  alt=""
                />
                <strong className="me-auto">Info</strong>
                <small />
              </Toast.Header>
              <Toast.Body>{message}</Toast.Body>
            </Toast>
          </Col>
        );
      });*/

    if (getAccessToken()) {
      let token = parseJWT(getAccessToken());
      this.name = token.name;
      this.useruri = token.URI;
    } else this.name = "";
    return (
        <div className="main">
          <header className="header">
            <NavBrand
                //TODO: Fix ID
                project={{projectName: this.state.projectName, projectId: this.state.projectSelected}}
                user={this.name}
            />
          </header>
          <div
              aria-live="polite"
              aria-atomic="true"
              className="bg-light bg-gradient position-relative"
              style={{ minHeight: "0px" }}
          />
          <div className="workspace">
            <Routes class="workspace">
              <Route path="/login" element={<Login/>} />
              <Route path="/logout" element={<Logout/>} />
              <Route path="/projects/:id/setup" element={<SetupView/>} />
              <Route path="/projects/:id/" element={
                <div className="caia-fill">
                  <XeoKitView class="viewport" id={"MyViewport"}/>
                </div>}
              />
              <Route
                path="/projects"
                element={<ProjectListView/>}/>
              <Route path="/web-ifc.wasm" element={<reload/>} />
              <Route path="" element={<Login/>} />
            </Routes>
          </div>
          <Footer/>
          <NotificationContainer/>
        </div>

    );
  }

  componentDidMount() {
  }



}

export default withRouter(CAIA);
