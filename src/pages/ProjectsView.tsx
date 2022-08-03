import React, { useEffect, useState } from "react";
import { Button, Divider, ScrollArea, Grid, Center, Card } from "@mantine/core";
import BCFAPI from "../services/BCFAPI";
// @ts-ignore
import PubSub from "pubsub-js";
import ProjectElement from "../components/Projects/ProjectElement";
import { useNavigate } from "react-router-dom";
import AddProjectsModal from "../components/Modals/AddProjectsModal";
import * as bcfOWL_API from "../services/types/bcfOWL_API_types";

export const withRouter = (Component: any) => {
  return (props: any) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };
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
    return () => {
      setProjects([]); // This worked for me
    };
  }, []);

  function update() {
    let bcfapi = new BCFAPI();
    bcfapi
      .getProjects()
      .then((value) => {
        value.sort((a, b) => a.name.localeCompare(b.name));
        setProjects(value);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function updateProjects() {
    setTimeout(function () {
      update();
    }, 1000);
  }

  let binx = 1000;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ScrollArea style={{ height: "100%" }} p={"md"}>
        <Grid>
          {projects.map((d: bcfOWL_API.ProjectType) => (
            // xs, sm, md, lg, xl
            <Grid.Col xs={10} sm={6} md={6} lg={4} xl={3} key={String(binx++)}>
              <ProjectElement
                project={{ projectName: d.name, projectId: d.project_id }}
                update={updateProjects}
                keyvalue={String(binx)}
                history={props.history}
              />
            </Grid.Col>
          ))}
          <Grid.Col xs={10} sm={6} md={6} lg={4} xl={3} key={"Add"}>
            <Center>
              <Card
                style={{
                  alignContent: "center",
                  width: "340px",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                }}
                withBorder={true}
                p="md"
              >
                <AddProjectsModal update={updateProjects} />
              </Card>
            </Center>
          </Grid.Col>
        </Grid>
      </ScrollArea>
      <Divider p={"xs"} />

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
