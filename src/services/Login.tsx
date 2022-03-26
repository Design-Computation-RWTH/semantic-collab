import Cookies from "js-cookie";
import React from "react";
import Form from "react-bootstrap/Form";
//import Button from "react-bootstrap/Button";
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Box,
  Text,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
// @ts-ignore
import { ReactSession } from "react-client-session";
// import {NotificationManager} from "react-notifications";

const base_uri = "https://caia.herokuapp.com";

async function doLogin(login: string, password: string) {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    id: login,
    password: password,
  });

  let requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  await fetch(base_uri + "/bcf/3.0/auth/login", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.token) {
        Cookies.set("access_token", result.token);
        Cookies.set("refresh_token", result.token);

        window.location.replace(`${"/projects"}`);
        //NotificationManager.success("logged in", "Successful Login");
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
}

export default function Login() {
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
    ReactSession.set("username", values.username);
    doLogin(values.username, values.password);
  }

  return (
    <Box style={{paddingTop: "10%"}} sx={{ maxWidth: 300 }} mx="auto">
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
