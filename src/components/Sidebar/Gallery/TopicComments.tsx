import React, { useEffect, useRef, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import BCFAPI from "../../../services/BCFAPI";

type TopicCommentsListProps = {
  topic_id: string;
};

function TopicCommentsList(props: TopicCommentsListProps) {
  const [comments, setComments] = useState<any>([]);

  if (comments === []) {
    let bcfapi = new BCFAPI();
    bcfapi
      .getTopicComments(props.topic_id)
      .then((value) => {
        setComments(value);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function commentsList(): any[] {
    let inx: number = 0;
    return comments.map((tc: any) => (
      <Accordion.Item eventKey={"topic-comment:" + tc.quid + inx++}>
        <Accordion.Header>Comment: {tc.date}</Accordion.Header>
        <Accordion.Body>
          <p>
            <b>Author:</b> {tc.author}
          </p>
          <p>{tc.comment}</p>
        </Accordion.Body>
      </Accordion.Item>
    ));
  }

  return (
    <div>
      <Accordion defaultActiveKey="0">{commentsList}</Accordion>
    </div>
  );
}

export default TopicCommentsList;
