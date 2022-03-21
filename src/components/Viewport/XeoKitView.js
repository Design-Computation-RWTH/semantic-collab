import React from "react";
import {
  Viewer,
  XKTLoaderPlugin,
  AnnotationsPlugin,
  GLTFLoaderPlugin,
  WebIFCLoaderPlugin,
  DistanceMeasurementsPlugin,
  buildGridGeometry,
  VBOGeometry,
  DirLight,
  AmbientLight,
  NavCubePlugin,
  Texture,
  buildPlaneGeometry,
  ReadableGeometry,
  Mesh,
  PhongMaterial,
  Node,
} from "@xeokit/xeokit-sdk";

import BcfOWLService from "../../services/BcfOWLService";
import ImageService from "../../services/ImageService";
import PubSub from "pubsub-js";

import Sidebar from "../Sidebar/Sidebar";

const wkt = require("terraformer-wkt-parser");


let XeoKitView_instance = null;
let annotation_instance = null;
let NavCubeInst = null;
let distanceMeasurements_instance = null;
let ifcdata = null;
let newplandata = null;
let cameraControl = null;

// Since we don't have Enums in JS, we have to fall back here to Strings. Current Click Modes are:
// - Select (for selecting/picking objects in the Viewer) Default
// - Measure (for measuring Distances in the Viewer)
// - MeasureOnce (for handling a one time measurement)
let clickMode = "Select";

class MyDataSource {

    // Gets the contents of the given IFC file in an arraybuffer
    getIFC(src, ok, error) {
        console.log("get IFC SRC: " + src);

        //ok(this.buffer)
        ok(ifcdata)
        /*if(ifcdata)
            ok(ifcdata)
        else
            error("No IFC Data")*/
    }
}

class XeoKitView extends React.Component {
  constructor() {
    super();
    XeoKitView_instance = this;
    this.imageservice = new ImageService();
    XeoKitView_instance.documents = new Set();
    XeoKitView_instance.document_nodes = {};

    this.un_subsel = PubSub.subscribe(
      "DocumentSelected",
      this.subDocumentSelected
    );
    this.un_subclick = PubSub.subscribe("SetClickMode", this.subSetClickMode);
    this.un_subdocun = PubSub.subscribe(
      "DocumentUnSelected",
      this.DocumentUnSelected
    );
    this.un_docmov = PubSub.subscribe("DocumentMoved", this.subDocumentMoved);
    this.un_docmeasca = PubSub.subscribe("DocumentMeasuredScale", this.subDocumentMeasuredScale);
    this.un_docrot = PubSub.subscribe(
      "DocumentRotated",
      this.subDocumentRotated
    );
    this.un_docsca = PubSub.subscribe("DocumentScaled", this.subDocumentScaled);
    this.un_newuplifc = PubSub.subscribe(
      "NewUploadedIFC",
      this.subNewUploadedIFC
    );
    this.un_newuplplan = PubSub.subscribe("NewUploadedPlan", this.subNewUploadedPlan);
    this.un_cancelnewdocu = PubSub.subscribe("CancelNewDocument", this.subCancelNewDocument);
    this.un_changeViewMode = PubSub.subscribe("ChangeViewMode", this.changeViewMode)
  }

  componentWillUnmount() {

    console.log("unmount")
    PubSub.unsubscribe(this.un_subsel);
    PubSub.unsubscribe(this.un_subdocun);
    PubSub.unsubscribe(this.un_docmov);
    PubSub.unsubscribe(this.un_docrot);
    PubSub.unsubscribe(this.un_docsca);
    PubSub.unsubscribe(this.un_newuplifc);
    PubSub.unsubscribe(this.un_subclick);
    PubSub.unsubscribe(this.un_docmeasca);
    PubSub.unsubscribe(this.un_newuplplan);
    PubSub.unsubscribe(this.un_cancelnewdocu);
    PubSub.unsubscribe(this.un_changeViewMode);

    XeoKitView_instance.documents = new Set();
    XeoKitView_instance.document_nodes = {};
    console.log(this.viewer)
    this.viewer.destroy();
    //
    //distanceMeasurements_instance.destroy();
    if (XeoKitView_instance.viewer) {

    }

  }

