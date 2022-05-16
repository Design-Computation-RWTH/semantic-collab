import React, { useEffect, useState } from "react";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import { Table } from "@mantine/core";
// @ts-ignore
import { ReactSession } from "react-client-session";
import PubSub from "pubsub-js";
import dayjs from "dayjs";
import { ViewerContext } from "../../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../../@types/dcwebviewer";

type TopicTableProps = {
  topic_guid: string;
};

function TopicTable(props: TopicTableProps) {
  const [topic_guid, setTopic_guid] = useState<string>(props.topic_guid);
  const [data, setData] = useState<any>([]);
  const [topic, setTopic] = useState<any>({});
  const { extensions } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  useEffect(() => {
    init();
  }, []);

  function getExtensionLabel(extensionKey: string, extensionValue: string) {
    let label = "";
    if (extensions.has(extensionKey)) {
      extensions.get(extensionKey).map((key: any) => {
        if (key[extensionValue]) {
          label = key[extensionValue];
        }
      });
    } else {
      label = "";
    }

    return label;
  }

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
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className={"TopicTable"} style={{ display: "flex", width: "100%" }}>
      <Table
        style={
          {
            /*width: "100%"*/
          }
        }
        striped={true}
      >
        <tbody>
          <tr key="TitleRow" style={{ display: "flex" }}>
            <td
              key={"TitleKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Title
            </td>
            <td
              key={"TitleValue"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {topic["hasTitle"]}
            </td>
          </tr>
          <tr key="AuthorRow" style={{ display: "flex" }}>
            <td
              key={"AuthorKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Author
            </td>
            <td
              key={"AuthorValue"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {topic["hasCreationAuthor"]}
            </td>
          </tr>
          <tr key="DateRow" style={{ display: "flex" }}>
            <td
              key={"DateKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Creation Date
            </td>
            <td
              key={"DateValue"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {dayjs(topic["hasCreationDate"]).toString()}
            </td>
          </tr>
          <tr key="ModAuthorRow" style={{ display: "flex" }}>
            <td
              key={"ModAuthorKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Modified By
            </td>
            <td
              key={"ModAuthorValue"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {topic["hasModifiedAuthor"]}
            </td>
          </tr>
          <tr key="StatusRow" style={{ display: "flex" }}>
            <td
              key={"StatusKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Status
            </td>
            <td
              key={"StatusValue"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {getExtensionLabel("bcfOWL:TopicStatus", topic["hasTopicStatus"])}
            </td>
          </tr>
          <tr key="PriorityRow" style={{ display: "flex" }}>
            <td
              key={"PriorityKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Priority
            </td>
            <td
              key={"PriorityValueKey"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {getExtensionLabel("bcfOWL:Priority", topic["hasPriority"])}
            </td>
          </tr>
          <tr key="TypeRow" style={{ display: "flex" }}>
            <td
              key={"TypeKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Type
            </td>
            <td
              key={"StatusValue"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {getExtensionLabel("bcfOWL:TopicType", topic["hasTopicType"])}
            </td>
          </tr>
          <tr key="LabelRow" style={{ display: "flex" }}>
            <td
              key={"LabelKey"}
              style={{ display: "flex", maxWidth: "150px", minWidth: "150px" }}
            >
              Labels
            </td>
            <td
              key={"LabelValue"}
              style={{
                maxWidth: "300px",
                minWidth: "150px",
                overflowWrap: "break-word",
              }}
            >
              {topic["hasLabel"]}
            </td>
          </tr>

          {/*listRows()*/}
        </tbody>
      </Table>
    </div>
  );
}

export default TopicTable;
