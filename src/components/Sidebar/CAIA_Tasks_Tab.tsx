import React, { useEffect, useState } from "react";
import { ActionIcon, Container, FileButton} from "@mantine/core";
import TaskListPreview from "./Tasks/TaskListPreview";
import TaskListCreation from "./Tasks/TaskListCreation";
// @ts-ignore
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";
import { TaskContext } from "../../context/taskContext";
import { TaskTypes } from "../../@types/taskTypes";

//const testJSON = require("./Tasks/TasksExample.json");

type TaskView = "Preview" | "Creation";

export default function CAIA_Tasks_Tab() {
  const [viewState, setViewState] = useState<TaskView>("Preview");
  const [taskJSON, setTaskJson] = useState<Object| undefined>();

  const { viewer } = React.useContext(ViewerContext) as DcWebViewerContextType;

  const { taskFile, setTaskFile } = React.useContext(TaskContext) as TaskTypes;

  let storeyTemp: any = [];

  useEffect(() => {
    console.log("file", taskFile)
    if (taskFile !== undefined) {
           if (viewer) {
                 setViewState("Creation");
               } else {
                 alert("Please load an IFC Building Representation First");
            }
    }
  }, [taskFile]);

  if (viewer) {
    let storeys = viewer.metaScene.getObjectIDsByType("IfcBuildingStorey");

    for (let storey in storeys) {
      let ifc_storey = viewer.metaScene.metaObjects[storeys[storey]];

      storeyTemp.push(ifc_storey);
    }
  }

  let ViewState = null;

  if (viewState === "Preview") {
    ViewState = <TaskListPreview IfcStoreys={storeyTemp} viewer={viewer} />;
  } else if (viewState === "Creation") {
    ViewState = (
      <TaskListCreation
        IfcStoreys={storeyTemp}
        viewer={viewer}
      />
    );
  }

  return (
    <div
      style={{
        height: "100%",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <div className={"yscroll"} style={{ height: "100%" }}>
        {ViewState}
      </div>
      <Container
                style={{
                  height: "5%",
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
      >
        <FileButton onChange={setTaskFile} accept={"image/png, image/jpeg, application/json"}>
        {(props) => 
          (<ActionIcon {...props}
            // title="Create new Tasks"
            // onClick={() => {
            //   if (viewer) {
            //     setViewState("Creation");
            //   } else {
            //     alert("Please load an IFC Building Representation First");
            //   }
            // }}
          >
            <i className=" bi-plus-square " />
          </ActionIcon>)}
        </FileButton>
      </Container>
    </div>
  );
}