  subSetClickMode(msg, data) {
    clickMode = data.clickMode;
    console.log(clickMode);
    if (clickMode === "MeasureOnce") {
      distanceMeasurements_instance.control.activate();
    }
  }

  subDocumentMoved(msg, data) {
    let document_uri = data.id;
    let node = XeoKitView_instance.document_nodes[document_uri];
    if (!node.isPerformanceModel) {
      if (data.position != null) {
        node.position = [data.position[0], data.position[1], data.position[2]];
      }
    } else {
      console.log(node);
      node.origin = [data.position[0], data.position[1], data.position[2]];
    }
  }

  subDocumentRotated(msg, data) {
    let document_uri = data.id;
    let node = XeoKitView_instance.document_nodes[document_uri];
    if (data.rotation != null) {
      node.rotation = [0, data.rotation[2], 0];
    }
    //
  }

  subDocumentScaled(msg, data) {
    console.log("scaled")
    let document_uri = data.id;
    let node = XeoKitView_instance.document_nodes[document_uri];
    node.scale = [data.scale, data.scale, data.scale];
  }

  subDocumentMeasuredScale(msg, data) {
    let document_uri = data.id;
    let node = XeoKitView_instance.document_nodes[document_uri];
    node.scale = [node.scale[0] * data.value , node.scale[1] * data.value, node.scale[2] * data.value];
  }

  //Load a Document by its URI. If the Document is already in the list (XeoKitView_instance.documents) just make it visible
  //and don't download it again
  subDocumentSelected(msg, data) {
    let document_uri = data.id;
    let file_uri = data.url;
    let name = data.name;
    if (!file_uri) {
      console.log("Xeokit Select Document: File URI is missing!")
      return
    };
    if (XeoKitView_instance.documents.has(document_uri)) {
      console.log("Xeokit Select Document: Document URI is missing!")
      // Just to avoid double load
      return;
    }
    if (!data) {
      console.log("Xeokit Select Document: No Data!")
      return
    };
    if (!data.spatial_representation) {
      console.log("Xeokit Select Document: Missing Spatial Representation!")
      return
    };
    if (!data.spatial_representation.hasLocation)
    {
      // In DC.Chair Test this was missing
      console.log("Xeokit Select Document: Spatial Representation!")
      return;
    }

    let location = wkt.parse(data.spatial_representation.hasLocation);
    let rotation = wkt.parse(data.spatial_representation.hasRotation);
    let scale = wkt.parse(data.spatial_representation.hasScale);

    console.log("Xeokit Select Document: Success")
    XeoKitView_instance.documents.add(document_uri);
    if (XeoKitView_instance.viewer) {
      if (XeoKitView_instance.document_nodes[document_uri])
        XeoKitView_instance.document_nodes[document_uri].visible = true;
      else {
        if (file_uri.endsWith(".png")) {
          let image = XeoKitView_instance.imageservice.getImageData4URL(file_uri);
          image.then((imgblob) => {
            XeoKitView_instance.loadDocument(
                document_uri,
                imgblob,
                location,
                rotation,
                scale,
                name
            );
          })
        }
        else if (file_uri.endsWith(".ifc")) {
          let ifc = XeoKitView_instance.imageservice.getImageData4URL(file_uri + ".xkt");
          ifc.then((ifcblob) => {
            XeoKitView_instance.loadIFC(
                document_uri,
                ifcblob,
                location,
                rotation,
                scale,
                name
            )
          })
          console.log(ifc);
        } else {
          PubSub.publish("Alert", {type: "warning", message: "Unknown file type", title: "ERROR: Load Spatial Representation"})
        }

      }
    }
  }

