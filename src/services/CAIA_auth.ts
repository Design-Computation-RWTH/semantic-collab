import Cookies from "js-cookie";
import { useForm } from "@mantine/form";
import { ReactSession } from "react-client-session";
import { Box, Button, Group, PasswordInput, TextInput } from "@mantine/core";
import React from "react";

const base_uri = "https://caia.herokuapp.com";

async function doLogin(
  loginname: String,
  password: String,
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
  console.log("user is: " + loginname);
  await fetch(base_uri + "/bcf/3.0/auth/login", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.token) {
        Cookies.set("access_token", result.token);
        Cookies.set("refresh_token", result.token);
        callback();
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
}

const CAIAAuthProvider = {
  isAuthenticated: false,
  signin(username: String, password: String, callback: VoidFunction) {
    CAIAAuthProvider.isAuthenticated = true;
    doLogin(username, password, callback);
  },
  signout(callback: VoidFunction) {
    CAIAAuthProvider.isAuthenticated = false;
    setTimeout(callback, 100);
  },
};

export { CAIAAuthProvider };
