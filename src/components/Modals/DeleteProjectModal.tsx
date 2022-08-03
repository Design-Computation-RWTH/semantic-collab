import { Box, Button, Group, Modal } from "@mantine/core";
import React, { useState } from "react";
import Cookies from "js-cookie";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";

export const getAccessToken = () => Cookies.get("access_token");

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

type DeleteProps = {
  projectID: string;
  update: any;
};

export default function DeleteProjectsModal(props: DeleteProps) {
  const [opened, setOpened] = useState(false);

  function deleteProject() {
    let bcfowl_setup = new BcfOWLProjectSetup();
    bcfowl_setup
      .deletetUserOutside(
        parseJWT(getAccessToken()).URI.trim(),
        props.projectID
      )
      .then(() => {
        setOpened(false);
        props.update();
      });
  }

  function cancelDelete() {
    setOpened(false);
  }

  return (
    <>
      <Modal
        withCloseButton={false}
        opened={opened}
        onClose={() => setOpened(false)}
        title="Are you sure you want to remove yourself from the project?"
        id="ProjectDeleteModal"
        styles={{
          title: { color: "white" },
        }}
      >
        <Box sx={{ maxWidth: 300 }} mx="auto">
          <Group>
            <Button onClick={deleteProject}>Confirm</Button>
            <Button onClick={cancelDelete}>Cancel</Button>
          </Group>
        </Box>
      </Modal>

      <Button onClick={() => setOpened(true)}>Remove</Button>
    </>
  );
}