  DocumentUnSelected(msg, data) {
    if (!XeoKitView_instance.documents.has(data.id)) return;
    XeoKitView_instance.documents.delete(data.id);

    console.log("Model Node: " + XeoKitView_instance.document_nodes[data.id])

    if (XeoKitView_instance.document_nodes[data.id]) {
      console.log("Visibility: " + XeoKitView_instance.document_nodes[data.id])
      XeoKitView_instance.document_nodes[data.id].visible = false;
    }
    // const entities = XeoKitView_instance.viewer.scene.objects;
    // const node = entities[data.id];
    // const objectIds = XeoKitView_instance.viewer.scene.objectIds;
    // node.visible=false;
    /* for (var i = 0, len = objectIds.length; i < len; i++) {
            const objectId = objectIds[i];
            console.log("OID: "+objectId);
        } */
  }

  subNewUploadedIFC(msg, data) {
      ifcdata=data.value;
      console.log("subNewUploadedIFC data: "+data.name)
      let ifcLoader = new WebIFCLoaderPlugin(XeoKitView_instance.viewer, {
          wasmPath: "",
          dataSource: new MyDataSource()
      });
      console.log("subNewUploadedIFC load using ifcLoader ");

      let model = ifcLoader.load({
              id: "ifcModel",
              src: "browser data",
              loadMetadata: true, // Default
              excludeTypes: ["IfcSpace"],
              edges: true,
      });

      model.on("loaded", function () {
              console.log("IFC model loaded")
      });
  }

  subNewUploadedPlan(msg, data) {
    newplandata=data.rawvalue;

    // first destroy the old new_temp_plan if available!
    if (XeoKitView_instance.document_nodes["new_temp_plan"]) {
      let childs = XeoKitView_instance.document_nodes["new_temp_plan"].children;
      for ( let child in childs) {
        childs[child].destroy();
      }
      XeoKitView_instance.document_nodes["new_temp_plan"].destroy();
    }

    // create some dummy coordinates. A new plan should always be at 0|0|0
    let location = wkt.parse("POINT Z(0 0 0)");
    let rotation = wkt.parse("POINT Z(0 0 0)");
    let scale = wkt.parse("POINT Z(1 1 1)");

    // use the same function as for the loading of existing documents
    XeoKitView_instance.loadDocument(
        "new_temp_plan",
        newplandata,
        location,
        rotation,
        scale
    );
    PubSub.publish("UploadedPlanCreated")
  }

  subCancelNewDocument(msg, data) {
    // destroy "new_temp_plan" if operation gets canceled!
    if (XeoKitView_instance.document_nodes["new_temp_plan"]) {
      let childs = XeoKitView_instance.document_nodes["new_temp_plan"].children;
      for ( let child in childs) {
        childs[child].destroy();
      }
      XeoKitView_instance.document_nodes["new_temp_plan"].destroy();
    }

    newplandata = null
    ifcdata = null
  }

  changeViewMode(msg, data) {

    if (cameraControl) {
      console.log(cameraControl.navMode)
      if (cameraControl.navMode === "planView") {
        cameraControl.navMode = "orbit";
        XeoKitView_instance.viewer.camera.projection = "perspective";
        NavCubeInst.setVisible(true);

      } else if (cameraControl.navMode === "orbit") {
        cameraControl.navMode = "planView";
        XeoKitView_instance.viewer.camera.projection = "ortho";
        XeoKitView_instance.viewer.camera.eye = [0, 100, 0];
        XeoKitView_instance.viewer.camera.look = [0, 0, 0];
        XeoKitView_instance.viewer.camera.up = [0, 0, 1];
        XeoKitView_instance.viewer.camera.right = [0,1,0];
        XeoKitView_instance.viewer.camera.orbitYaw(180)
        NavCubeInst.setVisible(false);
      }

    }

  }

