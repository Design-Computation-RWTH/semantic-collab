import React, { useEffect, useState } from "react";
import {
  Container,
  Avatar,
  Stack,
  Paper,
  Text,
  Group,
  Textarea,
  Tooltip,
  Space,
  ActionIcon,
  Image,
} from "@mantine/core";

import ImageService from "../../../services/ImageService";

import { BsReplyFill } from "react-icons/bs";

import { ViewerContext } from "../../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../../@types/dcwebviewer";
import {
  getAccessToken,
} from "../../../services/BcfOWL_Endpoint";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";

type CommentProps = {
    topicGuid: string
};

export default function TopicComments(props: CommentProps) {
  const { currentViewpoint } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;
  const [comments, setComments] = useState<any[] | null>(null);
  const [imageList, setImageList] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [topicURI, setTopicURI] = useState<string>(props.topicGuid);

  let bcfowl = new BcfOWL_Endpoint();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {

  }, [])

  function fetchComments() {
    bcfowl
      .getCommentsByTopic(topicURI)
      .then((comments: any) => {
        let tempComments: any[] = [];
        if ("@graph" in comments) {
            comments["@graph"].forEach((node: any) => {
                if (node.hasViewpoint) {
                    if (node.hasViewpoint !== "http://server/unset-base/") {
                        bcfowl.describe(node.hasViewpoint).then((res) => {
                            if (res.hasSnapshot) {
                                let imgload = new ImageService();
                                imgload.getThumbnailData(res.hasGuid).then((imgres) => {
                                    let url = URL.createObjectURL(imgres);
                                    let tempImageList = {...imageList}
                                    tempImageList[node["@id"]] = url;
                                    setImageList(tempImageList)
                                })
                            }
                        }).catch((err) => console.log(err));

                    }
                   
                }
            tempComments.push(node);
          });
        } else if ("@id" in comments) {
          if (comments.hasViewpoint) {
            if (comments.hasViewpoint !== "http://server/unset-base/") {
                bcfowl.describe(comments.hasViewpoint).then((res) => {
                    if (res.hasSnapshot) {
                        let imgload = new ImageService();
                        imgload.getThumbnailData(res.hasGuid).then((imgres) => {
                            let url = URL.createObjectURL(imgres);
                            let tempImageList = {...imageList}
                            tempImageList[comments["@id"]] = url;
                            setImageList(tempImageList)
                        })
                    }
                }).catch((err) => console.log(err));

            }
           
        }
          tempComments.push(comments);
        }

        tempComments.sort((a: any, b: any) => {
          return (
            new Date(a.hasCommentDate).getTime() -
            new Date(b.hasCommentDate).getTime()
          );
        });
        setComments(tempComments);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function init() {
    fetchComments();
  }

  function parseJWT(token: string | undefined) {
    // @ts-ignore
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  function commentList() {
    if (comments !== null) {
      let author = parseJWT(getAccessToken()).URI;

      let commentElements = comments.map((comment: any) => {
        let style: any = { display: "flex" };
        let color = "gray 7";
        if (author === comment.hasAuthor) {
          style = { display: "flex", flexDirection: "row-reverse" };
          color = "#fab005";
        }
        let date = new Date(comment.hasCommentDate);

        let image = (<></>)

        if (comment["@id"] in imageList) {
            image = (<Image fit="contain" src={imageList[comment["@id"]]}></Image>)
        }


        return (
          <Stack spacing="xs" style={style}>
            <Tooltip label={comment.hasAuthor}>
              <Avatar radius="xl" />
            </Tooltip>
            <Paper
              sx={(theme) => ({
                backgroundColor: color,
              })}
              color={"blue"}
              shadow="lg"
              radius="md"
              p="xs"
              withBorder
            >
                {image}
              <Text color={"white"}>{comment.hasComment}</Text>
              <Text size="xs" color="grey">
                {date.toUTCString()}
              </Text>
            </Paper>
          </Stack>
        );
      });
      return commentElements;
    } else {
      return <div />;
    }
  }

  let commentRef =
    React.useRef() as React.MutableRefObject<HTMLTextAreaElement>;

  function sendComment() {
    bcfowl
      .postComment(commentRef.current.value, currentViewpoint, topicURI)
      .then((r) => {
        commentRef.current.value = "";
        init();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <Container px="xs">
      <Stack>
        {commentList()}
        <Group noWrap spacing="xs">
          <Textarea
            ref={commentRef}
            placeholder="Enter a comment"
            radius="lg"
            size="lg"
          />
          <ActionIcon variant="filled" color="red" onClick={sendComment}>
            <BsReplyFill size={"100px"} />
          </ActionIcon>
        </Group>
        <Space />
      </Stack>
    </Container>
  );
}
