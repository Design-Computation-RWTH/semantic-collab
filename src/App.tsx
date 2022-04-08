import "./App.css";
import React from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { ReactSession } from "react-client-session";
import PubSub from "pubsub-js";
import { BsFillPuzzleFill, BsGearWideConnected, BsHouse } from "react-icons/bs";
import logo from "./components/Branding/Icon_v2.svg";
import ProjectListView from "./pages/ProjectsView";
import SetupView from "./pages/SetupsView";
import XeoKitView from "./components/Viewport/XeoKitView";
// @ts-ignore
import { NotificationManager } from "react-notifications";
import {
  AppShell,
  Box,
  Button,
  Group,
  Header,
  Navbar,
  PasswordInput,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { CAIAAuthProvider } from "./services/CAIA_auth";
import { useForm } from "@mantine/form";
import Cookies from "js-cookie";
export const getAccessToken = () => Cookies.get("access_token");
export const isAuthenticated = () => !!getAccessToken();

let caia_app: CAIA | null = null;
let caia_notifications: any[] = [];

// To be able to load static files like web-ifc.wasm
function Reload() {
  window.location.reload();
  return <div />;
}

export const withRouter = (Component: any) => {
  return (props: any) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };
};

function parseJWT(token: string | undefined) {
  // @ts-ignore
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

type CAIAProps = {};

type CAIAState = {
  projectName: string;
  notifications: any[];
  sidebarName: string;
  projectSelected: any;
};

class CAIA extends React.Component<CAIAProps, CAIAState> {
  private readonly un_subProjects_token: PubSubJS.Token;
  private readonly un_subNotifications_token: PubSubJS.Token;
  private readonly un_subSidebarName_token: PubSubJS.Token;
  private readonly un_subAlert: PubSubJS.Token;
  private name: any;
  private useruri: any;

  constructor(props: CAIAProps | Readonly<CAIAProps>) {
    super(props);
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
    PubSub.unsubscribe(this.un_subAlert);
  }

  componentDidMount() {
    document.body.style.overflow = "clip";
  }

  closeToast(message: any) {
    caia_notifications = caia_notifications.filter((e) => e !== message);
    // @ts-ignore  Not null.. init at the constructor
    caia_app.setState({ notifications: caia_notifications });
  }

  createNotification = (type: any) => {
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

  subAlert(msg: any, data: { type: any; message: any; title: any }) {
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

  subProjects(msg: any, data: { name: any }) {
    console.log("logout?");
    // @ts-ignore  Not null.. init at the constructor
    caia_app.setState({ projectName: data.name });
    ReactSession.set("projectname", data.name);
    caia_notifications = caia_notifications.filter(
      (e) => e !== "Select a project"
    );
    // @ts-ignore  Not null.. init at the constructor
    caia_app.setState({ notifications: caia_notifications });
    // @ts-ignore  Not null.. init at the constructor
    caia_app.setState({ projectSelected: true });
  }

  subUpdates(msg: any, data: { txt: any }) {
    if (caia_notifications.length > 2) caia_notifications = [];
    caia_notifications = caia_notifications.concat(data.txt);
    // @ts-ignore  Not null.. init at the constructor
    caia_app.setState({ notifications: caia_notifications });
  }

  subSidebar(msg: any, data: { name: any }) {
    // @ts-ignore  Not null.. init at the constructor
    caia_app.setState({ sidebarName: data.name });
  }

  render() {
    let projectsIconColor: string;
    let overview = `/projects/${this.state.projectName}/`;
    let setup = `/projects/${this.state.projectName}/setup`;
    let disabledIcons = "";

    if (this.state.projectName) {
      projectsIconColor = "white";
    } else {
      projectsIconColor = "gray";
      disabledIcons = "disabled";
      setup = `/projects/${this.state.projectName}/setup`;
    }
    if (getAccessToken()) {
      let token = parseJWT(getAccessToken());
      this.name = token.name;
      this.useruri = token.URI;
    } else this.name = "";
    return (
      <AuthProvider>
        <AppShell
          padding={0}
          navbar={
            <Navbar width={{ base: 100 }} p="xl">
              <Navbar.Section mt="xl">
                <a className={"navbar-icons"} href={`/projects/`}>
                  <BsHouse size="30" color="white" />
                </a>
              </Navbar.Section>
              <Navbar.Section mt="xl">
                <a className={`navbar-icons ${disabledIcons}`} href={overview}>
                  <BsFillPuzzleFill size="30" color={projectsIconColor} />
                </a>
              </Navbar.Section>
              <Navbar.Section mt="xl">
                <a className={`navbar-icons ${disabledIcons}`} href={setup}>
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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/projects/:id/setup" element={<SetupView />} />
            <Route
              path="/projects/:id/"
              element={
                <RequireAuth>
                  <div className="caia-fill">
                    <XeoKitView />
                  </div>
                </RequireAuth>
              }
            />
            <Route
              path="/projects"
              element={
                <RequireAuth>
                  <ProjectListView />
                </RequireAuth>
              }
            />
            <Route path="" element={<Navigate to="/projects" replace />} />
            <Route path="/web-ifc.wasm" element={<Reload />} />
          </Routes>
        </AppShell>
      </AuthProvider>
    );
  }
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  let signin = (username: string, password: string, callback: VoidFunction) => {
    return CAIAAuthProvider.signin(username, password, () => {
      console.log("set user: " + username);
      callback();
    });
  };

  let signout = (callback: VoidFunction) => {
    return CAIAAuthProvider.signout(() => {
      console.log("set user: null");
      callback();
    });
  };

  let value = { signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface AuthContextType {
  signin: (username: string, password: string, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function useAuth() {
  return React.useContext(AuthContext);
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!isAuthenticated()) {
    console.log("No user");
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function Login() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();
  // @ts-ignore
  let from = location.state?.from?.pathname || "/";

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },

    validate: {
      username: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid username",
    },
  });

  function handleSubmit(values: any) {
    let username = values.username;
    let password = values.password;

    auth.signin(username, password, () => {
      // Send them back to the page they tried to visit when they were
      // redirected to the login page. Use { replace: true } so we don't create
      // another entry in the history stack for the login page.  This means that
      // when they get to the protected page and click the back button, they
      // won't end up back on the login page, which is also really nice for the
      // user experience.
      console.log("to: " + from);
      navigate(from, { replace: true });
    });
  }

  return (
    <Box style={{ paddingTop: "10%" }} sx={{ maxWidth: 300 }} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label="Username"
          placeholder="your@email.com"
          {...form.getInputProps("username")}
        />
        <PasswordInput
          required
          label="Password"
          placeholder="Enter your Password"
          {...form.getInputProps("password")}
        />
        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}
export default withRouter(CAIA);
