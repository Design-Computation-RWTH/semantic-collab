import React, { useEffect, useState, useRef } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import {
  Container,
  Image,
  SimpleGrid,
  ScrollArea,
  Button,
  Modal,
  Drawer,
  Stack,
  Select,
  Group,
  MultiSelect,
} from "@mantine/core";

import dayjs from "dayjs";

import { DatePicker, DateRangePicker } from "@mantine/dates";

import ImageService from "../../services/ImageService";
import BCFAPI from "../../services/BCFAPI";

import TopicTable from "./Gallery/TopicTable";
import PubSub from "pubsub-js";
import fileDownload from "js-file-download";
import {
  ViewPointFile,
  PerspectiveCamera,
  Point,
  VisualizationInfo,
  MarkupFile,
  Markup,
  Topic,
} from "../../services/types/BCFXML_Types";
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";
import { set } from "js-cookie";
import bcfOWL_Endpoint from "../../services/BcfOWL_Endpoint";
var xml_convert = require("xml-js");
(window as any).global = window;

// for the JSON-XML conversion:
// @ts-ignore
window.Buffer = window.Buffer || require("buffer").Buffer;

// To create BCF XML ZIP
var JSZip = require("jszip");

class SnapShotThumbnail {
  private uri: string;
  private guid: any;
  private topic_guid: any;

  constructor(thumbnail_uri: string, guid: any, topic_guid: any) {
    this.uri = thumbnail_uri;
    this.guid = guid;
    this.topic_guid = topic_guid;
  }
}

