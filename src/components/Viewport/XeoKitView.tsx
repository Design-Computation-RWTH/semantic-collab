import React, { useEffect } from "react";
import { Container, Switch } from "@mantine/core";
// @ts-ignore

import {
  Viewer,
  XKTLoaderPlugin,
  AnnotationsPlugin,
  GLTFLoaderPlugin,
  WebIFCLoaderPlugin,
  DistanceMeasurementsPlugin,
  buildGridGeometry,
  VBOGeometry,
  NavCubePlugin,
  Texture,
  buildPlaneGeometry,
  ReadableGeometry,
  Mesh,
  PhongMaterial,
  Node, // @ts-ignore
} from "@xeokit/xeokit-sdk";

import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";
import BcfOWL_Endpoint from "../../services/BcfOWL_Endpoint";
import ImageService from "../../services/ImageService";
import PubSub from "pubsub-js";

import Sidebar from "../Sidebar/Sidebar";

const wkt = require("terraformer-wkt-parser");

let annotation_instance: any = null;
let NavCubeInst: any = null;
let distanceMeasurements_instance: any = null;
let ifcdata: any = null;
let newplandata: any = null;
let cameraControl: any = null;

// Since we don't have Enums in JS, we have to fall back here to Strings. Current Click Modes are:
// - Select (for selecting/picking objects in the Viewer) Default
// - Measure (for measuring Distances in the Viewer)
// - MeasureOnce (for handling a one time measurement)

class MyDataSource {
  // Gets the contents of the given IFC file in an arraybuffer
  getIFC(src: any, ok: any, error: any) {
    //ok(this.buffer)
    ok(ifcdata);
    /*if(ifcdata)
            ok(ifcdata)
        else
            error("No IFC Data")*/
  }
}

