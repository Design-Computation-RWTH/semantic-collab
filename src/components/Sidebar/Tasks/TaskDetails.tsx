import React, { useEffect, useState } from "react";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import { Table, Select, Stack } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { ViewerContext } from "../../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../../@types/dcwebviewer";
import TaskComments from "./TaskComments";

type TopicTableProps = {
  topic_guid: string;
};



function TopicTable(props: TopicTableProps) {
  const [topic_guid, setTopic_guid] = useState<string>(props.topic_guid);
  const [data, setData] = useState<any>([]);
  const [topic, setTopic] = useState<any>({});
  const { taskExtensions, extensions, users } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  const [topicType, setTopicType] = useState<string>("None");
  const [topicStatus, setTopicStatus] = useState<string>("None");
  const [topicStage, setTopicStage] = useState<string>("None");
  const [topicPriority, setTopicPriority] = useState<string>("None");
  const [topicAssigned, setTopicAssigned] = useState<string>("None");
  const [topicAuthor, setTopicAuthor] = useState<string>("None");
  const [topicModAuthor, setTopicModAuthor] = useState<string>("None");
  const [topicLabels, setTopicLabels] = useState<string[]>(["None"]);
  const [topicCreationDate, setTopicCreationDate] = useState<Date>(new Date());
  const [topicModifiedDate, setTopicModifiedDate] = useState<Date | null>(null);
  const [topicDueDate, setTopicDueDate] = useState<Date | null>(null);

  useEffect(() => {
    init();
  }, []);

  function init() {
    let bcfowl = new BcfOWL_Endpoint();
    bcfowl
      .describe(topic_guid)
      .then((topic) => {
        setTopic(topic);
        let tempData: any[] = [];
        for (let i in topic) {
          if (i !== "@context") {
            let value: string = topic[i];
            tempData = tempData.concat({ i, value });
          }
        }
        setData(tempData);

        tempData.forEach((d) => {
          if (d.i === "hasTopicType") {
            setTopicType(d.value);
          }
          if (d.i === "hasTopicStatus") {
            setTopicStatus(d.value);
          }
          if (d.i === "hasStage") {
            setTopicStage(d.value);
          }
          if (d.i === "hasPriority") {
            setTopicPriority(d.value);
          }
          if (d.i === "hasAssignedTo") {
            setTopicAssigned(d.value);
          }
          if (d.i === "hasDueDate") {
            setTopicDueDate(dayjs(d.value).toDate());
          }
          if (d.i === "hasCreationDate") {
            setTopicCreationDate(dayjs(d.value).toDate());
          }
          if (d.i === "hasCreationAuthor") {
            users.forEach((u: any) => {
              if (u["@id"] === d.value) {
                setTopicAuthor(u["name"]);
              }
            });
          }
          if (d.i === "hasModifiedAuthor") {
            users.forEach((u: any) => {
              if (u["@id"] === d.value) {
                setTopicModAuthor(u["name"]);
              }
            });
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  let bcfOWL = new BcfOWL_Endpoint();

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
  if (extensions.has("bcfOWL:TopicStatus")) {
    topicStatusData = extensions.get("bcfOWL:TopicStatus").map((e: any) => {
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

  let topicPriorityData = [];
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
  authorData = users.map((e: any) => {
    let tempValue: string = "";
    let tempLabel: string = "";
    Object.keys(e).forEach((key: any) => {
      tempValue = key;
      tempLabel = e[key];
    });
    return { value: e["@id"], label: e["name"] + " (" + e["mbox"] + ")" };
  });

  let assignedData = authorData;
  assignedData.push({ value: "None", label: "None" });

  return (
    <div className={"TopicTable"} style={{ width: "100%", maxWidth: "100%" }}>
      <Table
        style={{
          width: "100%",
        }}
        striped={true}
      >
        <tbody
          style={{
            width: "100%",
          }}
        >
          <tr key="TitleRow" style={{ display: "flex", width: "100%" }}>
            <td
              key={"TitleKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Title
            </td>
            <td
              key={"TitleValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              {topic["hasTitle"]}
            </td>
          </tr>
          <tr key="AuthorRow" style={{ display: "flex" }}>
            <td
              key={"AuthorKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Author
            </td>
            <td
              key={"AuthorValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              {topicAuthor}
            </td>
          </tr>
          <tr key="DateRow" style={{ display: "flex" }}>
            <td
              key={"DateKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Creation Date
            </td>
            <td
              key={"DateValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              {topicCreationDate.toLocaleString()}
            </td>
          </tr>
          <tr key="ModAuthorRow" style={{ display: "flex" }}>
            <td
              key={"ModAuthorKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Modified By
            </td>
            <td
              key={"ModAuthorValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              {topicModAuthor}
            </td>
          </tr>
          <tr key="StatusRow" style={{ display: "flex" }}>
            <td
              key={"StatusKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Status
            </td>
            <td
              key={"StatusValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              <Select
                data={topicStatusData}
                value={topicStatus}
                onChange={(e: string) => {
                  setTopicStatus(e);
                  bcfOWL.updateTopic(
                    topic_guid,
                    "bcfOWL:hasTopicStatus",
                    "<" + e + ">"
                  );
                }}
              />
            </td>
          </tr>
          <tr key="PriorityRow" style={{ display: "flex" }}>
            <td
              key={"PriorityKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Priority
            </td>
            <td
              key={"PriorityValueKey"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              <Select
                data={topicPriorityData}
                value={topicPriority}
                onChange={(e: string) => {
                  setTopicPriority(e);
                  if (e !== "None")
                    bcfOWL.updateTopic(
                      topic_guid,
                      "bcfOWL:hasPriority",
                      "<" + e + ">"
                    );
                }}
              />
            </td>
          </tr>
          <tr key="TypeRow" style={{ display: "flex" }}>
            <td
              key={"TypeKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Type
            </td>
            <td
              key={"StatusValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              <Select
                data={topicTypeData}
                value={topicType}
                onChange={(e: string) => {
                  setTopicType(e);
                  if (e !== "None")
                    bcfOWL.updateTopic(
                      topic_guid,
                      "bcfOWL:hasTopicType",
                      "<" + e + ">"
                    );
                }}
              />
            </td>
          </tr>
          <tr key="AssignedToRow" style={{ display: "flex" }}>
            <td
              key={"AssignedKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Type
            </td>
            <td
              key={"AssignedValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              <Select
                data={assignedData}
                value={topicAssigned}
                onChange={(e: string) => {
                  setTopicAssigned(e);
                  if (e !== "None")
                    bcfOWL.updateTopic(
                      topic_guid,
                      "bcfOWL:hasAssignedTo",
                      "<" + e + ">"
                    );
                }}
              />
            </td>
          </tr>
          <tr key="DueDateRow" style={{ display: "flex" }}>
            <td
              key={"DueDateKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Due Date
            </td>
            <td
              key={"DueDateValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              <DatePicker
                placeholder="Pick Due Date"
                value={topicDueDate}
                onChange={(e) => {
                  setTopicDueDate(e);

                  if (e !== null) {
                    bcfOWL.updateTopic(
                      topic_guid,
                      "bcfOWL:hasDueDate",
                      '"' + e.toISOString() + '"^^xsd:datetime'
                    );
                  }
                }}
              />
            </td>
          </tr>
          <tr key="LabelRow" style={{ display: "flex" }}>
            <td
              key={"LabelKey"}
              style={{ display: "flex", maxWidth: "125px", minWidth: "125px" }}
            >
              Labels
            </td>
            <td
              key={"LabelValue"}
              style={{
                maxWidth: "200px",
                minWidth: "100px",
                overflowWrap: "break-word",
              }}
            >
              {topic["hasLabel"]}
            </td>
          </tr>
        </tbody>
      </Table>
      <Stack>
          <TaskComments topicGuid={topic_guid}/>
      </Stack>
    </div>
  );
}

export default TopicTable;