  addBIMModel() {
      /*if(!this.model) {
          fetch(ifcFile).then((r) => r.text())
              .then(text => {
                  ifcdata = text;
                  //console.log(text);

                  const ifcLoader = new WebIFCLoaderPlugin(XeoKitView_instance.viewer, {
                      wasmPath: "",
                      dataSource: new MyDataSource()
                  });
                  console.log("ifcLoader set")

                  this.model = ifcLoader.load({
                      id: "ifcModel",
                      src: "Online",
                      loadMetadata: true, // Default
                      excludeTypes: ["IfcSpace"],
                      edges: true,
                  });
                  console.log("ifcLoader load done")

                  this.model.on("loaded", function () {
                      console.log("!!IFC model loaded")
                  });
              })
              .catch(error => console.log("File fetch error"));
      }
      else
          this.model.on("loaded", function () {
              console.log("!!IFC model loaded")
          });




      console.log("ifcLoader plugin set")
      */
  }

  render() {

      return <div className="caia-row">
          <Sidebar XeokitInst={this}/>
          <canvas id="viewport_canvas" className="viewport"/>
          <div className="plan-toggle">
            <div className="btn-group-toggle" data-toggle="buttons">
              <label className="btn btn-secondary active">
                <input type="checkbox" autoComplete="off" onClick={e => {
                  PubSub.publish("ChangeViewMode", {test: "test"})
                  console.log(e.target.checked)
                }
                }/>
                 3D Mode
              </label>
            </div>
          </div>
          <canvas id="myNavCubeCanvas" className="viewport-nav-cube"/>
      </div>;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

  }

  componentDidMount() {

    XeoKitView_instance.documents = new Set();
    XeoKitView_instance.document_nodes = {};

    if (!XeoKitView_instance.viewer) this.initialize_scene();
    else console.log("Avoid double initialization!");
  }

