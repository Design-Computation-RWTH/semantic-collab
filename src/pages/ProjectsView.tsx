import React, { useEffect } from "react";
import { useState } from "react";
import { SimpleGrid, Button, Center, ScrollArea, Divider } from "@mantine/core";
import BCFAPI from "../services/BCFAPI";
// @ts-ignore
import PubSub from "pubsub-js";
import ProjectElement from "../components/Projects/ProjectElement";
import { useNavigate } from "react-router-dom";
import AddProjectsModal from "../components/Modals/AddProjectsModal";
import * as bcfOWL_API from "../services/types/bcfOWL_API_types";

export const withRouter = (Component: any) => {
  const Wrapper = (props: any) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };

  return Wrapper;
};

type ProjectListViewProps = {
  history: any; // Is it needeed?
};

function ProjectListView(props: ProjectListViewProps) {
  const [projects, setProjects] = useState<bcfOWL_API.ProjectType[]>([]);

  useEffect(() => {
    PubSub.publish("ProjectName", { name: null });
    PubSub.publish("CloseMenu", "");
    update();
  }, []);

  function update() {
    let bcfapi = new BCFAPI();
    bcfapi
      .getProjects()
      .then((value) => {
        setProjects(value);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  let binx = 1000;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ScrollArea style={{ height: "100%" }} p={"md"}>
        <SimpleGrid cols={4}>
          {projects.map((d: bcfOWL_API.ProjectType) => (
            <ProjectElement
              project={{ projectName: d.name, projectId: d.project_id }}
              key={String(binx++)}
              keyvalue={String(binx)}
              //keyvalue={String(binx++)}
              //TODO: What is this history for?
              history={props.history}
            />
          ))}
        </SimpleGrid>
      </ScrollArea>
      <Divider p={"xs"} />
      <AddProjectsModal />
      <p />
      <div className="main-refresh">
        <Button
          onClick={() => {
            update();
          }}
        >
          {" "}
          Refresh{" "}
        </Button>
      </div>
      <p />
    </div>
  );
}

export default withRouter(ProjectListView);
