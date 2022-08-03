import React, { useEffect, useState } from "react";
import BcfOWL_Endpoint from "../../services/BcfOWL_Endpoint";
import { ReactSession } from "react-client-session";
import RepresentationDetails from "./Representations/RepresentationDetails";
import PubSub from "pubsub-js";
import { showNotification, updateNotification } from "@mantine/notifications";
import fileToArrayBuffer from "file-to-array-buffer";
import {
  BsFillCheckSquareFill,
  BsFillExclamationSquareFill,
} from "react-icons/bs";
import RepresentationFile from "./Representations/RepresentationFile";
import ImageService from "../../services/ImageService";
import { ActionIcon, Container, SimpleGrid, CloseButton, ScrollArea } from "@mantine/core";
// @ts-ignore
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";

// const laz = require("C:\\GitHub\\dc-web-viewer\\src\\Granusturm-2-3-1.laz");

type RepresentationsProps = {};

type SelectedDocument = {
  id: string;
  url: string;
  spatial_representation: any;
  data: any;
  name: string;
};

type bcfOWL_DocumentType = {
  "@id": string;
  "@type": string;
  hasDocumentURL: string;
  hasFilename: string;
  hasGuid: string;
  hasProject: string;
  hasSpatialRepresentation: string;
  [key: string]: string;
};