  initialize_scene() {
    this.viewer = new Viewer({
      canvasId: "viewport_canvas",
      transparent: true,
    });

    this.context = this.viewer;

    distanceMeasurements_instance = new DistanceMeasurementsPlugin(
      XeoKitView_instance.viewer
    );

    annotation_instance = new AnnotationsPlugin(XeoKitView_instance.viewer, {

      //container: document.getElementById("viewport_canvas"),
      // Default HTML template for marker position
      markerHTML: "<div class='annotation-marker' style='background-color: {{markerBGColor}};'>{{glyph}}</div>",

      // Default HTML template for label
      labelHTML: "<div class='annotation-label' style='background-color: {{labelBGColor}};'>" +
          "<div class='annotation-title'>{{title}}</div><div class='annotation-desc'>{{description}}</div></div>",

      // Default values to insert into the marker and label templates
      values: {
        markerBGColor: "red",
        labelBGColor: "red",
        glyph: "X",
        title: "Untitled",
        description: "No description"
      }
    })

    new Mesh(this.viewer.scene, {
      geometry: new VBOGeometry(this.viewer.scene, buildGridGeometry({
        size: 1000,
        divisions: 1000
      })),
      position: [0, -1.6, 0],
      collidable: false
    });

    cameraControl = this.viewer.cameraControl;

    cameraControl.navMode = "planView";
    cameraControl.followPointer = true;
    this.viewer.camera.projection = "ortho";

    this.viewer.camera.eye = [0, 100, 0];
    this.viewer.camera.look = [0, 0, 0];
    this.viewer.camera.up = [0, 0, 1];
    this.viewer.camera.right = [0,1,0];
    this.viewer.camera.orbitYaw(180)

    let lastSelection;
    let lastViewpointId;

    let measureCount = 0;

    cameraControl.on("picked", (e) => {
      if (clickMode === "Select") {
        const entity = e.entity;
        if (lastSelection) {
          lastSelection.selected = false;
        }
        entity.selected = true;
        lastSelection = entity;
        console.log(entity)
        const metaObj = this.viewer.metaScene.metaObjects[entity.id]
        console.log(metaObj)
        // if id = SM_Image3D it means the object is a viewpoint
        // store the "real" id in lastViewpointId var
        if (entity.id === "SM_Image3D") {
          //lastViewpoint = entity;
          for (let entry in entity) {
            if (entry === "meshes") {
              let meshes = entity[entry];
              let id = meshes[0].id;
              lastViewpointId = id.split(".0")[0];
              PubSub.publish("ViewpointSelected", { id: lastViewpointId });
            }
          }
        }
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

    cameraControl.on("pickedNothing", (e) => {
      if (lastSelection) {
        lastSelection.selected = false;
      }
    });

    NavCubeInst = new NavCubePlugin(XeoKitView_instance.viewer, {
      canvasId: "myNavCubeCanvas",
      color: "lightblue",
      visible: false,
      size: 250,
      alignment: "left",
      bottomMargin: 100,
      rightMargin: 10,
    });

    this.viewer.scene.clearLights();

    new AmbientLight(this.viewer.scene, {
      id: "myAmbientLight",
      color: [1, 1, 1],
      intensity: 0.8,
    });

    new DirLight(this.viewer.scene, {
      id: "keyLight",
      dir: [0, 0, -1],
      intensity: 0.5,
      space: "view",
    });

    this.addBIMModel();
  }

  loadDocument(document_url, imgblob, location, rotation, scale, name) {
      if (imgblob.size > 0) {
        let image_localurl = URL.createObjectURL(imgblob);
        let img = new Image();
        img.src = image_localurl;
        img.onload = function () {
          let width = img.width;
          let height = img.height;

          let node = new Node(XeoKitView_instance.viewer.scene, {
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
              new Mesh(XeoKitView_instance.viewer.scene, {
                //TODO: xeokit sometimes throws an error here
                geometry: new ReadableGeometry(
                  XeoKitView_instance.viewer.scene,
                  buildPlaneGeometry({
                    center: [0, 0, 0],
                    xSize: (width / 10) * scale.coordinates[0],
                    zSize: (height / 10) * scale.coordinates[0],
                    xSegments: 1,
                    zSegments: 1,
                  })
                ),
                material: new PhongMaterial(XeoKitView_instance.viewer.scene, {
                  emissive: [0.3, 0.3, 0.3],
                  backfaces: true,
                  shininess: 1,
                  reflectivity: 0,
                  specular: [0, 0, 0, 0],
                  diffuseMap: new Texture(XeoKitView_instance.viewer.scene, {
                    src: image_localurl,
                  }),
                }),
              }),
            ],
          });
          XeoKitView_instance.document_nodes[document_url] = node;
          XeoKitView_instance.loadDocumentViewPointCameras(document_url);
        };
      }
  }

  loadIFC(document_url, ifcblob, location, rotation, scale, name) {

    ifcblob.arrayBuffer().then(ifcbuffer => {
      let  xktLoader = new XKTLoaderPlugin(this.viewer);
      let model = xktLoader.load({
        id: document_url,
        xkt: ifcbuffer,
        edges: true,
        position: [0,0,0],
      });
      model.on("loaded", () => {
        console.log("!!IFC model loaded")
      });
      console.log(model)
      XeoKitView_instance.document_nodes[document_url] = model;
    });

  }

  loadDocumentViewPointCameras(document_uri) {
    let bcfowl = new BcfOWLService();
    // the Node element has to exist to connect to
    if (!XeoKitView_instance.document_nodes[document_uri]) {
      return;
    }
    bcfowl
      .getViepointCameras4Document(document_uri)
          .then((perspactivecameras) => {
          if (perspactivecameras["@graph"])
            perspactivecameras = perspactivecameras["@graph"];
          if (!Array.isArray(perspactivecameras))
            perspactivecameras = [perspactivecameras];
          perspactivecameras.forEach((camera) => {
            let node = XeoKitView_instance.document_nodes[document_uri];
            const gltfLoader = new GLTFLoaderPlugin(XeoKitView_instance.viewer);
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
          });
        })
        .catch(err => {
          console.log(err)
        });;
  }
}

export default XeoKitView;
