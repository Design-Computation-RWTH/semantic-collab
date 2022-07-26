import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  SimpleGrid,
  Text,
  Group,
  NumberInput,
  Divider,
  Button,
  Title,
  Center,
  Input,
} from "@mantine/core";
import { ViewerContext } from "../../../context/dcwebviewerContext";
import {
  showNotification,
  updateNotification,
  useNotifications,
} from "@mantine/notifications";
import { DcWebViewerContextType } from "../../../@types/dcwebviewer";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import wkt from "terraformer-wkt-parser";
import { useInputState } from "@mantine/hooks";
import PubSub from "pubsub-js";
import ImageService from "../../../services/ImageService";
import {
  BsFillCheckSquareFill,
  BsFillExclamationSquareFill,
} from "react-icons/bs";

type PlanProps = {};

export default function RepresentationDetailsPlan(props: PlanProps) {
  const notifications = useNotifications();

  const { selectedDocument, setSelectedDocument } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  const { file, setFile } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  const { fileName, setFileName } = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  const [xValue, setXValue] = useInputState(0);
  const [yValue, setYValue] = useInputState(0);
  const [zValue, setZValue] = useInputState(0);

  const [rotation, setRotation] = useInputState(0);

  const [scale, setScale] = useInputState(1);
  const [measuredDistance, setMeasuredDistance] = useInputState(0);
  const [targetDistance, setTargetDistance] = useInputState(0);

  let un_subsel = PubSub.subscribe("MeasurementSet", subMeasurementSet);

  let bPlanCreation: boolean = true;

  if (selectedDocument.name == "new_temp_plan") {
    bPlanCreation = false;
  }

  let bcfowl = new BcfOWL_Endpoint();

  useEffect(() => {
    init();
    return () => {
      PubSub.unsubscribe(un_subsel);

      setXValue(0);
      setYValue(0);
      setZValue(0);

      setRotation(0);

      setScale(1);
      setMeasuredDistance(0);
      setTargetDistance(0);
    };
  }, []);

  function init() {
    if (selectedDocument.name !== "new_temp_plan") {
      setFileName(selectedDocument.name);
      bcfowl
        .describe(selectedDocument.spatial_representation)
        .then((spatial) => {
          // Setting the Transform in the Inputs
          let tempLocation = wkt.parse(spatial.hasLocation) as any;
          setXValue(tempLocation.coordinates[0]);
          setYValue(tempLocation.coordinates[1]);
          setZValue(tempLocation.coordinates[2]);

          let tempRotation = wkt.parse(spatial.hasRotation) as any;
          setRotation(tempRotation.coordinates[2]);

          let tempScale = wkt.parse(spatial.hasScale) as any;
          setScale(tempScale.coordinates[0]);
        });
    } else {
      bPlanCreation = true;
    }
  }

  useEffect(() => {
    //TODO: Enter code for moving plan here

    PubSub.publish("DocumentMoved", {
      id: selectedDocument.id,
      position: [xValue / 10, zValue / 10, yValue / 10],
    });
  }, [xValue, yValue, zValue]);

  useEffect(() => {
    //TODO: Enter code for moving plan here
  }, [scale]);

  useEffect(() => {
    //TODO: Enter code for moving plan here

    PubSub.publish("DocumentRotated", {
      id: selectedDocument.id,
      rotation: [0, 0, rotation],
    });
  }, [rotation]);

  function handleMeasureDistance() {
    PubSub.publish("SetClickMode", {
      clickMode: "MeasureOnce",
    });
  }

  function subMeasurementSet(msg: any, data: any) {
    setMeasuredDistance(Math.round((data.length + Number.EPSILON) * 100) / 100);
  }

  function handleSetDistance() {
    if (targetDistance > 0) {
      let distance = targetDistance / measuredDistance;
      PubSub.publish("DocumentMeasuredScale", {
        id: selectedDocument.id,
        value: distance,
      });
      setScale(distance * scale);
    } else {
      showNotification({
        title: "Set Target Distance",
        message: "Please set your Target Distance first",
      });
    }
  }

  function handleUpload() {
    showNotification({
      title: "Uploading file",
      message: "File is being uploaded",
      id: "UploadingNotification",
      loading: true,
      autoClose: false,
      disallowClose: true,
    });
    let spatial_json = {
      alignment: "center",
      location: {
        x: xValue,
        y: yValue,
        z: zValue,
      },
      rotation: {
        x: 0,
        y: 0,
        z: rotation,
      },
      scale: {
        x: scale,
        y: scale,
        z: scale,
      },
    };
    if (selectedDocument.id !== "new_temp_plan") {
      let bcfowl = new BcfOWL_Endpoint();
      let document_uri = selectedDocument.id;

      bcfowl
        .updateSpatialRepresentation(
          document_uri,
          selectedDocument.spatial_representation,
          spatial_json
        )
        .then((message) => {})
        .catch((err) => {
          console.log(err);
        });
    } else {
      //TODO: Check if name is set correctly. If " " is in name -> replace by "_"
      let imageService = new ImageService();
      let bcfowl = new BcfOWL_Endpoint();

      imageService
        .postFile(file, fileName)
        .then((message) => {
          // let file_url = base_uri + "/files/" + this.project_id + "/" + this.props.newfilename
          bcfowl
            .createDocumentWithSpatialRepresentation(fileName, spatial_json)
            .then((message) => {
              updateNotification({
                id: "UploadingNotification",
                color: "teal",
                title: "Data was uploaded",
                message:
                  "Notification will close in 2 seconds, you can close this notification now",
                icon: <BsFillCheckSquareFill />,
                autoClose: 2000,
              });
            })
            .catch((err) => {
              updateNotification({
                id: "UploadingNotification",
                color: "teal",
                title: "Error uploading the file",
                message: err,
                icon: <BsFillExclamationSquareFill />,
                autoClose: 2000,
              });
              console.log(err);
            });
        })
        .catch((err) => {
          updateNotification({
            id: "UploadingNotification",
            color: "teal",
            title: "Error uploading the file",
            message: err,
            icon: <BsFillExclamationSquareFill />,
            autoClose: 2000,
          });
          console.log(err);
        });
      PubSub.publish("DocumentsViewStateChange", {});
      PubSub.publish("CancelNewDocument", {});
    }
  }

  return (
    <Container>
      <Title order={4}>
        <Input
          disabled={bPlanCreation}
          placeholder="Filename"
          value={fileName}
          onChange={(event: any) => setFileName(event.currentTarget.value)}
        />
      </Title>
      <SimpleGrid spacing="xs">
        <div>
          <Divider my="xs" size="xl" label="Location" />
          <Group spacing="xs">
            <div>
              <Text>X</Text>
              <NumberInput
                stepHoldDelay={500}
                precision={2}
                stepHoldInterval={100}
                value={xValue}
                defaultValue={xValue}
                id={"NumberInputX"}
                onChange={setXValue}
              />
            </div>
            <div>
              <Text>Y</Text>
              <NumberInput
                stepHoldDelay={500}
                precision={2}
                stepHoldInterval={100}
                value={yValue}
                onChange={setYValue}
              />
            </div>
            <div>
              <Text>Z</Text>
              <NumberInput
                stepHoldDelay={500}
                precision={2}
                stepHoldInterval={100}
                value={zValue}
                onChange={setZValue}
              />
            </div>
          </Group>
        </div>
        <div>
          <Divider my="xs" size="xl" label="Rotation" />
          <Group spacing="xs">
            <NumberInput
              stepHoldDelay={500}
              precision={2}
              stepHoldInterval={100}
              value={rotation}
              onChange={setRotation}
            />
          </Group>
        </div>
        <div>
          <Divider my="xs" size="xl" label="Scale" />
          <Group spacing="xs">
            <NumberInput
              stepHoldDelay={500}
              precision={2}
              stepHoldInterval={100}
              disabled
              value={scale}
              onChange={setScale}
            />
            <NumberInput
              stepHoldDelay={500}
              precision={2}
              label={"Measured Distance"}
              disabled={true}
              stepHoldInterval={100}
              value={measuredDistance}
            />
            <NumberInput
              stepHoldDelay={500}
              precision={2}
              label={"Target Distance"}
              stepHoldInterval={100}
              value={targetDistance}
              onChange={setTargetDistance}
            />
          </Group>
        </div>
        <Center>
          <Group>
            <Button onClick={handleMeasureDistance} compact>
              Measure Distance
            </Button>
            <Button onClick={handleSetDistance} compact>
              Set Distance
            </Button>
            <Button onClick={handleUpload} compact>
              Update/Upload
            </Button>
          </Group>
        </Center>
      </SimpleGrid>
    </Container>
  );
}
