import PropTypes from "prop-types";
import React from "react";
import {
  Card,
  Text,
  Button,
  RingProgress,
  Center,
  Title,
  Group,
} from "@mantine/core";
import PubSub from "pubsub-js";
import { ReactSession } from "react-client-session";
import { useNavigate } from "react-router-dom";
import DeleteProjectsModal from "../Modals/DeleteProjectModal";

type ProjectElementProps = {
  project: { projectName: string; projectId: string };
  keyvalue: string;
  history: any;
};

export default function ProjectElement(props: ProjectElementProps) {
  const navigate = useNavigate();

  function handleClick() {
    ReactSession.set("projectid", props.project.projectId);
    PubSub.publish("ProjectName", { name: props.project.projectName });
    PubSub.publish("SidebarName", { name: props.project.projectName });
    navigate(props.project.projectName + "/");
  }

  function handleDelete() {
    console.log("Delete");
  }

  return (
    <Center>
      <Card
        style={{ alignContent: "center", width: "340px" }}
        withBorder={true}
        // color={"blue"}
        p="md"
      >
        <Title order={2}>{props.project.projectName}</Title>

        <RingProgress
          label={
            <Text size="xs" align="center">
              Application data usage
            </Text>
          }
          sections={[
            { value: Math.floor(Math.random() * 100), color: "cyan" },
            { value: Math.floor(Math.random() * 100), color: "orange" },
            { value: Math.floor(Math.random() * 100), color: "grape" },
          ]}
        />
        <Text size="sm" style={{ lineHeight: 1.5 }}>
          lorem ipsum dolor sit
        </Text>
        <Group>
          <Button
            value={props.project.projectId}
            key={String(props.keyvalue)}
            onClick={handleClick}
          >
            Open
          </Button>
          <DeleteProjectsModal projectID={props.project.projectId} />
        </Group>
      </Card>
    </Center>
  );
}

ProjectElement.propTypes = {
  project: PropTypes.shape({
    projectName: PropTypes.string,
    projectId: PropTypes.string,
  }),
  keyvalue: PropTypes.string,
  history: PropTypes.array,
};
