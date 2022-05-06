import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import Figure from "react-bootstrap/Figure";
import ImageService from "../../../services/ImageService";
import BCFAPI from "../../../services/BCFAPI";

export const getAccessToken = () => Cookies.get("access_token");
type TopicViewpointsListProps = {
  topic_id: string;
};

type TopicViewpointsListState = {
  viewpoints: any[];
  snapshots: any[];
  topic_id: string;
};

function TopicViewpointsList(props: TopicViewpointsListProps) {
  const [viewpoints, setviewpoints] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [topic_id, setTopic_id] = useState(props.topic_id);

  useEffect(() => {
    init();
  }, []);

  function init() {
    let imageservice: ImageService = new ImageService();
    let bcfapi = new BCFAPI();
    bcfapi
      .getTopicViewPoints(topic_id)
      .then((value: any) => {
        value.forEach((tv: { guid: string }) => {
          let snapshot = imageservice.getThumbnailData(tv.guid);
          snapshot.then((img) => {
            let url: any = URL.createObjectURL(img);
            if (img.size > 0) {
              let joined = snapshots.concat(url);
              setSnapshots(joined);
            }
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function listItems() {
    return snapshots.map((s: any) => (
      <Figure key={"topic-image:" + s.guid}>
        <Figure.Image width={180} height={180} alt="171x180" src={s} />
      </Figure>
    ));
  }

  return <div>{listItems()}</div>;
}

export default TopicViewpointsList;
