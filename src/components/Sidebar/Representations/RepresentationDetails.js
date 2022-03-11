import React from "react";
import BcfOWLService from "../../../services/BcfOWLService";
import { Table } from "react-bootstrap";
import PubSub from "pubsub-js";
import wkt from "terraformer-wkt-parser";
import ImageService from "../../../services/ImageService";

let RepresentationDetails_instance = null;
// let documenttable_component = null;
// const base_uri = "https://caia.herokuapp.com";

// Set the scale for the documents movement /10 is equal to cm
const scale = 10;

//let documenttable_component=null;
class RepresentationDetails extends React.Component {
  constructor(props) {
    super(props);
    console.log("Test")
    RepresentationDetails_instance = this;
    this.state = {
      spatial_uri: "",
      data: [],
      location: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      alignment: "center",
      document: "",
        name: "",
    };
    this.un_subsel = PubSub.subscribe("MeasurementSet", this.subMeasurementSet);
  }
  render() {
    const listRows = this.state.data.map((r) => (
      <tr>
        <td className="caia_tablefont">{r.prop}</td>
        <td className="caia_tablefont">{r.value}</td>
      </tr>
    ));
    return (
      <div>
          <div>
              <table class="caia-table">
                  <tbody>
                      <tr>
                          <td>
                              <input
                                  id="document-title"
                                  type="text"
                                  className="form-control caia-title-form"
                                  disabled
                                  defaultValue={this.state.name}
                                  onChange={(e) => {
                                      let value = e.target.value;
                                      if (value.endsWith(".png")) {
                                          this.setState({name: e.target.value})
                                      } else {
                                          e.target.value = this.state.name
                                      }

                                  }}
                              />
                          </td>
                      </tr>
                      <tr>
                          <td>
                              <p className="caia-warning" id="name-warning" hidden>Keep in mind: files should be named uniquely</p>
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
                defaultValue={this.state.location[0]}
                onChange={() => {
                  let x = document.getElementById("x-location");
                  let y = document.getElementById("y-location");
                  let z = document.getElementById("z-location");
                  this.setState({
                    location: [x.value / scale, z.value / scale, y.value / scale],
                  });
                  PubSub.publish("DocumentMoved", {
                    id: this.props.selected_document,
                    position: this.state.location,
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
                defaultValue={this.state.location[1]}
                onChange={() => {
                  let x = document.getElementById("x-location");
                  let y = document.getElementById("y-location");
                  let z = document.getElementById("z-location");
                  this.setState({
                    location: [x.value / scale, z.value / scale, y.value / scale],
                  });
                  PubSub.publish("DocumentMoved", {
                    id: this.props.selected_document,
                    position: this.state.location,
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
                defaultValue={this.state.location[2]}
                onChange={() => {
                  let x = document.getElementById("x-location");
                  let y = document.getElementById("y-location");
                  let z = document.getElementById("z-location");
                  this.setState({
                    location: [x.value / scale, z.value / scale, y.value / scale],
                  });
                  PubSub.publish("DocumentMoved", {
                    id: this.props.selected_document,
                    position: this.state.location,
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
                defaultValue={this.state.rotation}
                onChange={() => {
                  let z = document.getElementById("z-rotation");
                  this.setState({ rotation: [0, 0, z.value] });
                  PubSub.publish("DocumentRotated", {
                    id: this.props.selected_document,
                    rotation: this.state.rotation,
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
              defaultValue={this.state.scale}
              disabled
              onChange={() => {
                let z = document.getElementById("z-scale");
                this.setState([z.value, z.value, z.value])
                PubSub.publish("DocumentScaled", {
                  id: this.props.selected_document,
                  scale: this.state.scale,
                });
              }}
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
                <button class="btn-caia" onClick={() => {
                    let startDistance = document.getElementById("current-distance").value;
                    let targetDistance = document.getElementById("target-distance").value;
                    if (targetDistance > 0) {
                        let scaleValue = targetDistance/startDistance;
                        let z_scale = document.getElementById("z-scale");
                        z_scale.value = scaleValue.toFixed(2);
                        this.setState({scale: [scaleValue, scaleValue, scaleValue]})
                        PubSub.publish("DocumentMeasuredScale", {value: scaleValue, id: this.props.selected_document});
                    }
                }
                }> Set Distance</button>
            </div>
          </div>
        </div>
        <div class="center-horizontal">
          <button
            className="btn-caia"
            onClick={() => {
                let spatial_json = {
                    alignment: "center",
                    location: {
                        x: this.state.location[0] * 10,
                        y: this.state.location[2] * 10,
                        z: this.state.location[1] * 10,
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: this.state.rotation[2],
                    },
                    scale: {
                        x: this.state.scale[0],
                        y: this.state.scale[1],
                        z: this.state.scale[2],
                    },
                };
                if(this.props.selected_document !== "new_temp_plan")
                {
                    let bcfowl = new BcfOWLService();
                    let document_uri = this.props.selected_document;

                    bcfowl
                        .updateSpatialRepresentation(
                            document_uri,
                            this.state.spatial_uri,
                            spatial_json
                        )
                            .then((message) => {
                                //console.log(message);
                            })
                        .catch(err => {
                            console.log(err)
                        });;
                } else {
                    //TODO: Check if name is set correctly. If " " is in name -> replace by "_"
                    console.log("Upload Plan")

                    let imageService = new ImageService();
                    let bcfowl = new BcfOWLService();

                    imageService.postFile(this.props.file, this.props.newfilename)
                        .then((message) => {
                            console.log(message)
                            // let file_url = base_uri + "/files/" + this.project_id + "/" + this.props.newfilename
                            bcfowl.createDocumentWithSpatialRepresentation(this.props.newfilename, spatial_json)
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
      </div>
    );
  }

  componentDidMount() {

      let x = document.getElementById("x-location");
      let y = document.getElementById("y-location");
      let z = document.getElementById("z-location");
      let z_scale = document.getElementById("z-scale");
      let z_rotation = document.getElementById("z-rotation");


      // Check if plan is a newly created one. If yes, then set some default values
      if (this.props.selected_document !== "new_temp_plan") {
          let bcfowl = new BcfOWLService();
          console.log(this.props.selected_document)
          bcfowl.describe(this.props.selected_document).then((doc) => {
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
                          RepresentationDetails_instance.state.spatial_uri = doc[p];
                          bcfowl
                              .describe(doc["hasSpatialRepresentation"])
                              .then((spatial_representation) => {
                                  // does not work for newly uploaded plans!
                                  this.setState({name: doc.hasFilename});
                                  if (!spatial_representation) return;
                                  if (!spatial_representation.hasLocation) return;
                                  let location = wkt.parse(spatial_representation.hasLocation);
                                  let rotation = wkt.parse(spatial_representation.hasRotation);
                                  let scale = wkt.parse(spatial_representation.hasScale);
                                  RepresentationDetails_instance.setState({
                                      location: location.coordinates,
                                      rotation: rotation.coordinates,
                                      scale: scale.coordinates,
                                      alignment: spatial_representation.alignment,
                                      document: this.props.selected_document
                                  });

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
                              ("https://caia.herokuapp.com/graph/" + this.project_id + "/", "")
                              ]
                      ) {
                          valstr = val.replaceAll(
                              "https://caia.herokuapp.com/graph/" + this.project_id + "/",
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
                              let joined = this.state.data.concat({
                                  prop: pstr,
                                  value: valstr,
                              });
                              this.setState({ data: joined });
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
                          let joined = this.state.data.concat({ prop: pstr, value: valstr });
                          this.setState({ data: joined });
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
          this.setState({name: this.props.newfilename})
          document.getElementById("document-title").value = this.props.newfilename
          document.getElementById("document-title").disabled = false;
          document.getElementById("name-warning").hidden = false;
          console.log(this.props.newfilename + " FILENAME!")
          console.log(this.state.name  + " STATE!")


      }
  }

  subMeasurementSet(msg, data) {
    let distanceObject = document.getElementById("current-distance");
    distanceObject.value =
      Math.round((data.length + Number.EPSILON) * 100) / 100;
  }
}

export default RepresentationDetails;