export default function XeoKitView() {
  const {
    setViewer,
    setGalleryScreen,
    setActiveGalleryTopic,
    setLargeGalleryImg,
    setActiveTab,
    lastSelection,
  } = React.useContext(ViewerContext) as DcWebViewerContextType;

  let imageservice = new ImageService();

  let viewer: Viewer;

  let documentNodes: any;
  let documents: any;
  documents = new Set();
  documentNodes = {};

  let clickMode = "Select";

  let un_subsel: any;
  let un_subclick: any;
  let un_subdocun: any;
  let un_docmov: any;
  let un_docmeasca: any;
  let un_docrot: any;
  let un_docsca: any;
  let un_newuplifc: any;
  let un_newuplplan: any;
  let un_cancelnewdocu: any;
  let un_changeViewMode: any;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    return () => {
      PubSub.unsubscribe(un_subsel);
      PubSub.unsubscribe(un_subdocun);
      PubSub.unsubscribe(un_docmov);
      PubSub.unsubscribe(un_docrot);
      PubSub.unsubscribe(un_docsca);
      PubSub.unsubscribe(un_newuplifc);
      PubSub.unsubscribe(un_subclick);
      PubSub.unsubscribe(un_docmeasca);
      PubSub.unsubscribe(un_newuplplan);
      PubSub.unsubscribe(un_cancelnewdocu);
      PubSub.unsubscribe(un_changeViewMode);

      //documents = new Set();
      //documentNodes = {};
      viewer.destroy();
      //
    };
  }, []);

  function init() {
    un_subsel = PubSub.subscribe("DocumentSelected", subDocumentSelected);
    un_subclick = PubSub.subscribe("SetClickMode", subSetClickMode);
    un_subdocun = PubSub.subscribe("DocumentUnSelected", DocumentUnSelected);
    un_docmov = PubSub.subscribe("DocumentMoved", subDocumentMoved);
    un_docmeasca = PubSub.subscribe(
      "DocumentMeasuredScale",
      subDocumentMeasuredScale
    );
    un_docrot = PubSub.subscribe("DocumentRotated", subDocumentRotated);
    un_docsca = PubSub.subscribe("DocumentScaled", subDocumentScaled);
    un_newuplifc = PubSub.subscribe("NewUploadedIFC", subNewUploadedIFC);
    un_newuplplan = PubSub.subscribe("NewUploadedPlan", subNewUploadedPlan);
    un_cancelnewdocu = PubSub.subscribe(
      "CancelNewDocument",
      subCancelNewDocument
    );
    un_changeViewMode = PubSub.subscribe("ChangeViewMode", changeViewMode);

    viewer = new Viewer({
      canvasId: "viewport_canvas",
      transparent: true,
      saoEnabled: true,
    });

    setViewer(viewer);

    distanceMeasurements_instance = new DistanceMeasurementsPlugin(viewer);

    annotation_instance = new AnnotationsPlugin(viewer, {
      //container: document.getElementById("viewport_canvas"),
      // Default HTML template for marker position
      markerHTML:
        "<div class='annotation-marker' style='background-color: {{markerBGColor}};'>{{glyph}}</div>",

      // Default HTML template for label
      labelHTML:
        "<div class='annotation-label' style='background-color: {{labelBGColor}};'>" +
        "<div class='annotation-title'>{{title}}</div><div class='annotation-desc'>{{description}}</div></div>",

      // Default values to insert into the marker and label templates
      values: {
        markerBGColor: "red",
        labelBGColor: "red",
        glyph: "X",
        title: "Untitled",
        description: "No description",
      },
    });

    new Mesh(viewer.scene, {
      geometry: new VBOGeometry(
        viewer.scene,
        buildGridGeometry({
          size: 1000,
          divisions: 100,
        })
      ),
      position: [0, 0, 0],
      collidable: false,
    });

    cameraControl = viewer.cameraControl;

    cameraControl.navMode = "planView";
    cameraControl.followPointer = true;
    viewer.camera.projection = "ortho";

    viewer.camera.eye = [0, 100, 0];
    viewer.camera.look = [0, 0, 0];
    viewer.camera.up = [0, 0, 1];
    viewer.camera.right = [0, 1, 0];
    viewer.camera.orbitYaw(180);

    // let lastViewpointId;
    // let lastSel: any;
    

    let measureCount = 0;

    cameraControl.on("picked", (e: any) => {
      if (clickMode === "Select") {
        const entity = e.entity;
        let viewerScene = viewer.scene.objects;
        for (const Element in viewerScene) {
          viewerScene[Element].selected = false;
        }
        entity.selected = true;

        //Don't delete this console.log
        console.log("entity", entity);
        const metaObj = viewer.metaScene.metaObjects[entity.id];
        //Don't delete this console.log
        console.log(metaObj);

        let bcfOWL = new BcfOWL_Endpoint();

        bcfOWL.describe(entity["_owner"].id).then((r) => {
          if (r["@type"] === "bcfOWL:Viewpoint") {
            let imageservice: ImageService = new ImageService();
            let image = imageservice.getImageData4GUID(r["hasGuid"]);

            setActiveTab(1);
            setGalleryScreen(1);
            setActiveGalleryTopic(r["hasTopic"]);

            image.then((img: any) => {
              if (img.size > 0) {
                let url = URL.createObjectURL(img);

                setLargeGalleryImg(url);
              }
            });
          }
        });
      } else if (clickMode === "MeasureOnce") {
        e.selected = false;

        if (measureCount === 0) {
          measureCount = 1;
        } else if (measureCount === 1) {
          distanceMeasurements_instance.control.deactivate();
          measureCount = 0;
          PubSub.publish("SetClickMode", {
            clickMode: "Select",
          });
          for (let measurement in distanceMeasurements_instance.measurements) {
            let test = distanceMeasurements_instance.measurements;
            PubSub.publish("MeasurementSet", {
              length: test[measurement].length,
            });

            test[measurement].destroy();
          }
        }
      } else {
        e.selected = false;
      }
    });

    cameraControl.on("pickedNothing", (e: any) => {
      if (lastSelection) {
        lastSelection.selected = false;
      }
    });

    NavCubeInst = new NavCubePlugin(viewer, {
      canvasId: "myNavCubeCanvas",
      color: "lightblue",
      visible: false,
      size: 250,
      alignment: "left",
      bottomMargin: 100,
      rightMargin: 10,
    });
  }

  function subSetClickMode(msg: any, data: any) {
    clickMode = data.clickMode;
    if (clickMode === "MeasureOnce") {
      distanceMeasurements_instance.control.activate();
    }
  }

  function subDocumentMoved(msg: any, data: any) {
    let document_uri = data.id;
    let node = documentNodes[document_uri];
    if (node) {
      if (!node.isPerformanceModel) {
        if (data.position != null) {
          node.position = [
            data.position[0],
            data.position[1],
            data.position[2],
          ];
        }
      } else {
        node.origin = [data.position[0], data.position[1], data.position[2]];
      }
    }
  }

  function subDocumentRotated(msg: any, data: any) {
    let document_uri = data.id;
    let node = documentNodes[document_uri];
    if (node) {
      if (data.rotation != null) {
        node.rotation = [0, data.rotation[2], 0];
      }
    }
    //
  }

  function subDocumentScaled(msg: any, data: any) {
    let document_uri = data.id;
    let node = documentNodes[document_uri];
    node.scale = [data.scale, data.scale, data.scale];
  }

  function subDocumentMeasuredScale(msg: any, data: any) {
    let document_uri = data.id;
    let node = documentNodes[document_uri];
    node.scale = [
      node.scale[0] * data.value,
      node.scale[1] * data.value,
      node.scale[2] * data.value,
    ];
  }

  //Load a Document by its URI. If the Document is already in the list (XeoKitView_instance.documents) just make it visible
  //and don't download it again
  function subDocumentSelected(msg: any, data: any) {
    let document_uri = data.id;
    let file_uri = data.url;
    let name = data.name;
    if (!file_uri) {
      return;
    }
    if (documents.has(document_uri)) {
      // Just to avoid double load
      return;
    }
    if (!data) {
      return;
    }
    if (!data.spatial_representation) {
      return;
    }
    if (!data.spatial_representation.hasLocation) {
      // In DC.Chair Test this was missing
      return;
    }

    let location = wkt.parse(data.spatial_representation.hasLocation);
    let rotation = wkt.parse(data.spatial_representation.hasRotation);
    let scale = wkt.parse(data.spatial_representation.hasScale);

    documents.add(document_uri);
    if (viewer) {
      if (documentNodes[document_uri]) {
        documentNodes[document_uri].visible = true;
        viewer.cameraFlight.flyTo(document_uri);
      } else {
        if (file_uri.endsWith(".png") || file_uri.endsWith(".PNG")) {
          let image = imageservice.getImageData4URL(file_uri);
          image.then((imgblob: Blob) => {
            loadDocument(
              document_uri,
              imgblob,
              location,
              rotation,
              scale,
              name
            );
          });
        } else if (file_uri.endsWith(".ifc")) {
          let ifc = imageservice.getImageData4URL(file_uri + ".xkt");
          ifc.then((ifcblob: Blob) => {
            loadIFC(document_uri, ifcblob, location, rotation, scale, name);
          });
        } else {
          PubSub.publish("Alert", {
            type: "warning",
            message: "Unknown file type",
            title: "ERROR: Load Spatial Representation",
          });
        }
      }
    }
  }

  function DocumentUnSelected(msg: any, data: any) {
    if (!documents.has(data.id)) return;
    documents.delete(data.id);

    if (documentNodes[data.id]) {
      documentNodes[data.id].visible = false;
    }
  }

  function subNewUploadedIFC(msg: any, data: any) {
    ifcdata = data.value;
    let ifcLoader = new WebIFCLoaderPlugin(viewer, {
      wasmPath: "",
      dataSource: new MyDataSource(),
    });

    let model = ifcLoader.load({
      id: "ifcModel",
      src: "browser data",
      loadMetadata: true, // Default
      excludeTypes: ["IfcSpace"],
      edges: true,
    });

    model.on("loaded", function () {});
  }

  function subNewUploadedPlan(msg: any, data: any) {
    newplandata = data.rawvalue;

    // first destroy the old new_temp_plan if available!
    if (documentNodes["new_temp_plan"]) {
      let childs = documentNodes["new_temp_plan"].children;
      for (let child in childs) {
        childs[child].destroy();
      }
      documentNodes["new_temp_plan"].destroy();
    }

    // create some dummy coordinates. A new plan should always be at 0|0|0
    let location = wkt.parse("POINT Z(0 0 0)");
    let rotation = wkt.parse("POINT Z(0 0 0)");
    let scale = wkt.parse("POINT Z(1 1 1)");

    // use the same function as for the loading of existing documents
    loadDocument(
      "new_temp_plan",
      newplandata,
      location,
      rotation,
      scale,
      "TempName"
    );
    PubSub.publish("UploadedPlanCreated");
  }

  function subCancelNewDocument(msg: any, data: any) {
    // destroy "new_temp_plan" if operation gets canceled!
    if (documentNodes["new_temp_plan"]) {
      let childs = documentNodes["new_temp_plan"].children;
      for (let child in childs) {
        childs[child].destroy();
      }
      documentNodes["new_temp_plan"].destroy();
    }

    newplandata = null;
    ifcdata = null;
  }

  function changeViewMode(msg: any, data: any) {
    if (cameraControl) {
      if (cameraControl.navMode === "planView") {
        cameraControl.navMode = "orbit";
        viewer.camera.projection = "perspective";
        NavCubeInst.setVisible(true);
      } else if (cameraControl.navMode === "orbit") {
        cameraControl.navMode = "planView";
        viewer.camera.projection = "ortho";
        viewer.camera.eye = [0, 100, 0];
        viewer.camera.look = [0, 0, 0];
        viewer.camera.up = [0, 0, 1];
        viewer.camera.right = [0, 1, 0];
        viewer.camera.orbitYaw(180);
        NavCubeInst.setVisible(false);
      }
    }
  }

  function loadDocument(
    document_url: string,
    imgblob: any,
    location: any,
    rotation: any,
    scale: any,
    name: string
  ) {
    if (imgblob.size > 0) {
      let image_localurl = URL.createObjectURL(imgblob);
      let img = new Image();
      img.src = image_localurl;
      img.onload = function () {
        let width = img.width;
        let height = img.height;

        let node = new Node(viewer.scene, {
          id: document_url,
          isModel: true, // <---------- Node represents a model, so is registered by ID in viewer.scene.models
          rotation: [0, rotation.coordinates[2], 0],
          position: [
            location.coordinates[0] / 10,
            location.coordinates[2] / 10,
            location.coordinates[1] / 10,
          ],
          scale: [1, 1, 1],
          isObject: true,

          children: [
            new Mesh(viewer.scene, {
              //TODO: xeokit sometimes throws an error here
              geometry: new ReadableGeometry(
                viewer.scene,
                buildPlaneGeometry({
                  center: [0, 0, 0],
                  xSize: (width / 10) * scale.coordinates[0],
                  zSize: (height / 10) * scale.coordinates[0],
                  xSegments: 1,
                  zSegments: 1,
                })
              ),
              material: new PhongMaterial(viewer.scene, {
                emissive: [0.3, 0.3, 0.3],
                backfaces: true,
                shininess: 1,
                reflectivity: 0,
                specular: [0, 0, 0, 0],
                diffuseMap: new Texture(viewer.scene, {
                  src: image_localurl,
                }),
              }),
            }),
          ],
        });
        documentNodes[document_url] = node;
        viewer.cameraFlight.flyTo(document_url);
        loadDocumentViewPointCameras(document_url);
      };
    }
  }

  function loadIFC(
    document_url: string,
    ifcblob: any,
    location: any,
    rotation: any,
    scale: any,
    name: string
  ) {
    ifcblob.arrayBuffer().then((ifcbuffer: any) => {
      let xktLoader = new XKTLoaderPlugin(viewer);
      let model = xktLoader.load({
        id: document_url,
        xkt: ifcbuffer,
        edges: true,
        position: [0, 0, 0],
      });
      model.on("loaded", () => {
        viewer.cameraFlight.flyTo(document_url);
      });

      documentNodes[document_url] = model;
    });
  }

  function loadDocumentViewPointCameras(document_uri: string) {
    let bcfowl = new BcfOWL_Endpoint();
    // the Node element has to exist to connect to
    if (!documentNodes[document_uri]) {
      return;
    }
    bcfowl
      .getViepointCameras4Document(document_uri)
      .then((perspactivecameras) => {
        if (perspactivecameras["@graph"])
          perspactivecameras = perspactivecameras["@graph"];
        if (!Array.isArray(perspactivecameras))
          perspactivecameras = [perspactivecameras];
        perspactivecameras.forEach((camera: any) => {
          let node = documentNodes[document_uri];
          const gltfLoader = new GLTFLoaderPlugin(viewer);
          if (!camera.hasCameraViewPoint)
            // Should always have a value
            return;
          let location = wkt.parse(camera.hasCameraViewPoint);
          if (!location) return;

          let direction = wkt.parse(camera.hasCameraDirection);
          if (!direction) return;

          let x = direction.coordinates[0];
          let y = direction.coordinates[1];
          // let z = direction.coordinates[2];

          if (x === 0) x = 0.01;
          let tz = Math.atan(y / x);
          tz = tz * (180 / Math.PI);
          if (x < 0 && y > 0) tz += 180;
          if (x < 0 && y < 0) tz -= 180;

          let guid = camera["@id"];

          //TODO: The ID is not set. Look for the Parent in Xeokit to find the right ID
          //TODO: Import once and then reuse?
          let image3D = gltfLoader.load({
            id: guid,
            src: "../../Image3D.gltf",
            edges: false,
            rotation: [0, tz, 0], // ax, cz, by
            position: [
              location.coordinates[0],
              location.coordinates[2],
              location.coordinates[1] * -1,
            ],
            performance: false,
          });
          node.addChild(image3D);
          // Hide images initially
          image3D.visible = true;
        });
      })
      .catch((err) => {
        console.log(err);
      });
    bcfowl
    .getTaskViepointCameras4Document(document_uri)
    .then((perspactivecameras) => {
      if (perspactivecameras["@graph"])
        perspactivecameras = perspactivecameras["@graph"];
      if (!Array.isArray(perspactivecameras))
        perspactivecameras = [perspactivecameras];
      perspactivecameras.forEach((camera: any) => {
        let node = documentNodes[document_uri];
        const gltfLoader = new GLTFLoaderPlugin(viewer);
        if (!camera.hasCameraViewPoint)
          // Should always have a value
          return;
        let location = wkt.parse(camera.hasCameraViewPoint);
        if (!location) return;

        let direction = wkt.parse(camera.hasCameraDirection);
        if (!direction) return;

        let x = direction.coordinates[0];
        let y = direction.coordinates[1];
        // let z = direction.coordinates[2];

        if (x === 0) x = 0.01;
        let tz = Math.atan(y / x);
        tz = tz * (180 / Math.PI);
        if (x < 0 && y > 0) tz += 180;
        if (x < 0 && y < 0) tz -= 180;


        let guid = camera["@id"];

        //TODO: The ID is not set. Look for the Parent in Xeokit to find the right ID
        //TODO: Import once and then reuse?
        let task3d = gltfLoader.load({
          id: guid,
          src: "../../Task.gltf",
          edges: false,
          rotation: [0, tz, 0], // ax, cz, by
          position: [
            location.coordinates[0],
            location.coordinates[2],
            location.coordinates[1] * -1,
          ],
          performance: false,
        });
        node.addChild(task3d);
        // Hide images initially
        task3d.visible = true;
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  return (
    <Container
      style={{
        height: "100%",
        maxHeight: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        flexDirection: "row",
        display: "flex",
        padding: "0px",
        margin: "0px",
      }}
    >
      <Sidebar/>
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          padding: "0px",
          margin: "0px",
        }}
      >
        <canvas id="viewport_canvas" className="viewport" />
        <Switch
            onLabel="3D"
            className="plan-toggle"
            offLabel="2D"
            size="xl"
            onClick={(e: any) => {
              PubSub.publish("ChangeViewMode", { test: "test" });
            }}
          />
        <canvas id="myNavCubeCanvas" className="viewport-nav-cube" />
      </div>
    </Container>
  );
}
