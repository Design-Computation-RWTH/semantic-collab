import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Center,
  Title,
  Group,
  Spoiler,
} from "@mantine/core";
import PubSub from "pubsub-js";
import { ReactSession } from "react-client-session";
import { useNavigate } from "react-router-dom";
import DeleteProjectsModal from "../Modals/DeleteProjectModal";
import BcfOWL_Endpoint from "../../services/BcfOWL_Endpoint";
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";
import Cookies from "js-cookie";

type ProjectElementProps = {
  project: { projectName: string; projectId: string };
  keyvalue: string;
  history: any;
  update: any;
};

export const getServerUrl = () => Cookies.get("url");

export default function ProjectElement(props: ProjectElementProps) {
  const navigate = useNavigate();
  const [description, setDescription] = useState<string>("");
  const { serverUrl } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  useEffect(() => {
    init();
  });

  function init() {
    let bcfowl = new BcfOWL_Endpoint();
    bcfowl
      .describeNoProject(
        getServerUrl() + "/graph/" + props.project.projectId + "/",
        props.project.projectId
      )
      .then((r) => {
        if (r.comment) {
          setDescription(r.comment);
        }
      });
  }

  function handleClick() {
    ReactSession.set("projectid", props.project.projectId);
    Cookies.set("projectid", props.project.projectId);
    PubSub.publish("ProjectName", { name: props.project.projectName });
    PubSub.publish("SidebarName", { name: props.project.projectName });
    navigate(props.project.projectName + "/");
  }

  return (
    <Center>
      <Card
        style={{
          alignContent: "center",
          width: "340px",
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        withBorder={true}
        p="md"
      >
        <Title order={2}>{props.project.projectName}</Title>
        <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Hide">
          {description}
        </Spoiler>
        <Group>
          <Button
            value={props.project.projectId}
            key={String(props.keyvalue)}
            onClick={handleClick}
          >
            Open
          </Button>
          <DeleteProjectsModal
            projectID={props.project.projectId}
            update={props.update}
          />
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
