import React, { useEffect, useState } from "react";
import { ActionIcon, Container, FileButton, ScrollArea } from "@mantine/core";
import TaskListPreview from "./Tasks/TaskListPreview";
import TaskListCreation from "./Tasks/TaskListCreation";
// @ts-ignore
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";
import { TaskContext } from "../../context/taskContext";
import { TaskTypes } from "../../@types/taskTypes";
import PubSub from "pubsub-js";

//const testJSON = require("./Tasks/TasksExample.json");

export default function CAIA_Tasks_Tab() {
  const { viewer } = React.useContext(ViewerContext) as DcWebViewerContextType;

  const { taskFile, setTaskFile, taskViewState, setTaskViewState } =
    React.useContext(TaskContext) as TaskTypes;

  let storeyTemp: any = [];

  useEffect(() => {
    if (taskFile !== undefined) {
      if (viewer) {
        setTaskViewState("Creation");
      } else {
        alert("Please load an IFC Building Representation First");
      }
    }
  }, [taskFile, viewer, setTaskViewState]);

  if (viewer) {
    let storeys = viewer.metaScene.getObjectIDsByType("IfcBuildingStorey");

    for (let storey in storeys) {
      let ifc_storey = viewer.metaScene.metaObjects[storeys[storey]];

      storeyTemp.push(ifc_storey);
    }
  }

  let ViewState: any = null;

  if (taskViewState === "Preview") {
    ViewState = <TaskListPreview IfcStoreys={storeyTemp} viewer={viewer} />;
  } else if (taskViewState === "Creation") {
    ViewState = <TaskListCreation IfcStoreys={storeyTemp} viewer={viewer} />;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <ScrollArea.Autosize
        maxHeight={"100%"}
        style={{
          flex: 1,
          height: "95%",
          maxHeight: "95%",
          width: "100%",
          maxWidth: "100%",
        }}
        offsetScrollbars
      >
        {ViewState}
      </ScrollArea.Autosize>
      <Container
        style={{
          height: "5%",
          display: "flex",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <ActionIcon
          className="btn-caia-icon"
          title="Refresh List"
          onClick={() => {
            PubSub.publish("TasksUpdate", "x");
          }}
        >
          <i className=" bi-arrow-clockwise" />
        </ActionIcon>
        <FileButton onChange={setTaskFile} accept={"application/json"}>
          {(props) => (
            <ActionIcon {...props}>
              <i className=" bi-plus-square " />
            </ActionIcon>
          )}
        </FileButton>
      </Container>
    </div>
  );
}
