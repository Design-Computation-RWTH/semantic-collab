import Cookies from "js-cookie";
import { Route } from "react-router-dom";
import React from "react";
export const getAccessToken = () => Cookies.get("access_token");
export const getRefreshToken = () => Cookies.get("refresh_token");
export const isAuthenticated = () => !!getAccessToken();

export const authenticate = async () => {
  if (getRefreshToken()) {
    try {
      let access_token = await Cookies.get("access_token");
      let refresh_token = await Cookies.get("refresh_token");

      const expires = (access_token.expires_in || 60 * 60) * 1000;
      const inOneHour = new Date(new Date().getTime() + expires);

      Cookies.set("access_token", access_token, { expires: inOneHour });
      Cookies.set("refresh_token", refresh_token);

      return true;
    } catch (error) {
      redirectToLogin();
      return false;
    }
  }

  redirectToLogin();
  return false;
};

const redirectToLogin = () => {
  window.location.replace(`${"/login"}?next=${window.location.href}`);
};

export const AuthenticatedRoute = ({ element: Component, exact, path }) => (
  <Route
    exact={exact}
    path={path}
    render={(props) =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <AuthenticateBeforeRender
          render={() => <Component {...props} />}
        ></AuthenticateBeforeRender>
      )
    }
  ></Route>
);

class AuthenticateBeforeRender extends React.Component {
  state = {
    isAuthenticated: false,
  };

  componentDidMount() {
    authenticate().then((isAuthenticated) => {
      this.setState({ isAuthenticated });
    });
  }

  render() {
    return this.state.isAuthenticated ? this.props.render() : null;
  }
}

export default AuthenticatedRoute;