export default function CAIA_Gallery_Tab() {
  const [openDrawer, setOpenDrawer] = useState(false);
  //const [screen, setScreen] = useState<number>(0);
  const [opened, setOpened] = useState(false);

  //const [viewpoints, setViewpoints] = useState<any[]>([]);

  // Setting up filter as states
  const [topicType, setTopicType] = useState<string>("None");
  const [topicStatus, setTopicStatus] = useState<string>("None");
  const [topicStage, setTopicStage] = useState<string>("None");
  const [topicPriority, setTopicPriority] = useState<string>("None");
  const [topicAssigned, setTopicAssigned] = useState<string>("None");
  const [topicAuthor, setTopicAuthor] = useState<string>("None");
  const [topicModAuthor, setTopicModAuthor] = useState<string>("None");
  const [topicLabels, setTopicLabels] = useState<string[]>(["None"]);
  const [topicCreationDate, setTopicCreationDate] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [topicModifiedDate, setTopicModifiedDate] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [topicDueDate, setTopicDueDate] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  let bcfapi = new BCFAPI();

  const {
    viewer,
    extensions,
    users,
    imageList,
    setImageList,
    galleryScreen,
    setGalleryScreen,
    activeGalleryTopic,
    setActiveGalleryTopic,
    largeGalleryImg,
    setLargeGalleryImg,
  } = React.useContext(ViewerContext) as DcWebViewerContextType;

  function gallery() {
    let gallery_content;
    if (galleryScreen === 0) {
      gallery_content = (
        <div>
          <SimpleGrid
            style={{ padding: 10 }}
            cols={4}
            spacing="xs"
            breakpoints={[
              { maxWidth: 1600, cols: 3, spacing: "xs" },
              { maxWidth: 1200, cols: 2, spacing: "xs" },
              { maxWidth: 800, cols: 1, spacing: "xs" },
            ]}
          >
            {imageList}
          </SimpleGrid>
        </div>
      );
    }
    if (galleryScreen === 1) {
      gallery_content = (
        <div
          className={"GalleryContent"}
          style={{
            width: "100%",
            maxWidth: "100%",
            //justifyContent: "center",
            //display: "flex",
          }}
        >
          <Container style={{ width: "100%", maxWidth: "100%" }}>
            <div>
              {/*  //TODO variant="black" does not exist
                                                 // @ts-ignore */}
              <CloseButton onClick={() => setGalleryScreen(0)} />
            </div>

            <Modal
              size={"720"}
              opened={opened}
              onClose={() => setOpened(false)}
            >
              <Image
                width={700}
                height={700}
                fit="contain"
                src={largeGalleryImg}
                withPlaceholder
              />
            </Modal>

            <Button
              style={{
                height: 300,
                width: 300,
                justifyContent: "center",
                display: "flex",
                backgroundColor: "#00000000",
              }}
              onClick={() => {
                setOpened(true);
              }}
            >
              <Image
                width={300}
                height={300}
                fit="contain"
                src={largeGalleryImg}
                withPlaceholder
              />
            </Button>
            <TopicTable topic_guid={activeGalleryTopic} />
          </Container>
        </div>
      );
    }
    return gallery_content;
  }

  useEffect(() => {
    init();
    return () => {
      //setImageList([]);
      //setLarge_image_uri("Icon_v2.svg");
      //setActive_topic(null);
      //setGalleryScreen(0);
    };
  }, []);

  // let viewpoints: any[] = [];
  function init() {
    let bcfOWL = new bcfOWL_Endpoint();
    //TODO: Make filter "state" for this file
    let filter: string[] = [];

    if (imageList.length === 0) {
      bcfOWL
        .getFilteredViepoints(filter)
        .then((graph) => {
          ViewpointsResponse(graph);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function ViewpointsResponse(Response: any) {
    //TODO: If the graph returns just one object, we cannot check for @graph
    let value;
    if (Response["@graph"]) {
      value = Response["@graph"];
    } else {
      value = [Response];
    }
    let imageservice: ImageService = new ImageService();
    let joined: any[] = [];

    value.forEach((viewpoint: any) => {
      console.log("1");
      let snapshot = imageservice.getThumbnailData(viewpoint.hasGuid);
      snapshot.then((img: any) => {
        if (img.size > 0) {
          console.log("2");
          let url = URL.createObjectURL(img);
          joined.push(
            new SnapShotThumbnail(url, viewpoint.hasGuid, viewpoint.hasTopic)
          );
          fetchImagesList(joined);
        } else {
          console.log("3");
          fetchImagesList(joined);
        }
      });
    });
  }

  // Async operation is much quicker that sync even though it updates the screen many times

  function fetchImagesList(viewpoints_list: any[]) {
    let imageservice: ImageService = new ImageService();

    let tempImageList = viewpoints_list.map((s) => (
      <Image
        width={100}
        height={100}
        radius={5}
        key={s.guid}
        src={s.uri}
        onClick={() => {
          setGalleryScreen(1);

          for (const model in viewer.scene.models) {
            if (model.includes(s.guid)) {
              viewer.scene.models[model].selected = true;
              viewer.cameraFlight.flyTo(model);
            } else {
              viewer.scene.models[model].selected = false;
            }
          }
          console.log(s);
          console.log(s.topic_guid);
          let image = imageservice.getImageData4GUID(s.guid);
          setActiveGalleryTopic(s.topic_guid);
          PubSub.publish("SelectedTopicID", { topic_guid: s.topic_guid });
          image.then((img: any) => {
            if (img.size > 0) {
              let url = URL.createObjectURL(img);
              setLargeGalleryImg(url);
            }
          });
        }}
      />
    ));
    console.log(tempImageList);
    setImageList(tempImageList);
  }

  async function downloadBCF() {
    let options = { compact: true, ignoreComment: true, spaces: 4 };

    var zip = new JSZip();

    let topics: any = await bcfapi.getTopics();
    for (let bcfowl_topic of topics) {
      let topic: Topic = {
        Guid: bcfowl_topic.guid,
        Title: "-",
        CreationDate: bcfowl_topic.creation_date,
        CreationAuthor: bcfowl_topic.creation_author,
        documentReference: [],
        relatedTopic: [],
      };
      let markup: Markup = {
        Header: { File: [] },
        Topic: topic,
        Comment: [],
        Viewpoints: [],
      };
      let markupFile: MarkupFile = { Markup: markup };

      let markup_content = xml_convert.json2xml(markupFile, options);
      zip.file(
        bcfowl_topic.guid + "/markup.bc.bcfv",
        '<?xml version="1.0" encoding="UTF-8"?>\n' + markup_content
      );
      let value: any[] = await bcfapi.getTopicViewPoints(bcfowl_topic.guid);

      value.forEach((viewpoint: any) => {
        let vp: VisualizationInfo = {
          Guid: viewpoint.guid,
          Components: {
            Visibility: {},
            Selection: [],
            Coloring: [],
          },
        };
        let cameraViewPoint: Point = {
          X: viewpoint.perspective_camera.camera_view_point.x,
          Y: viewpoint.perspective_camera.camera_view_point.y,
          Z: viewpoint.perspective_camera.camera_view_point.z,
        };
        let cameraDirection: Point = {
          X: viewpoint.perspective_camera.camera_direction.x,
          Y: viewpoint.perspective_camera.camera_direction.y,
          Z: viewpoint.perspective_camera.camera_direction.z,
        };
        let cameraUpVector: Point = {
          X: viewpoint.perspective_camera.camera_up_vector.x,
          Y: viewpoint.perspective_camera.camera_up_vector.y,
          Z: viewpoint.perspective_camera.camera_up_vector.z,
        };
        let perspectiveCamera: PerspectiveCamera = {
          CameraViewPoint: cameraViewPoint,
          CameraDirection: cameraDirection,
          CameraUpVector: cameraUpVector,
          FieldOfView: viewpoint.perspective_camera.field_of_view,
        };
        vp.PerspectiveCamera = perspectiveCamera;
        let vpf: ViewPointFile = { VisualizationInfo: vp };
        let content = xml_convert.json2xml(vpf, options);
        zip.file(
          bcfowl_topic.guid + "/viewpoint.bcfv",
          '<?xml version="1.0" encoding="UTF-8"?>\n' + content
        );
      });
    }
    zip
      .generateAsync({ type: "uint8array" })
      .then((z: string | ArrayBuffer | ArrayBufferView | Blob) => {
        fileDownload(z, "BCF.zip");
      });
  }

  // Setting all filters to "None" | null
  function resetFilter() {
    setTopicType("None");
    setTopicStatus("None");
    setTopicPriority("None");
    setTopicStage("None");
    setTopicAssigned("None");
    setTopicModAuthor("None");
    setTopicAuthor("None");
    setTopicCreationDate([null, null]);
    setTopicModifiedDate([null, null]);
    setTopicDueDate([null, null]);
    setTopicLabels(["None"]);
    //setTopicDate("None");
  }

  // Applying filter and building query for SPARQL
  function applyFilter() {
    let bcfOWL = new bcfOWL_Endpoint();
    let filter: string[] = [];
    // If a property is "None"|null ignore it for SPARQL
    /* Filter(?date >= "2022-05-11T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> &&  ?date <= "2022-05-11T23:59:59.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>) */
    if (topicType != "None") {
      filter.push("bcfOWL:hasTopicType <" + topicType + "> ;");
    }
    if (topicStatus != "None") {
      filter.push("bcfOWL:hasTopicStatus <" + topicStatus + "> ;");
    }
    if (topicPriority != "None") {
      filter.push("bcfOWL:hasPriority <" + topicPriority + "> ;");
    }
    if (topicStage != "None") {
      filter.push("bcfOWL:hasStage <" + topicStage + "> ;");
    }
    if (topicAssigned != "None") {
      filter.push("bcfOWL:hasAssignedTo <" + topicAssigned + "> ;");
    }
    if (topicModAuthor != "None") {
      filter.push("bcfOWL:hasModifiedAuthor <" + topicModAuthor + "> ;");
    }
    if (topicAuthor != "None") {
      filter.push("bcfOWL:hasModifiedAuthor <" + topicAuthor + "> ;");
    }

    bcfOWL.getFilteredViepoints(filter).then((graph) => {
      ViewpointsResponse(graph);
    });
  }

  let topicTypeData = [];
  if (extensions.has("bcfOWL:TopicType")) {
    topicTypeData = extensions.get("bcfOWL:TopicType").map((e: any) => {
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
  if (extensions.has("bcfOWL:Label")) {
    topicLabelData = extensions.get("bcfOWL:Label").map((e: any) => {
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
  if (extensions.has("bcfOWL:Priority")) {
    topicPriorityData = extensions.get("bcfOWL:Priority").map((e: any) => {
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
  if (extensions.has("bcfOWL:Stage")) {
    topicStageData = extensions.get("bcfOWL:Stage").map((e: any) => {
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

  let drawer = (
    <div
      style={{
        display: "flex",
        height: "95%",
        width: "100%",
        maxWidth: "100%",
        flexDirection: "column",
      }}
    >
      <ScrollArea
        style={{ height: "100%", width: "100%", maxWidth: "100%" }}
        type={"always"}
      >
        <Stack
          justify="flex-start"
          style={{ width: "100%", maxWidth: "100%", minWidth: "400px" }}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
            height: "100%",
          })}
        >
          <Group position="apart" spacing="xs">
            <Select
              styles={{ label: { color: "white" } }}
              label="Select Topic Type"
              data={topicTypeData}
              onChange={(e: string) => {
                setTopicType(e);
              }}
              value={topicType}
            />
            <Select
              styles={{ label: { color: "white" } }}
              label="Select Topic Status"
              data={topicStatusData}
              value={topicStatus}
              onChange={(e: string) => {
                setTopicStatus(e);
              }}
            />
          </Group>
          <Group position="apart" spacing="xs">
            <Select
              styles={{ label: { color: "white" } }}
              label="Select Stage"
              data={topicStageData}
              value={topicStage}
              onChange={(e: string) => {
                setTopicStage(e);
              }}
            />
            <Select
              styles={{ label: { color: "white" } }}
              label="Select Priority"
              data={topicPriorityData}
              value={topicPriority}
              onChange={(e: string) => {
                setTopicPriority(e);
              }}
            />
          </Group>
          <Group position="apart" spacing="xs">
            <Select
              styles={{ label: { color: "white" } }}
              label="Select Author"
              data={authorData}
              value={topicAuthor}
              onChange={(e: string) => {
                setTopicAuthor(e);
              }}
            />
            <Select
              styles={{ label: { color: "white" } }}
              label="Select Modification Author"
              data={authorData}
              value={topicModAuthor}
              onChange={(e: string) => {
                setTopicModAuthor(e);
              }}
            />
          </Group>
          <Group position="apart" spacing="xs">
            <Select
              styles={{ label: { color: "white" } }}
              label="Select Assigned To"
              data={assignedData}
              value={topicAssigned}
              onChange={(e: string) => {
                setTopicAssigned(e);
              }}
            />
            <DateRangePicker
              label="Due Date"
              allowSingleDateInRange={true}
              value={topicDueDate}
              styles={{
                label: { color: "white" },
              }}
              placeholder="Pick dates range"
              onChange={(e: any) => {
                setTopicDueDate(e);
              }}
            />
          </Group>
          <Group position="apart" spacing="xs">
            <MultiSelect
              styles={{ label: { color: "white" } }}
              label="Select Label"
              data={topicLabelData}
              value={topicLabels}
              onChange={(e: string[]) => {
                setTopicLabels(e);
              }}
            />
            <DateRangePicker
              label="Creation Date"
              allowSingleDateInRange={true}
              value={topicCreationDate}
              styles={{
                label: { color: "white" },
              }}
              placeholder="Pick dates range"
              onChange={(e: any) => {
                setTopicCreationDate(e);
              }}
            />
          </Group>
          <Group position="apart" spacing="xs">
            <DateRangePicker
              label="Modified Date"
              allowSingleDateInRange={true}
              value={topicModifiedDate}
              styles={{
                label: { color: "white" },
              }}
              placeholder="Pick dates range"
              onChange={(e: any) => {
                setTopicModifiedDate(e);
              }}
            />
          </Group>
        </Stack>
      </ScrollArea>
      <Button onClick={applyFilter}>Apply Filter</Button>
      <Button onClick={resetFilter}>Reset Filter</Button>
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ScrollArea
        style={{ flex: 1, width: "100%", maxWidth: "100%" }}
        offsetScrollbars
      >
        {gallery()}
      </ScrollArea>
      <Drawer
        opened={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title="Apply Image Filter"
        position="right"
        padding="xl"
        size="580px"
        styles={{ title: { color: "white" } }}
      >
        {drawer}
      </Drawer>
      <Container
        style={{
          height: "5%",
          display: "flex",
          width: "100%",
          justifyContent: "center",
        }}
        sx={(theme) => ({ backgroundColor: theme.colors.dark })}
      >
        <button
          className="btn-caia-icon"
          onClick={() => {
            setOpenDrawer(true);
          }}
        >
          <i className="icon bi-funnel btn-caia-icon-size" />
        </button>
        <button className="btn-caia-icon">
          <i className="icon bi-plus-square btn-caia-icon-size" />
        </button>
        <button
          className="btn-caia-icon"
          onClick={() => {
            downloadBCF();
          }}
        >
          <span
            onClick={() => {
              downloadBCF();
            }}
            className="bcficon"
          />
        </button>
      </Container>
    </div>
  );
}
