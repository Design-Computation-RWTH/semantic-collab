import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { ReactSession } from "react-client-session";
import PubSub from "pubsub-js";
import { BsFillPuzzleFill, BsGearWideConnected, BsHouse, BsFillMoonStarsFill, BsSunFill} from "react-icons/bs";
import logo from "./components/Branding/Icon_v2.svg";
import ProjectListView from "./pages/ProjectsView";
import SetupView from "./pages/SetupsView";
import XeoKitView from "./components/Viewport/XeoKitView";
// @ts-ignore
import { NotificationManager } from "react-notifications";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Button,
  Checkbox,
  Group,
  Header,
  Menu,
  Navbar,
  Space,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { CAIAAuthProvider } from "./services/CAIA_auth";
import { ViewerContext } from "./context/dcwebviewerContext";
import { DcWebViewerContextType } from "./@types/dcwebviewer";
import { useForm } from "@mantine/form";
import { useLocalStorage } from '@mantine/hooks';
import Cookies from "js-cookie";
export const getAccessToken = () => Cookies.get("access_token");
export const getUserName = () => Cookies.get("username");
export const isAuthenticated = () => !!getAccessToken();

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

export default function CAIA () {
  let name: any;

  let initial_pname:any = "";
  let initial_menustate = false;

  if (ReactSession.get("projectname")) {
    initial_pname = (ReactSession.get("projectname"));
    initial_menustate = true;
  }

  const [projectName, setProjectName] = useState<string | undefined>(initial_pname);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notifications, setNotifications] = useState<string[]|undefined>();
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sidebarName, setSidebarName] = useState<string>("Overview");
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projectSelected, setProjectSelected] = useState<boolean>(initial_menustate);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const dark = colorScheme === "light";


  useEffect(() => {
    document.body.style.overflow = "clip";
    init();
    return () => {};
  }, []);

  function init() {
    //caia_app = this;
    ReactSession.setStoreType("localStorage");
    setProjectName(Cookies.get("projectname"))

    PubSub.subscribe(
      "ProjectName",
      subProjects
    );
    PubSub.subscribe(
      "Update",
      subUpdates
    );
    PubSub.subscribe(
      "SidebarName",
      subSidebar
    );

    PubSub.subscribe("Alert", subAlert);

  }

  function subAlert(msg: any, data: { type: any; message: any; title: any }) {
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

  function subProjects(msg: any, data: { name: any }) {
    // @ts-ignore  Not null.. init at the constructor
    setProjectName(data.name);
    Cookies.set("projectname", data.name)
    ReactSession.set("projectname", data.name);
    caia_notifications = caia_notifications.filter(
      (e) => e !== "Select a project"
    );
    // @ts-ignore  Not null.. init at the constructor
    setNotifications(caia_notifications);
    // @ts-ignore  Not null.. init at the constructor
    setProjectSelected(true);
  }

  function subUpdates(msg: any, data: { txt: any }) {
    if (caia_notifications.length > 2) caia_notifications = [];
    caia_notifications = caia_notifications.concat(data.txt);
    // @ts-ignore  Not null.. init at the constructor
    setNotifications(caia_notifications);
  }

  function subSidebar(msg: any, data: { name: any }) {
    // @ts-ignore  Not null.. init at the constructor
    setSidebarName(data.name);
  }

  
  let nav = useNavigate();
  function Logout() {
    CAIAAuthProvider.signout(() => {
      nav("/login", {replace: false});
    })
  }

  let overview = `/projects/${projectName}/`;
  let setup = `/projects/${projectName}/setup`;
  let disabledIcons = "";

  if (Cookies.get("projectid")) {
  } else {
    disabledIcons = "disabled";
    setup = `/projects/${projectName}/setup`;
  }
  if (getAccessToken()) {
    let token = parseJWT(getAccessToken());
    name = token.name;
  } else name = "";
  return (
    <AuthProvider>
      <AppShell
        navbarOffsetBreakpoint="sm"
        padding="md"
        header={
          <Header height={"60"} p="xs">
            <div className={"caia-header-row"}>
              <img
                src={logo}
                width="50"
                height="50"
                className="d-inline-block align-content-center"
                alt="CAIA Logo"
              />
              <Space w="xl" />
              <Text size="xl" weight={700}>
                {projectName}
              </Text>
            </div>
          </Header>
        }
        navbar={
          <Navbar p="md" hiddenBreakpoint="sm" width={{ base:60, sm: 60, lg: 60 }} styles={{Navbar}}>
              <Navbar.Section mt="xl">
                <a className={"navbar-icons"} href={`/projects/`}>
                  <BsHouse size="30"/>
                </a>
              </Navbar.Section>
              <Navbar.Section mt="xl">
                <a className={`navbar-icons ${disabledIcons}`} href={overview}>
                  <BsFillPuzzleFill size="30" />
                </a>
              </Navbar.Section>
              <Navbar.Section mt="xl">
                <a className={`navbar-icons ${disabledIcons}`} href={setup}>
                  <BsGearWideConnected size="30"  />
                </a>
              </Navbar.Section>
              <div className={"darkmode-switch"}>
                
                  <Menu>
                    <Menu.Target>
                    <Avatar radius="xl" size="sm"/>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>{getUserName()}</Menu.Label>
                      <Menu.Item onClick={() => {Logout()}}>Logout</Menu.Item>
                    </Menu.Dropdown>

                    {/* <Menu.Item onClick={() => {Logout()}}>Logout</Menu.Item> */}
                  </Menu>
                <Space h="xl" />
                <ActionIcon
                  variant="transparent"
                  color={dark ? "blue" : "blue"}
                  onClick={() => toggleColorScheme()}
                  title="Toggle color scheme"
                >
                  {dark ? (
                    <BsSunFill style={{ width: 18, height: 18 }} />
                  ) : (
                    <BsFillMoonStarsFill style={{ width: 18, height: 18 }} />
                  )}
                </ActionIcon>
              </div>
          </Navbar>
        }

        styles={(theme) => ({
          main: {
            display: "flex",
            alignContent: "stretch",
            justifyContent: "space-evenly",
            alignItems: "stretch",
            flexDirection: "column",
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
          body: { height: "100vh" },
        })}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/projects/:id/setup" element={<RequireAuth><SetupView /></RequireAuth>} />
          <Route
            path="/projects/:id/"
            element={
              <RequireAuth>
                <div style={{ height: "100%" }} className="caia-fill">
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

function AuthProvider({ children }: { children: React.ReactNode }) {

  const { serverUrl, setServerUrl } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  let signin = (url: string, username: string, password: string, callback: VoidFunction) => {
    return CAIAAuthProvider.signin(url, username, password, () => {
      setServerUrl(url);
      callback();
    });
  };

  let signout = (callback: VoidFunction) => {
    return CAIAAuthProvider.signout(() => {
      callback();
    });
  };

  let value = { signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface AuthContextType {
  signin: (url:string, username: string, password: string, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function useAuth() {
  return React.useContext(AuthContext);
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let location = useLocation();

  if (!isAuthenticated()) {
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


  const ref = useRef() as React.MutableRefObject<HTMLInputElement>;
  
  // @ts-ignore
  let from = location.state?.from?.pathname || "/";

  const [URL, setURL] = useLocalStorage<string>({
    key: 'URL',
    defaultValue: '',
  });
  const [user, setUser] = useLocalStorage<string>({
    key: 'user',
    defaultValue: '',
  });
  const [password, setPassword] = useLocalStorage<string>({
    key: 'password',
    defaultValue: '',
  });
  const [remember, setRemember] = useLocalStorage<boolean>({
    key: 'remember',
    defaultValue: false,
  });

  let initURL:string = remember ? URL : "";
  let initUser:string = remember ? user : "";
  let initPassword: string = remember ? password : "";

  const form = useForm({
    initialValues: {
      url: initURL,
      username: initUser,
      password: initPassword,
    },

    validate: {
      username: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid username",
    },
  });

  function handleSubmit(values: any) {

    setRemember(ref.current.checked);
    if(ref.current.checked) {
      setURL(values.url);
      setUser(values.username);
      setPassword(values.password);
    } else {
      setURL("");
      setUser("");
      setPassword("");
    }

    let url = values.url;
    let username = values.username;
    let password = values.password;

    auth.signin(url, username, password, () => {
      // Send them back to the page they tried to visit when they were
      // redirected to the login page. Use { replace: true } so we don't create
      // another entry in the history stack for the login page.  This means that
      // when they get to the protected page and click the back button, they
      // won't end up back on the login page, which is also really nice for the
      // user experience.
      navigate(from, { replace: true });
    });
  }

  return (
    <Box style={{ paddingTop: "10%" }} sx={{ maxWidth: 300 }} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
          required
          type="url"
          label="Server URL"
          placeholder="https://yourserver.url"
          {...form.getInputProps("url")}
        />
        <TextInput
          required
          type="email"
          label="Username"
          placeholder="your@email.com"
          {...form.getInputProps("username")}
        />
        <TextInput
          required
          type="password"
          label="Password"
          placeholder="Enter your Password"
          {...form.getInputProps("password")}
        />
        <Group position="right" mt="md">
          <Checkbox
            ref={ref}
            label="Remember"
            defaultChecked={remember}
          />
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}



//export default withRouter(CAIA);
