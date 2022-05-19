import React, { useEffect, useState } from "react";
import { Accordion, Container, Table, Select } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import { ViewerContext } from "../../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../../@types/dcwebviewer";

type TaskListProps = {
  IfcStoreys: any[];
  viewer: Viewer;
};

export default function TaskListPreview(props: TaskListProps) {
  const [mainTasks, setMainTasks] = useState<any>([]);
  const [subTasks, setSubTasks] = useState<any>([]);
  const [viewpoints, setViewpoints] = useState<any>([]);
  const [perspectiveCameras, setPerspectiveCameras] = useState<any>([]);
  const { viewer } = React.useContext(ViewerContext) as DcWebViewerContextType;

  useEffect(() => {
    init();
  }, []);

  function init() {
    getTasks();
  }

  function getTasks() {
    let bcfowl = new BcfOWL_Endpoint();

    bcfowl.getTasks().then((r) => {
      orderTasks(r);
    });
  }

  function orderTasks(tasks: any) {
    let tasksList = tasks["@graph"];
    // Init Task variables that handles all the tasks values
    let tempMainTasks: any = [];
    let tempSubTasks: any = [];
    let tempViewpoints: any = [];
    let tempPerspectiveCameras: any = [];

    for (let task in tasksList) {
      let tempTask = tasksList[task];

      if (
        tempTask["@type"] === "http://lbd.arch.rwth-aachen.de/bcfOWL#Viewpoint"
      ) {
        tempViewpoints.push(tempTask);
      }
    }

    for (let task in tasksList) {
      let tempTask = tasksList[task];

      if (!tempTask["hasTaskContext"] && tempTask.hasTitle) {
        tempMainTasks.push(tempTask);
      } else if (tempTask.hasTitle) {
        tempViewpoints.forEach((vp: any) => {
          if (vp.hasTopic.includes(tempTask["@id"])) {
            tempTask["buildingElement"] = vp.hasSelection;
          }
        });
        tempSubTasks.push(tempTask);
      } else if (
        tempTask["@type"] ===
        "http://lbd.arch.rwth-aachen.de/bcfOWL#PerspectiveCamera"
      ) {
        tempPerspectiveCameras.push(tempTask);
      }
    }

    // Set the state with the main tasks
    setMainTasks(tempMainTasks);
    setSubTasks(tempSubTasks);
    setViewpoints(tempViewpoints);
    setPerspectiveCameras(tempPerspectiveCameras);
  }

  function relatedSubtasks(taskID: string, elementID: string) {
    const SubTasks = subTasks.map((st: any) => {
      if (st["hasTaskContext"] === taskID && elementID === st.buildingElement) {
        return (
          <Accordion.Item
            label={st.hasTitle}
            id={st["@id"] + "_MainTask"}
            styles={{
              itemTitle: { color: "white" },
              contentInner: { padding: 0, margin: 0 },
              content: { padding: 0, margin: 0 },
            }}
          >
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Title</td>
                  <td>{st.hasTitle}</td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>{st.hasCreationDate}</td>
                </tr>
                <tr>
                  <td>Due Date</td>
                  <td>
                    <DatePicker
                      dropdownType="modal"
                      placeholder="Pick date"
                      label="Event date"
                      //TODO: Convert ISO String to Date!
                      defaultValue={new Date()}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Priority</td>
                  <td>
                    <Select
                      //TODO: Save all Extensions in the Context, so they are accessible everywhere
                      defaultValue={st.hasPriority}
                      data={[
                        { value: st.hasPriority, label: "Priority" },
                        { value: "ng", label: "Angular" },
                        { value: "svelte", label: "Svelte" },
                        { value: "vue", label: "Vue" },
                      ]}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>{st.hasDescription}</td>
                </tr>
              </tbody>
            </Table>
          </Accordion.Item>
        );
      } else {
        return <></>;
      }
    });
    return SubTasks;
  }

  function buildingElementList(taskID: string) {
    let tempElements: string[] = [];
    subTasks.forEach((task: any) => {
      if (task.hasTaskContext === taskID) {
        if (!tempElements.includes(task.buildingElement)) {
          tempElements.push(task.buildingElement);
        }
      }
    });
    const buildingElements = tempElements.map((st: any) => {
      let name: string;
      if (viewer.metaScene.metaObjects[st]) {
        name = viewer.metaScene.metaObjects[st].name;
      } else {
        name = st;
      }

      return (
        <Accordion.Item
          label={name}
          id={name + "_BuildingElement"}
          styles={{
            itemTitle: { color: "white" },
          }}
        >
          <Accordion
            styles={{
              contentInner: { padding: 0, margin: 0 },
              content: { padding: 0, margin: 0 },
            }}
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[2],
            })}
          >
            {relatedSubtasks(taskID, st)}
          </Accordion>
        </Accordion.Item>
      );
    });
    return buildingElements;
  }

  const MainTasks = mainTasks.map((t: any) => {
    return (
      <Accordion.Item
        label={t.hasTitle}
        id={t["@id"] + "_MainTask"}
        styles={{
          itemTitle: { color: "white" },
          contentInner: { padding: 0, margin: 0 },
          content: { padding: 10, margin: 0 },
        }}
      >
        <Accordion
          styles={{
            contentInner: { padding: 0, margin: 0 },
            content: { padding: 0, margin: 0 },
          }}
          sx={(theme) => ({
            backgroundColor: theme.colors.gray[1],
          })}
        >
          {buildingElementList(t["@id"])}
        </Accordion>
      </Accordion.Item>
    );
  });

  return (
    <Container>
      <Accordion
        styles={{
          contentInner: { padding: 0, margin: 0 },
          content: { padding: 0, margin: 0 },
        }}
        sx={(theme) => ({
          backgroundColor: theme.colors.gray[0],
        })}
      >
        {MainTasks}
      </Accordion>
    </Container>
  );
}
