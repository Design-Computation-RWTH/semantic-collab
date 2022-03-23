import React, {useEffect, useState} from "react";
import BcfOWLService from "../../../services/BcfOWLService";
import { Table } from "react-bootstrap";
import PubSub from "pubsub-js";
import wkt from "terraformer-wkt-parser";
import ImageService from "../../../services/ImageService";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";

let RepresentationDetails_instance = null;
let Viewer_instance = null;
// let documenttable_component = null;
// const base_uri = "https://caia.herokuapp.com";

// Set the scale for the documents movement /10 is equal to cm
const scale = 10;

type RepresentaionDetailsProps = {
    selectedDocument: string;
    newFileName: string;
    file: string;
    viewer: Viewer
};



//let documenttable_component=null;
export default function Representationdetails(props: RepresentaionDetailsProps)
{
  const [spatialURI, setSpatialURI] = useState("");
  const [data, setData] = useState([]) as any;
  const [location, setLocation] = useState([0,0,0]) as any;
  const [rotation, setRotation] = useState([0,0,0]) as any;
  const [scale, setScale] = useState([1,1,1]) as any;
  const [storeys, setStoreys] = useState([]);
  const [alignment, setAlignment] = useState("center");
  const [documentCaia, setDocument] = useState(null) as any;
  const [name, setName] = useState("") as any;

  let un_subsel = PubSub.subscribe("MeasurementSet", subMeasurementSet);

  let x = document.getElementById("x-location") as any;
  let y = document.getElementById("y-location") as any;
  let z = document.getElementById("z-location") as any;
  let z_scale = document.getElementById("z-scale") as any;
  let z_rotation = document.getElementById("z-rotation") as any;

  useEffect(() => {
      {
          // Check if plan is a newly created one. If yes, then set some default values
          if (props.selectedDocument !== "new_temp_plan") {
              let bcfowl = new BcfOWLService();
              console.log(props.selectedDocument)
              bcfowl.describe(props.selectedDocument).then((doc) => {
                  Object.getOwnPropertyNames(doc).forEach((p) => {
                      if (p !== "@context" && !p.startsWith("@")) {
                          let val = doc[p];
                          let pstr = p;
                          //Clean d has from the beginning of the property name
                          if (p.startsWith("has")) {
                              pstr = p.slice("has".length);
                          }
                          // Filters out Guid and Project from JSON-LD
                          if (pstr === "Guid") return;
                          if (p === "Project") return;
                          if (p === "hasSpatialRepresentation") {
                              setSpatialURI(doc[p]);
                              bcfowl
                                  .describe(doc["hasSpatialRepresentation"])
                                  .then((spatial_representation:any) => {
                                      // does not work for newly uploaded plans!
                                      setName(doc.hasFilename);
                                      if (!spatial_representation) return;
                                      if (!spatial_representation.hasLocation) return;
                                      let location = wkt.parse(spatial_representation.hasLocation) as any;
                                      let rotation = wkt.parse(spatial_representation.hasRotation) as any;
                                      let scale = wkt.parse(spatial_representation.hasScale) as any;
                                      //TODO: Set Coordinates
                                      console.log(location)
                                      setLocation(location.coordinates);
                                      setRotation(rotation.coordinates);
                                      setScale(scale.coordinates);
                                      setAlignment(spatial_representation.alignment);
                                      setDocument(props.selectedDocument);

                                      x.value = location.coordinates[0];
                                      y.value = location.coordinates[1];
                                      z.value = location.coordinates[2];

                                      z_scale.value = scale.coordinates[0];
                                      z_rotation.value = rotation.coordinates[2];
                                  });
                          }

                          let valstr;

                          if (
                              val[
                                  ("https://caia.herokuapp.com/graph/" + "project_id" + "/")
                                  ]
                          ) {
                              valstr = val.replaceAll(
                                  "https://caia.herokuapp.com/graph/" + "project_id" + "/",
                                  ""
                              );
                          } else {
                              return;
                          }

                          //valstr  = valstr.replaceAll("https://caia.herokuapp.com/users/","");

                          //console.log(this.props.selected_document + " SelectedDocument");
                          if (val.startsWith("https://caia.herokuapp.com/users/")) {
                              bcfowl.describeUser(val).then((user) => {
                                  valstr = user.name;
                                  let joined = data.concat({
                                      prop: pstr,
                                      value: valstr,
                                  });
                                  setData(joined);
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
                                  } catch (e) {
                                      console.log("Date time format error " + e);
                                  }
                              }
                              let joined = data.concat({ prop: pstr, value: valstr });
                              setData(joined);
                          }
                      }
                  });
              });
          }
          else {
              x.value = 0;
              y.value = 0;
              z.value = 0;
              z_rotation.value = 0;
              z_scale.value = 1;
              setName(props.newFileName);
              (document.getElementById("document-title") as any).value = name
              (document.getElementById("document-title") as any).disabled = false;
              (document.getElementById("name-warning") as any).hidden = false;
              console.log(props.newFileName + " FILENAME!")
              console.log(name  + " STATE!")


          }
      }
  }, [])

  Viewer_instance = props.viewer;

  setStoreys(Viewer_instance.metaScene.getObjectIDsByType("IfcBuildingStorey"));

  let storeyTemp = [];
  for (let storey in storeys) {

    let ifc_storey = Viewer_instance.metaScene.metaObjects[storeys[storey]]
    console.log("metaModel")
    console.log(ifc_storey.metaModel.id)
    if (ifc_storey.metaModel.id === documentCaia) {
        console.log("TURE?!?!?")
        storeyTemp.push(ifc_storey)
    }
  }


    const listRows = data.map((r:any) => (
      <tr>
        <td className="caia_tablefont">{r.prop}</td>
        <td className="caia_tablefont">{r.value}</td>
      </tr>
    ));

    const storeyRows = storeyTemp.map((r) => (
        <div>
        <tr>
            <td className="caia_tablefont">{r.name}</td>
        </tr>
        </div>
    ))

    let details = <div/>;

    if (name.endsWith(".png")){
        details = (
            <div>
                <div>
                    <table className="caia-table">
                        <tbody>
                        <tr>
                            <td>
                                <input
                                    id="document-title"
                                    type="text"
                                    className="form-control caia-title-form"
                                    disabled
                                    defaultValue={name}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        if (value.endsWith(".png")) {
                                            setName(e.target.value)
                                        } else {
                                            e.target.value = name
                                        }

                                    }}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p className="caia-warning" id="name-warning" hidden>Keep in mind: files should be named
                                    uniquely</p>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <Table>
                    <tbody>{listRows}</tbody>
                </Table>
                <div className="Container input-group mb-3">
                    <div className="col my-col">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Transformation</span>
                        </div>
                    </div>
                    <div className="row sidebar-row">
                        <div className="col">
                            <div className="input-group-prepend">
                                <span className="input-group-text">X</span>
                            </div>
                            <input
                                id="x-location"
                                type="number"
                                className="form-control"
                                defaultValue={location[0]}
                                onChange={() => {
                                    let x = (document.getElementById("x-location") as any);
                                    let y = (document.getElementById("y-location") as any);
                                    let z = (document.getElementById("z-location") as any);
                                    setLocation([x.value / scale, z.value / scale, y.value / scale])
                                    PubSub.publish("DocumentMoved", {
                                        id: props.selectedDocument,
                                        position: location,
                                    });
                                }}
                            />
                        </div>
                        <div className="col">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Y</span>
                            </div>
                            <input
                                id="y-location"
                                type="number"
                                className="form-control"
                                defaultValue={location[1]}
                                onChange={() => {
                                    let x = document.getElementById("x-location") as any;
                                    let y = document.getElementById("y-location") as any;
                                    let z = document.getElementById("z-location") as any;
                                    setLocation([x.value / scale, z.value / scale, y.value / scale])
                                    PubSub.publish("DocumentMoved", {
                                        id: props.selectedDocument,
                                        position: location,
                                    });
                                }}
                            />
                        </div>
                        <div className="col">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Z</span>
                            </div>
                            <input
                                id="z-location"
                                type="number"
                                className="form-control"
                                defaultValue={location[2]}
                                onChange={() => {
                                    let x = document.getElementById("x-location") as any;
                                    let y = document.getElementById("y-location") as any;
                                    let z = document.getElementById("z-location") as any;
                                    setLocation([x.value / scale, z.value / scale, y.value / scale])
                                    PubSub.publish("DocumentMoved", {
                                        id: props.selectedDocument,
                                        position: location,
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className="col my-col">
                        <div className="col my-col">
                            <div className="input-group-prepend">
                                <span className="input-group-text">Rotation</span>
                            </div>
                            <input
                                id="z-rotation"
                                type="number"
                                className="form-control"
                                defaultValue={rotation}
                                onChange={() => {
                                    let z = document.getElementById("z-rotation") as any;
                                    setRotation([0, 0, z.value])
                                    PubSub.publish("DocumentRotated", {
                                        id: props.selectedDocument,
                                        rotation: rotation,
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="row sidebar-row">
                    <div className="col">
                        <span className="input-group-text">Scale</span>
                        <input
                            id="z-scale"
                            type="number"
                            className="form-control"
                            defaultValue={scale}
                            disabled
                        />
                        <div>
                            Current distance [m]:
                            <input
                                id="current-distance"
                                type="number"
                                className="form-control"
                                disabled
                            />
                        </div>
                        <div>
                            Target distance [m]:
                            <input
                                id="target-distance"
                                type="number"
                                className="form-control"
                            />
                        </div>
                        <div className="input-group-prepend">
                            <button
                                className="btn-caia"
                                onClick={() => {
                                    PubSub.publish("SetClickMode", {
                                        clickMode: "MeasureOnce",
                                    });
                                }}
                            >
                                Measure Distance
                            </button>
                            <button className="btn-caia" onClick={() => {
                                let startDistance = (document.getElementById("current-distance") as any).value;
                                let targetDistance = (document.getElementById("target-distance") as any).value;
                                if (targetDistance > 0) {
                                    let scaleValue = targetDistance / startDistance;
                                    let z_scale = document.getElementById("z-scale") as any;
                                    z_scale.value = scaleValue.toFixed(2);
                                    setScale([[scaleValue, scaleValue, scaleValue]])
                                    PubSub.publish("DocumentMeasuredScale", {
                                        value: scaleValue,
                                        id: props.selectedDocument
                                    });
                                }
                            }
                            }> Set Distance
                            </button>
                        </div>
                    </div>
                </div>
                <div className="center-horizontal">
                    <button
                        className="btn-caia"
                        onClick={() => {
                            let spatial_json = {
                                alignment: "center",
                                location: {
                                    x: location[0] * 10,
                                    y: location[2] * 10,
                                    z: location[1] * 10,
                                },
                                rotation: {
                                    x: 0,
                                    y: 0,
                                    z: rotation[2],
                                },
                                scale: {
                                    x: scale[0],
                                    y: scale[1],
                                    z: scale[2],
                                },
                            };
                            if (props.selectedDocument !== "new_temp_plan") {
                                let bcfowl = new BcfOWLService();
                                let document_uri = props.selectedDocument;

                                bcfowl
                                    .updateSpatialRepresentation(
                                        document_uri,
                                        spatialURI,
                                        spatial_json
                                    )
                                    .then((message) => {
                                        //console.log(message);
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    });
                                ;
                            } else {
                                //TODO: Check if name is set correctly. If " " is in name -> replace by "_"
                                console.log("Upload Plan")

                                let imageService = new ImageService();
                                let bcfowl = new BcfOWLService();

                                imageService.postFile(props.file, props.newFileName)
                                    .then((message) => {
                                        console.log(message)
                                        // let file_url = base_uri + "/files/" + this.project_id + "/" + this.props.newfilename
                                        bcfowl.createDocumentWithSpatialRepresentation(props.newFileName, spatial_json)
                                            .then((message) => {
                                                console.log(message);
                                            })
                                            .catch(err => {
                                                console.log(err)
                                            });
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                    })
                                PubSub.publish("DocumentsViewStateChange", {})
                            }
                        }}
                    >
                        update/upload
                    </button>
                </div>
            </div>)
    }
    else if (name.endsWith(".ifc")){

        details = (
            <Table>
                <tbody>{storeyRows}</tbody>
            </Table>
        )
    }

    return (
      details
    );


  function subMeasurementSet(msg: any, data: any) {
    let distanceObject = document.getElementById("current-distance") as any;
    distanceObject.value =
      Math.round((data.length + Number.EPSILON) * 100) / 100;
  }
}

