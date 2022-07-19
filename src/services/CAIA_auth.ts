import Cookies from "js-cookie";

async function doLogin(
  url: string,
  loginname: string,
  password: string,
  callback: VoidFunction
) {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    id: loginname,
    password: password,
  });

  let requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  await fetch(url + "/bcf/3.0/auth/login", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.token) {
        Cookies.set("access_token", result.token);
        Cookies.set("refresh_token", result.token);
        Cookies.set("url", url);
        Cookies.set("username", loginname);
        callback();
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
}

const CAIAAuthProvider = {
  isAuthenticated: false,
  signin(
    url: string,
    username: string,
    password: string,
    callback: VoidFunction
  ) {
    CAIAAuthProvider.isAuthenticated = true;
    doLogin(url, username, password, callback);
  },
  signout(callback: VoidFunction) {
    CAIAAuthProvider.isAuthenticated = false;
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("url");
    Cookies.remove("username");
    setTimeout(callback, 100);
  },
};

export { CAIAAuthProvider };
