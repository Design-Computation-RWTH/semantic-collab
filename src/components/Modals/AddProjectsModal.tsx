import { useForm } from "@mantine/form";
import {
  Box,
  Button,
  Group,
  Modal,
  Textarea,
  TextInput,
  Text,
} from "@mantine/core";
import React, { useState } from "react";
import { useModals } from "@mantine/modals";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
import PubSub from "pubsub-js";

export default function AddProjectsModal(props: any) {
  const [opened, setOpened] = useState(false);
  const modals = useModals();

  const form = useForm({
    initialValues: {
      Name: "",
      Description: " ",
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create new Project"
        id="ProjectAddModal"
      >
        <Box sx={{ maxWidth: 300 }} mx="auto">
          <form
            onSubmit={form.onSubmit((values) => {
              let bcfowl_setup = new BcfOWLProjectSetup();

              bcfowl_setup
                .addProject(values.Name, values.Description)
                .then(() => {
                  //Target location:
                  PubSub.publish("Update", {
                    txt: "Project created. Name: " + values.Name,
                  });
                  props.update();
                  modals.closeModal("ProjectAddModal");
                  setOpened(false);
                });
            })}
          >
            <TextInput
              required
              label="Project Name"
              placeholder="Project Name"
              {...form.getInputProps("Name")}
            />
            <Textarea
              label="Project Description"
              placeholder="Enter description"
              {...form.getInputProps("Description")}
            />

            <Group position="right" mt="md">
              <Button type="submit">Add project</Button>
            </Group>
          </form>
        </Box>
      </Modal>

      <Group position="center">
        <p>
          <Button onClick={() => setOpened(true)}>
            <Text>Add new Project</Text>
          </Button>
        </p>
      </Group>
    </>
  );
}
