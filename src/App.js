import "./App.css";
import React from "react";

import { Route, Routes } from "react-router-dom";

import { ReactSession } from "react-client-session";

import Cookies from "js-cookie";
import PubSub from "pubsub-js";

import { BsFillPuzzleFill, BsGearWideConnected, BsHouse } from "react-icons/bs";
import logo from "./components/Branding/Icon_v2.svg";

import Login from "./services/Login";
import { Logout, id, parseJWT } from "./services/AuthenticationUtils";

import ProjectListView from "./pages/ProjectsView";

import SetupView from "./pages/SetupsView";
import XeoKitView from "./components/Viewport/XeoKitViewFunction";

import { NotificationManager } from "react-notifications";

import { useNavigate } from "react-router-dom";
import { AppShell, Header, Navbar, Space, Text } from "@mantine/core";

export const getAccessToken = () => Cookies.get("access_token");

let caia_app = null;
let caia_notifications = [];

// To be able to load static files like web-ifc.wasm
// const reload = () => window.location.reload();

export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };

  return Wrapper;
};

class CAIA extends React.Component {
  constructor() {
    super();
    caia_app = this;
    ReactSession.setStoreType("sessionStorage");

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

    this.un_subAlert = PubSub.subscribe("Alert", this.subAlert.bind(this));

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

  componentDidMount() {
    document.body.style.overflow = "clip";
  }

  closeToast(message) {
    caia_notifications = caia_notifications.filter((e) => e !== message);
    caia_app.setState({ notifications: caia_notifications });
  }

  createNotification = (type) => {
    return () => {
      switch (type) {
        case "info":
          NotificationManager.info("Info message");
          break;
        case "success":
          NotificationManager.success("Success message", "Title here");
          break;
        case "warning":
          NotificationManager.warning(
            "Warning message",
            "Close after 3000ms",
            3000
          );
          break;
        case "error":
          NotificationManager.error("Error message", "Click me!", 5000, () => {
            alert("callback");
          });
          break;
        default:
          break;
      }
    };
  };

  subAlert(msg, data) {
    switch (data.type) {
      case "info":
        NotificationManager.info(data.message);
        break;
      case "success":
        NotificationManager.success(data.message, data.title);
        break;
      case "warning":
        NotificationManager.warning(data.message, data.title, 3000);
        break;
      case "error":
        NotificationManager.error("Error message", "Click me!", 5000, () => {
          alert("callback");
        });
        break;
      default:
        break;
    }
  }

  subProjects(msg, data) {
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
    let projectsIconColor = "";
    let overview = `/projects/${this.state.projectName}/`;
    let setup = `/projects/${this.state.projectName}/setup`;

    if (this.state.projectName) {
      projectsIconColor = "white";
    } else {
      projectsIconColor = "gray";
      overview = "javascript:void(0)";
      setup = "javascript:void(0)";
    }

    if (getAccessToken()) {
      let token = parseJWT(getAccessToken());
      this.name = token.name;
      this.useruri = token.URI;
    } else this.name = "";
    return (
      <AppShell
        padding="0"
        navbar={
          <Navbar width={{ base: 100 }} p="xl">
            <Navbar.Section mt="xl">
              <a className={"navbar-icons"} href={`/projects/`}>
                <BsHouse size="30" color="white" />
              </a>
            </Navbar.Section>
            <Navbar.Section mt="xl">
              <a className={"navbar-icons"} href={overview}>
                <BsFillPuzzleFill size="30" color={projectsIconColor} />
              </a>
            </Navbar.Section>
            <Navbar.Section mt="xl">
              <a className={"navbar-icons"} href={setup}>
                <BsGearWideConnected size="30" color={projectsIconColor} />
              </a>
            </Navbar.Section>
          </Navbar>
        }
        header={
          <Header height={"7vh"} p="xs">
            <div className={"caia-header-row"}>
              <img
                src={logo}
                width="60"
                height="60"
                className="d-inline-block align-content-center"
                alt="CAIA Logo"
              />
              <Space w="xl" />
              <Text size="xl" color="white">
                {this.state.projectName}
              </Text>
            </div>
          </Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "light"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
          body: { height: "93vh" },
        })}
      >
        <Routes style={{ height: "100%" }}>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/projects/:id/setup" element={<SetupView />} />
          <Route
            path="/projects/:id/"
            element={
              <div className="caia-fill">
                <XeoKitView class="viewport" id={"MyViewport"} />
              </div>
            }
          />
          <Route path="/projects" element={<ProjectListView />} />
          <Route path="/web-ifc.wasm" element={<reload />} />
          <Route path="" element={<Login />} />
        </Routes>
      </AppShell>
    );
  }

  componentDidMount() {}
}

export default withRouter(CAIA);
