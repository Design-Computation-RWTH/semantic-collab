import React, { useEffect, useState } from "react";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import { Table } from "react-bootstrap";
// @ts-ignore
import { ReactSession } from "react-client-session";
import PubSub from "pubsub-js";

let topictable_component: any = null;

type TopicTableProps = {
  topic_guid: string;
};

function TopicTable(props: TopicTableProps) {
  const [topic_guid, setTopic_guid] = useState<string>(props.topic_guid);
  const [data, setData] = useState<any>([]);
  let project_id = ReactSession.get("projectid");
  let subSelectedTopicID = PubSub.subscribe("SelectedTopicID", subTopicID);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    return () => {
      PubSub.unsubscribe(subSelectedTopicID);
    };
  }, []);

  function subTopicID(msg: any, data: { topic_guid: string }) {
    if (data.topic_guid === topictable_component.state.topic_guid) return;
    let bcfowl = new BcfOWL_Endpoint();
    topictable_component.setState({ data: [] });
    topictable_component.setState({ topic_guid: data.topic_guid });
    bcfowl
      .getTopicByGUID(topictable_component.state.topic_guid)
      .then((topic) => {
        Object.getOwnPropertyNames(topic).forEach((p) => {
          if (p !== "@context" && !p.startsWith("@")) {
            let val = topic[p];
            let pstr = p;
            if (p.startsWith("has")) {
              pstr = p.slice("has".length);
            }

            let valstr = val.replaceAll(
              "https://caia.herokuapp.com/graph/" +
                topictable_component.project_id +
                "/",
              ""
            );
            valstr = valstr.replaceAll("https://caia.herokuapp.com/users/", "");
            let joined = topictable_component.state.data.concat({
              prop: pstr,
              value: valstr,
            });
            topictable_component.setState({ data: joined });
          }
        });
      });
  }

  function listRows() {
    return data.map((r: { prop: string; value: string }) => (
      <tr key={r.prop}>
        <td className="caia_tablefont">{r.prop}</td>
        <td className="caia_tablefont">{r.value}</td>
      </tr>
    ));
  }

  function init() {
    let bcfowl = new BcfOWL_Endpoint();
    setData([]);
    bcfowl
      .getTopicByGUID(topic_guid)
      .then((topic) => {
        Object.getOwnPropertyNames(topic).forEach((p) => {
          if (p !== "@context" && !p.startsWith("@")) {
            let val: string = topic[p];
            let pstr: string = p;
            if (p.startsWith("has")) {
              pstr = p.slice("has".length);
            }
            if (pstr === "Guid") return;
            if (pstr === "Project") return;

            let valstr: string = val.replaceAll(
              "https://caia.herokuapp.com/graph/" + project_id + "/",
              ""
            );

            if (val.startsWith("https://caia.herokuapp.com/users/")) {
              bcfowl
                .describeUser(val)
                .then((user) => {
                  valstr = user.name;
                  let joined = data.concat({ prop: pstr, value: valstr });
                  setData(joined);
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              if (pstr.includes("Date")) {
                try {
                  let time = new Date(valstr);
                  let valorg = valstr;
                  valstr =
                    time.toLocaleDateString("en-US") +
                    " " +
                    time.toLocaleTimeString("en-US");
                  const weekday = new Array(7);
                  weekday[0] = "Sunday";
                  weekday[1] = "Monday";
                  weekday[2] = "Tuesday";
                  weekday[3] = "Wednesday";
                  weekday[4] = "Thursday";
                  weekday[5] = "Friday";
                  weekday[6] = "Saturday";

                  let day = weekday[time.getDay()];
                  valstr += " " + day;
                  if (valstr === "Invalid Date Invalid Date undefined")
                    valstr = valorg;
                } catch (e) {}
              }
              let joined = data.concat({ prop: pstr, value: valstr });
              setData(joined);
            }
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div>
      <Table striped bordered hover size="sm">
        <tbody>{listRows()}</tbody>
      </Table>
    </div>
  );
}

export default TopicTable;
