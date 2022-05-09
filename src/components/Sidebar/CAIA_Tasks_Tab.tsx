import React, { useState } from "react";
import { Container } from "@mantine/core";
import TaskListPreview from "./Tasks/TaskListPreview";
import TaskListCreation from "./Tasks/TaskListCreation";
// @ts-ignore
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";

const testJSON = require("./Tasks/TasksExample.json");

type TaskView = "Preview" | "Creation";

export default function CAIA_Tasks_Tab() {
  const [viewState, setViewState] = useState<TaskView>("Preview");

  const { viewer } = React.useContext(ViewerContext) as DcWebViewerContextType;

  let storeyTemp: any = [];

  if (viewer) {
    let storeys = viewer.metaScene.getObjectIDsByType("IfcBuildingStorey");

    for (let storey in storeys) {
      let ifc_storey = viewer.metaScene.metaObjects[storeys[storey]];

      storeyTemp.push(ifc_storey);
    }
  }
  console.log(storeyTemp);
  let ViewState = null;

  if (viewState === "Preview") {
    ViewState = <TaskListPreview IfcStoreys={storeyTemp} viewer={viewer} />;
  } else if (viewState === "Creation") {
    ViewState = (
      <TaskListCreation
        TaskJson={testJSON}
        IfcStoreys={storeyTemp}
        viewer={viewer}
      />
    );
  }

  return (
    <div className=" caia-fill">
      <div className={"yscroll"} style={{ height: "100%" }}>
        {ViewState}
      </div>
      <Container
        style={{ display: "flex", width: "100%", justifyContent: "center" }}
        sx={(theme) => ({
          backgroundColor: theme.colors.dark,
        })}
      >
        <button
          className="btn-caia-icon"
          title="Refresh Tasks"
          onClick={() => {
            if (viewer) {
              setViewState("Creation");
            } else {
              alert("Please load an IFC Building Representation First");
            }
          }}
        >
          <i className="icon bi-plus-square btn-caia-icon-size" />
        </button>
      </Container>
    </div>
  );
}
