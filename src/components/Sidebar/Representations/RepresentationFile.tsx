import React, { useEffect, useState } from "react";
// @ts-ignore
import { StoreyViewsPlugin } from "@xeokit/xeokit-sdk";
// @ts-ignore
import PubSub from "pubsub-js";
import { ViewerContext } from "../../../context/dcwebviewerContext";
import { Table, Switch, Stack, Group, Text, Button, ActionIcon } from "@mantine/core";
import {
  DcWebViewerContextType,
  SelectedDocument,
} from "../../../@types/dcwebviewer";

//TODO: Move File Example: https://xeokit.github.io/xeokit-sdk/examples/#BIMOffline_XKT_metadata_moveStoreys

type DocumentType = {
  filename: string;
  id: string;
  documentURL: string;
  selected: boolean;
  spatialRepresentation: any;
};

type RepresentationFilePropsType = {
  data: any;
  document: DocumentType;
};

export default function RepresentationFile(props: RepresentationFilePropsType) {
  const {
    selectedDocument,
    setSelectedDocument,
    viewerDocuments,
    setViewerDocuments,
    viewer,
  } = React.useContext(ViewerContext) as DcWebViewerContextType;

  const [storeys, setStoreys] = useState<any>([]);
  const [checked, setChecked] = useState<boolean>(
    viewerDocuments[props.document.id]
  );

  useEffect(() => {}, []);

  let storeyViewsPlugin: any;

  //Opens the Document Details in the Sidebar
  function showDocumentDetails() {
    props.document.selected = true;

    let currentSelect: SelectedDocument = {
      id: props.document.id,
      url: props.document.documentURL,
      spatial_representation: props.document.spatialRepresentation,
      data: props.data,
      name: props.document.filename,
    };
    setSelectedDocument(currentSelect);

    //Target: Representation.js, onDocumentSelected
    PubSub.publish("SetSelectedDocument", {
      id: props.document.id,
      url: props.document.documentURL,
      spatial_representation: props.document.spatialRepresentation,
      data: props.data,
      name: props.document.filename,
    });
  }

  // Activates / shows the document in the Xeokit environment
  function showDocument() {
    storeyViewsPlugin = new StoreyViewsPlugin(viewer);
    props.document.selected = true;
    //Target: Representation.js, onShowDocument
    PubSub.publish("ShowDocument", {
      id: props.document.id,
      url: props.document.documentURL,
      spatial_representation: props.document.spatialRepresentation,
      data: props.data,
      name: props.document.filename,
    });
    let allStoreys = storeyViewsPlugin.storeys;
    let tempStoreys = [];
    for (let storey in allStoreys) {
      tempStoreys.push(allStoreys[storey]);
    }
    setStoreys(tempStoreys);
  }

  function hideDocument() {
    setStoreys([]);
  }

  function determineEnding() {
    if (props.document.filename) {
      if (props.document.filename.endsWith(".ifc")) {
        return "icon bi-box btn-caia-icon-size";
      } else {
        return "icon bi-file-earmark-pdf btn-caia-icon-size";
      }
    }
  }

  function showStoreys() {
    storeyViewsPlugin = new StoreyViewsPlugin(viewer);
    let storeyRender;

    if (storeys.length === 0) {
      storeyRender = <></>;
    } else {
      storeyRender = storeys.map((s: any) => {
        let storeyName = viewer.metaScene.metaObjects[s.storeyId].name;
        return (
          <Group>
            {storeyName}
            <Switch
              defaultChecked={true}
              onChange={(e) => {
                let singleStorey = viewer.metaScene.metaObjects[s.storeyId];
                let childs = singleStorey.children;
                childs.forEach((child: any) => {
                  if (viewer.scene.objects[child.id]) {
                    viewer.scene.objects[child.id].visible =
                      e.currentTarget.checked;
                  } else {
                  }
                });
              }}
            />
          </Group>
        );
      });
    }
    return storeyRender;
  }

  return (
    <Table>
      <tbody>
        <tr key={props.document.id}>
          <td key={props.document.id + "_TD"} className="file-component">
            <ActionIcon size="xl">
              <i className={determineEnding()} />
            </ActionIcon>
            <Button
              variant="subtle"
              size="md"
              style={{ width: "70%"}}
              onClick={showDocumentDetails}
            >
              <Text size="sm">{props.document.filename}</Text>
            </Button>
            <Switch
              id={props.document.id}
              defaultChecked={false}
              checked={viewerDocuments[props.document.id]}
              size="xl"
              onLabel={"On"}
              offLabel={"Off"}
              onChange={(e) => {
                let tempDocs = viewerDocuments;
                tempDocs[props.document.id] = e.currentTarget.checked;
                setViewerDocuments(tempDocs);
                setChecked(e.target.checked);
                if (e.currentTarget.checked) {
                  showDocument();
                } else {
                  hideDocument();
                  PubSub.publish("DocumentUnSelected", {
                    id: props.document.id,
                  });
                }
              }}
            />
          </td>
        </tr>
      </tbody>
    </Table>
  );
}

RepresentationFile.propTypes = {};
