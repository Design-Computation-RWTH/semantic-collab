import React, { useEffect, useState } from "react";
import { CloseButton, Accordion, Container, Table, Select, Button, Group, Badge } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import { ViewerContext } from "../../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../../@types/dcwebviewer";
//import CloseButton from "react-bootstrap/CloseButton";
import TaskDetails from "./TaskDetails";
import PubSub from "pubsub-js";

type TaskListProps = {
  IfcStoreys: any[];
  viewer: Viewer;
};

export default function TaskListPreview(props: TaskListProps) {
  const [mainTasks, setMainTasks] = useState<any>([]);
  const [subTasks, setSubTasks] = useState<any>([]);
  const [viewpoints, setViewpoints] = useState<any>([]);
  const [perspectiveCameras, setPerspectiveCameras] = useState<any>([]);
  const [taskPage, setTaskPage] = useState<0 | 1>(0);
  const [activeTask, setActiveTask] = useState<string>("");
  const { viewer, taskExtensions, users } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;
  let un_subTasks_token: PubSubJS.Token;

  let topicTypeData = [];
  if (taskExtensions.has("bcfOWL:TopicType")) {
    topicTypeData = taskExtensions.get("bcfOWL:TopicType").map((e: any) => {
      let tempValue: string = "";
      let tempLabel: string = "";
      Object.keys(e).forEach((key: any) => {
        tempValue = key;
        tempLabel = e[key];
      });
      return { value: tempValue, label: tempLabel };
    });
  }
  topicTypeData.push({ value: "None", label: "None" });

  let topicLabelData = [];
  if (taskExtensions.has("bcfOWL:Label")) {
    topicLabelData = taskExtensions.get("bcfOWL:Label").map((e: any) => {
      let tempValue: string = "";
      let tempLabel: string = "";
      Object.keys(e).forEach((key: any) => {
        tempValue = key;
        tempLabel = e[key];
      });
      return { value: tempValue, label: tempLabel };
    });
  }
  topicLabelData.push({ value: "None", label: "None" });

  let topicStatusData = [];
  if (taskExtensions.has("bcfOWL:TopicStatus")) {
    topicStatusData = taskExtensions.get("bcfOWL:TopicStatus").map((e: any) => {
      let tempValue: string = "";
      let tempLabel: string = "";
      Object.keys(e).forEach((key: any) => {
        tempValue = key;
        tempLabel = e[key];
      });
      return { value: tempValue, label: tempLabel };
    });
  }
  topicStatusData.push({ value: "None", label: "None" });

  let topicPriorityData: any = [];
  if (taskExtensions.has("bcfOWL:Priority")) {
    topicPriorityData = taskExtensions.get("bcfOWL:Priority").map((e: any) => {
      let tempValue: string = "";
      let tempLabel: string = "";
      Object.keys(e).forEach((key: any) => {
        tempValue = key;
        tempLabel = e[key];
      });
      return { value: tempValue, label: tempLabel };
    });
  }
  topicPriorityData.push({ value: "None", label: "None" });

  let topicStageData = [];
  if (taskExtensions.has("bcfOWL:Stage")) {
    topicStageData = taskExtensions.get("bcfOWL:Stage").map((e: any) => {
      let tempValue: string = "";
      let tempLabel: string = "";
      Object.keys(e).forEach((key: any) => {
        tempValue = key;
        tempLabel = e[key];
      });
      return { value: tempValue, label: tempLabel };
    });
  }
  topicStageData.push({ value: "None", label: "None" });

  let authorData = [];
  if (users.size !== 0) {
    authorData = users.map((e: any) => {
      let tempValue: string = "";
      let tempLabel: string = "";
      Object.keys(e).forEach((key: any) => {
        tempValue = key;
        tempLabel = e[key];
      });
      return { value: e["@id"], label: e["name"] + " (" + e["mbox"] + ")" };
    });
  }

  useEffect(() => {
    init();
  }, []);

  function update() {
    getTasks();
  }

  function init() {
    if (mainTasks.length === 0) {
      getTasks();
      un_subTasks_token = PubSub.subscribe("TasksUpdate", update);
    }
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
        let BadgeText: string = "Closed"
        let BadgeColor: string = "green"
        if(st["hasTopicStatus"].includes("Open")) {
          BadgeText = "Open";
          BadgeColor = "red";
        }
        return (
          <Accordion.Item
            value={st["@id"] + "_MainTask"}
            key={st["@id"] + "_MainTask"}
            onClick={(e) => {
              setTaskPage(1);
              setActiveTask(st["@id"]);
            }}
          >
            <Accordion.Control>
              <Group>
                <Badge color={BadgeColor}>
                {BadgeText}
                </Badge>
                {st.hasTitle}
              </Group></Accordion.Control>
            <Accordion.Panel></Accordion.Panel>
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
      return (relatedSubtasks(taskID, st)
      );
    });
    return buildingElements;
  }

  function checkMainTaskStatus(taskID:string) {
    let color: string = "green";
    let text: string = "Closed";
    subTasks.forEach((task: any) => {
      if (task.hasTaskContext === taskID) {
        if (task["hasTopicStatus"].includes("Open")) {
          color = "red";
          text = "Open"
        }
      }
    });

    return [color, text]
  }

  function showElement(t:any) {
    let bcfowl = new BcfOWL_Endpoint();
    bcfowl.getViewpoint4TaskMainTopic(t["@id"]).then((res) => {
      let vp_uri;
      if (res["@graph"]) {
        vp_uri = res["@graph"][0]["@id"]
      } else {
        vp_uri = res["@id"]
      }
      
      viewer.cameraFlight.flyTo(vp_uri)
    })
      
  }

  const MainTasks = mainTasks.map((t: any) => {
    return (
      <Accordion.Item
        value={t["@id"] + "_MainTask"}
        key={t["@id"] + "_MainTask"}
      >
        <Accordion.Control>
          <Group>
            <Badge color={checkMainTaskStatus(t["@id"])[0]}>
            {checkMainTaskStatus(t["@id"])[1]}
            </Badge>
            {t.hasTitle}
          </Group>
          </Accordion.Control>
        <Accordion.Panel>
          <Accordion
            key={"MainTasks_Elements" + t["@id"]}
            chevronSize={0}
            styles={{
            }}
          >
            <Button variant="outline" onClick={() => showElement(t)}>Show Element</Button>
            {buildingElementList(t["@id"])}
          </Accordion>
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

  const TaskList = (
    <Container>
      <Accordion
      // styles={{
      //   contentInner: { padding: 0, margin: 0 },
      //   content: { padding: 0, margin: 0 },
      // }}
      >
        {MainTasks}
      </Accordion>
    </Container>
  );

  const taskDetails = (
    <div
      className={"GalleryContent"}
      style={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <Container style={{ width: "100%", maxWidth: "100%" }}>
        <div>
          <CloseButton onClick={() => setTaskPage(0)} />
          <TaskDetails topic_guid={activeTask} />
        </div>{" "}
      </Container>
    </div>
  );

  if (taskPage === 0) {
    return TaskList;
  } else {
    return taskDetails;
  }
}
