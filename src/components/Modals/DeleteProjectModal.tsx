import { useForm } from "@mantine/form";
import { Box, Button, Group, Modal, Textarea, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { useModals } from "@mantine/modals";
import { useNavigate } from "react-router-dom";

type DeleteProps = {
  projectID: string;
  userID?: string;
};

export default function DeleteProjectsModal(props: DeleteProps) {
  const [opened, setOpened] = useState(false);
  const modals = useModals();

  function deleteProject() {
    console.log(props.projectID);
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
        title="Are you sure you want to delete the project?"
        id="ProjectDeleteModal"
        styles={{
          title: { color: "white" },
        }}
      >
        <Box sx={{ maxWidth: 300 }} mx="auto">
          <Group>
            <Button onClick={deleteProject}> Delete</Button>
            <Button onClick={cancelDelete}>Cancel</Button>
          </Group>
        </Box>
      </Modal>

      <Button onClick={() => setOpened(true)}>Delete</Button>
    </>
  );
}