export default function CAIA_Representations_Tab(props: RepresentationsProps) {
  //const [checked, setChecked] = useState(false);
  const [documents, setDocuments] = useState<bcfOWL_DocumentType[]>([]);
  const [selected_ids, setSelected_ids] = useState<string[]>([]);
  const [selected_document, setSelected_document] = useState<string>("");
  const [selected_documentName, setSelected_documentName] = useState<string>("");
  const [new_file_name, setNew_file_name] = useState("");

  const { viewer, file, setFile, representationScreen, setRepresentationScreen, setFileName,
    setSelectedDocument,
    viewerDocuments,
    setViewerDocuments,} = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  //
  let project_id: any = ReactSession.get("projectid");
  let UploadFileFieldRef: any = React.createRef();

  let un_DocumentsViewStateChange: any;
  let un_SetSelectedDocument: any;
  let un_ShowDocument: any;
  let un_UnSelectDocument: any;

  useEffect(() => {
    init();
    return () => {
      setDocuments([]);
      setSelected_ids([]);
      setRepresentationScreen(0);
      setSelected_document("");
      setNew_file_name("");
    };
  }, []);

  useEffect(() => {
    return () => {
      PubSub.unsubscribe(un_DocumentsViewStateChange);
      PubSub.unsubscribe(un_SetSelectedDocument);
      PubSub.unsubscribe(un_ShowDocument);
      PubSub.unsubscribe(un_UnSelectDocument);
    };
  }, []);

  function init() {
    un_DocumentsViewStateChange = PubSub.subscribe(
      "DocumentsViewStateChange",
      onDocumentsViewStateChange
    );
    un_SetSelectedDocument = PubSub.subscribe(
      "SetSelectedDocument",
      onDocumentSelected
    );
    un_ShowDocument = PubSub.subscribe("ShowDocument", onShowDocument);
    un_UnSelectDocument = PubSub.subscribe(
      "DocumentUnSelected",
      onDocumentUnSelected
    );

    //TODO: Last Update is preventing force refreshing
    let lastUpdate = ReactSession.get(
      "project_documents_lastime_pid" + project_id
    );
    let thisMoment = new Date().getTime() / 10;
    if (thisMoment - lastUpdate < 10) {
      let value: bcfOWL_DocumentType[] = ReactSession.get(
        "project_documents_pid" + project_id
      );

      setDocuments(value);

      documents.map((d: any) => {
        if (d["@id"]) {
          let tempDocs = viewerDocuments;
          if (!tempDocs[d["@id"]]) {
            tempDocs[d["@id"]] = false;
          }
          setViewerDocuments(tempDocs);
        }
      });
      return;
    }
    let bcfowl = new BcfOWL_Endpoint();
    bcfowl
      .getDocuments()
      .then((value) => {
        if (value["@graph"]) value = value["@graph"];
        if (!Array.isArray(value)) value = [value];
        setDocuments(value);
        ReactSession.set("project_documents_pid" + project_id, value);
        ReactSession.set(
          "project_documents_lastime_pid" + project_id,
          thisMoment
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function onDocumentSelected(msg: any, data: SelectedDocument) {
    setSelected_document(data.id);
    
    setSelected_documentName(data.name);
    setRepresentationScreen(1);
    PubSub.publish("ShowDocument", {
      id: data.id,
      url: data.url,
      spatial_representation: data.spatial_representation,
      data: data.data,
      name: data.name,
    });
  }

  function onShowDocument(
    msg: any,
    data: {
      id: any;
      spatial_representation: string;
      url: any;
      data: any;
      name: any;
    }
  ) {
    let ids = selected_ids;
    if (!ids.includes(data.id)) {
      ids.push(data.id);
      setSelected_ids(ids);
    }
    let bcfowl = new BcfOWL_Endpoint();
    bcfowl
      .describe(data.spatial_representation)
      .then((spatial_representation) => {
        PubSub.publish("DocumentSelected", {
          id: data.id,
          url: data.url,
          spatial_representation: spatial_representation,
          data: data.data,
          name: data.name,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function onDocumentUnSelected(msg: any, data: { id: any }) {
    let ids = selected_ids;
    if (ids.includes(data.id)) {
      ids = ids.filter((item) => item !== data.id);
      setSelected_ids(ids);
    }
  }

  function onDocumentsViewStateChange() {
    setRepresentationScreen(0);
    init();
  }

  const onFileSelectionChangeHandler = (event: any) => {
    let file = event.target.files[0];
    fileToArrayBuffer(file).then((data) => {
      let file_extension = file.name.split(".").pop().toLowerCase();
      switch (file_extension) {
        case "ifc":
          showNotification({
            title: "Uploading file",
            message: "File is being uploaded",
            id: "UploadingNotification",
            loading: true,
            autoClose: false,
            disallowClose: true,
          });
          if (data.byteLength < 50000000) {
            setNew_file_name(file.name);
            setFile(file);
            setSelected_document(file.name);
            let spatial_json = {
              alignment: "center",
              location: {
                x: 0,
                y: 0,
                z: 0,
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
              },
              scale: {
                x: 1,
                y: 1,
                z: 1,
              },
            };
            let imageService = new ImageService();
            let bcfowl = new BcfOWL_Endpoint();

            imageService
              .postFile(file, file.name)
              .then((message) => {
                bcfowl
                  .createDocumentWithSpatialRepresentation(
                    file.name,
                    spatial_json
                  )
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
          } else {
            PubSub.publish("Alert", {
              type: "warning",
              message: "Currently just files under 100mb are supported",
              title: "File size exceeded",
            });
          }

          break;
        // Important to keep case sensitivity in mind!
        case "png" || "PNG":
          // We send the raw data to the XeoKitView:
          PubSub.publish("NewUploadedPlan", {
            name: file.name,
            rawvalue: file,
          });
          setNew_file_name(file.name);
          setFileName(file.name);
          setFile(file);
          setSelected_document("new_temp_plan");
          let tempSelectedDocument: SelectedDocument = {
            id: "new_temp_plan",
            url: "",
            spatial_representation: "",
            data: "",
            name: "new_temp_plan",
          };
          setSelectedDocument(tempSelectedDocument);
          setRepresentationScreen(1);
          break;
        case "pdf":
          console.log("picked pdf");
          break;
        default:
          console.log("picked default");
          break;
      }
    });
  };

  function document_list() {
    return documents.map((d: any) => {
      if (d["@id"]) {
        let selectedId = selected_ids.includes(d["@id"]);

        return (
          <RepresentationFile
            data={d}
            key={d["@id"] + "_File"}
            document={{
              filename: d.hasFilename,
              id: d["@id"],
              documentURL: d["hasDocumentURL"],
              selected: selectedId,
              spatialRepresentation: d["hasSpatialRepresentation"],
            }}
          />
        );
      } else {
        return <div />;
      }
    });
  }

  function leftPanel() {
    let leftPanel;
    if (representationScreen === 0) {
      leftPanel = (
        <div>
          <SimpleGrid cols={1} spacing="xs">
            {document_list()}
          </SimpleGrid>
        </div>
      );
    } else {
      let details: any;
      //TODO: Add IFC Details
      if (selected_documentName.endsWith(".ifc")){
        details = (          <RepresentationDetails
          selectedDocument={selected_document}
          newFileName={new_file_name}
          file={file}
          viewer={viewer}
        />)
      } else if (selected_documentName.endsWith(".png")){
        details = (          <RepresentationDetails
          selectedDocument={selected_document}
          newFileName={new_file_name}
          file={file}
          viewer={viewer}
        />)
      } else {
        details = (          <RepresentationDetails
          selectedDocument={selected_document}
          newFileName={new_file_name}
          file={file}
          viewer={viewer}
        />)
      }
      leftPanel = (
        <div>
          <CloseButton
            onClick={() => {
              PubSub.publish("CancelNewDocument", {});
              setRepresentationScreen(0);
            }}
          />
          {details}
        </div>
      );
    }
    return leftPanel;
  }

  return (
    <div className="caia-fill">
      <ScrollArea style={{height:"100%"}}>{leftPanel()}</ScrollArea>
      <Container
                style={{
                  height: "5%",
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
      >
        <ActionIcon
          className="btn-caia-icon"
          title="Refresh List"
          onClick={() => {
            init();
            //alert("Test alert. ");
          }}
        >
          <i className=" bi-arrow-clockwise" />
        </ActionIcon>
        <ActionIcon
          title="Upload Spatial Representation"
          onClick={() => {
            UploadFileFieldRef.current.click();
          }}
        >
          <i className=" bi-box-arrow-up" />
        </ActionIcon>
          <input
            id="file-input"
            type="file"
            ref={UploadFileFieldRef}
            className="invisible"
            onChange={onFileSelectionChangeHandler}
          />
      </Container>
    </div>
  );
}
