import PropTypes from "prop-types";
import React from "react";
import {
  Card,
  Text,
  Button,
  Group,
  RingProgress,
  Center,
  Container,
  Title,
} from "@mantine/core";
import PubSub from "pubsub-js";
import { ReactSession } from "react-client-session";
import { useNavigate } from "react-router-dom";

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
  return (
    <Container
      style={{
        width: 340,
        margin: "auto",
        alignItems: "center",
      }}
      sx={(theme) => ({
        backgroundColor: theme.colors.gray,
      })}
    >
      <Center>
        <Card
          style={{ alignContent: "center" }}
          withBorder={true}
          color={"blue"}
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
              { value: 40, color: "cyan" },
              { value: 15, color: "orange" },
              { value: 15, color: "grape" },
            ]}
          />
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            lorem ipsum dolor sit
          </Text>
          <Button
            value={props.project.projectId}
            key={String(props.keyvalue)}
            onClick={handleClick}
          >
            Open {props.project.projectName}
          </Button>
        </Card>
      </Center>
    </Container>
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
