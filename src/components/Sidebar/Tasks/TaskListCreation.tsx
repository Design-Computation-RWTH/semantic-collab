import React, { MouseEventHandler } from "react";
import { Accordion, AccordionState, Text } from "@mantine/core";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import PubSub from "pubsub-js";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import BcfOWLProjectSetup from "../../../services/BcfOWLProjectSetup";

type TaskListProps = {
  TaskJson: object;
  IfcStoreys: any[];
  viewer: Viewer;
};

type TaskListState = {
  tasks: any;
  documents: any;
  users: any;
};

let viewer_instance: Viewer;

let FilteredIfcElements: any = {};

export class TaskListCreation extends React.Component<
  TaskListProps,
  TaskListState
> {
  constructor(props: TaskListProps | Readonly<TaskListProps>) {
    super(props);
    this.state = {
      tasks: null,
      documents: null,
      users: null,
    };
  }

  componentWillUnmount() {}

  CreateTaskGraph(event: React.MouseEvent<HTMLButtonElement>) {}

  DocumentSelected(event: React.ChangeEvent<HTMLSelectElement>) {
    let documents = this.state.documents;
    for (const doc in documents) {
      if (event.target.selectedOptions[documents[doc]["@id"]]) {
        let bcfowl = new BcfOWL_Endpoint();
        bcfowl
          .describe(documents[doc].hasSpatialRepresentation)
          .then((spatial_representation) => {
            PubSub.publish("DocumentSelected", {
              id: documents[doc]["@id"],
              url: documents[doc].hasDocumentURL,
              spatial_representation: spatial_representation,
              //data: data.data,
              name: documents[doc].hasFilename,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }

  CreateDocumentsDropdown() {
    let DocumentOptions: any;
    if (this.state.documents) {
      DocumentOptions = this.state.documents.map((d: any) => {
        if (d.hasFilename.endsWith(".png")) {
          return (
            <option value={d.hasFilename} id={d["@id"]}>
              {d.hasFilename}
            </option>
          );
        }
      });
    }
    return DocumentOptions;
  }

  CreatePeopleDropdown() {
    let People: any;
    if (this.state.users) {
      People = this.state.users.map((p: any) => {
        return (
          <option id={p["@id"]}>
            {p.name} ({p.mbox.split("mailto:")[1]})
          </option>
        );
      });
    }

    return People;
  }

  HighlightObjects(ObjectIDs: any[], highlight: boolean) {
    let viewerScene = viewer_instance.scene.objects;
    console.log(ObjectIDs);
    for (const Element in viewerScene) {
      let elementID = viewerScene[Element].id;
      if (ObjectIDs.includes(elementID)) {
        viewerScene[Element].highlighted = highlight;
      } else {
        viewerScene[Element].highlighted = false;
      }
    }
    /*    for (const ObjectID in ObjectIDs) {
      console.log(ObjectIDs[ObjectID]);
      viewer_instance.scene.objects[ObjectIDs[ObjectID].id].highlighted =
        highlight;
    }*/
  }

  SelectMainTask(event: AccordionState, ParentIntervention: any, Storeys: any) {
    let selectedObjects: string[] = [];
    Object.entries(FilteredIfcElements).map((e: any) => {
      //Check if the Element is on the right storey
      if (e[1].parent.id === Storeys.id) {
        selectedObjects.push(e[1].id);
      }
    });
    this.HighlightObjects(selectedObjects, event[0]);
  }

  CreateSubTasks(Storeys: any) {
    // Iterate through all Tasks
    const TasksNew = Object.entries(this.props.TaskJson).map((d: any) => {
      // Check if they are interventions
      if (d[0] === "intervention") {
        // Find the Parent Interventions
        const ParentInterventions = d[1].map((p: any) => {
          if (!p.parent_intervention) {
            // Create a Card for every IFC Element
            const IfcElements = Object.entries(FilteredIfcElements).map(
              (e: any) => {
                //Check if the Element is on the right storey
                if (e[1].parent.id === Storeys.id) {
                  // Generate SubTasks for every Element
                  const SubTasks = d[1].map((s: any) => {
                    // No Parent Tasks
                    if (s.parent_intervention === p.id) {
                      // Check if the parent is the correct one
                      //TODO: Add Task Data here!
                      return (
                        <Accordion
                          multiple={false}
                          style={{ paddingLeft: "5px" }}
                        >
                          <Accordion.Item
                            style={{ paddingLeft: "5px" }}
                            label={s.name}
                            id={s.id}
                          >
                            <Text>Hello World</Text>
                          </Accordion.Item>
                        </Accordion>
                      );
                    }
                  });
                  // Create main tasks with Subtasks as children
                  return (
                    // This is the building element
                    <Accordion
                      onChange={(event: AccordionState) => {
                        this.HighlightObjects([e[1].id], event[0]);
                      }}
                      style={{ paddingLeft: "5px" }}
                    >
                      <Accordion.Item
                        style={{ paddingLeft: "5px" }}
                        label={e[1].name}
                        id={e[1].id}
                      >
                        {SubTasks}
                      </Accordion.Item>
                    </Accordion>
                  );
                }
                // Return empty if it does not belong to the right storey
                else {
                  return null;
                }
              }
            );
            // Check if the first Element is valid. Strange work around, but currently the script puts empty values in the Array if the Storey is wrong
            if (IfcElements[0]) {
              console.log(p);
              return (
                <Accordion
                  onChange={(e: AccordionState) => {
                    this.SelectMainTask(e, p, Storeys);
                  }}
                  style={{ paddingLeft: "5px" }}
                >
                  <Accordion.Item
                    style={{ paddingLeft: "5px" }}
                    label={p.name}
                    id={p.id + "_Item"}
                  >
                    <Text>Assigned To:</Text>
                    <Form.Select
                      aria-label="Default select example"
                      id={d.id + "_Document"}
                    >
                      <option>Select a person/organization</option>
                      {this.CreatePeopleDropdown()}
                    </Form.Select>
                    <p />
                    {IfcElements}
                  </Accordion.Item>
                </Accordion>
              );
            } else {
              return <div></div>;
            }
          }
        });
        return ParentInterventions;
      }
    });

    return TasksNew;
  }

  render() {
    viewer_instance = this.props.viewer;

    let metaObjects = viewer_instance.metaScene.getObjectIDsByType(
      "IfcWallStandardCase"
    );
    for (let object in metaObjects) {
      let IfcElement =
        viewer_instance.metaScene.metaObjects[metaObjects[object]];
      for (let pSet in IfcElement.propertySets) {
        if (IfcElement.propertySets[pSet].name === "Pset_WallCommon") {
          let propSet = IfcElement.propertySets[pSet].properties;
          for (let propSetProp in propSet) {
            if (
              propSet[propSetProp].name === "IsExternal" &&
              propSet[propSetProp].value === "T"
            ) {
              FilteredIfcElements[IfcElement.id] = IfcElement;
            }
          }
        }
      }
    }

    let ActiveKeys = [""];

    const AccordionList = this.props.IfcStoreys.map((d) => {
      ActiveKeys.push(d.id);
      return (
        <Accordion.Item
          style={{ paddingLeft: "5px" }}
          label={d.name}
          id={d.id + "_Item"}
        >
          <Text>Assign to Document:</Text>
          <Form.Select
            aria-label="Default select example"
            id={d.id + "_Document"}
            onChange={(event) => this.DocumentSelected(event)}
          >
            <option>Select corresponding (2D) Document</option>
            {this.CreateDocumentsDropdown()}
          </Form.Select>
          <p />
          Tasks:
          {this.CreateSubTasks(d)}
        </Accordion.Item>
      );
    });

    return (
      <div>
        <Accordion style={{ paddingLeft: "5px" }} id={"AccordionListId"}>
          {AccordionList}
        </Accordion>
        <p />
        <div className={"caia-center"}>
          <button className="btn-caia" onClick={this.CreateTaskGraph}>
            <Text>Create Tasks</Text>
          </button>
        </div>
        <p />
      </div>
    );
  }

  componentDidMount() {
    this.init();
  }

  init() {
    let bcfowl = new BcfOWL_Endpoint();
    let bcfowl_setup = new BcfOWLProjectSetup();

    if (viewer_instance) {
      viewer_instance.cameraControl.on("picked", (e: any) => {});
    }
    bcfowl
      .getDocuments()
      .then((value: any) => {
        if (value["@graph"]) value = value["@graph"];
        if (!Array.isArray(value)) value = [value];
        this.setState({ documents: value });
      })
      .catch((err: any) => {
        console.log(err);
      });

    bcfowl_setup.getCurrentProject().then((value) => {
      try {
        if (!Array.isArray(value.hasUser)) value.hasUser = [value.hasUser];
        let list: string[] = [];
        value.hasUser.forEach((user: string) => {
          bcfowl.describeUser(user).then((u) => {
            list = list.concat(u);
            this.setState({ users: list });
          });
        });
      } catch (e) {}
    });
  }
}
