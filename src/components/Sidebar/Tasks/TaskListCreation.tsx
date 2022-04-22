import React, { MouseEventHandler, useEffect, useState } from "react";
import { Button, Accordion, AccordionState, Text } from "@mantine/core";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import PubSub from "pubsub-js";
import { ConvertTasks } from "../../../services/ConvertTasks2RDF";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import BcfOWLProjectSetup from "../../../services/BcfOWLProjectSetup";
import { InterventionPost } from "../../../services/types/ConvertTasks2RDF_types";

type TaskListProps = {
  TaskJson: any;
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
let UpdatedTasks: any = {};

export default function TaskListCreation(props: TaskListProps) {
  const [tasks, setTasks] = useState<any>(null);
  const [documents, setDocuments] = useState<any>(null);
  const [users, setUsers] = useState<any>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {}, [tasks]);

  function init() {
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
        if (!documents) {
          setDocuments(value);
        }
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
            if (!users) {
              setUsers(list);
            }
          });
        });
      } catch (e) {}
    });
  }

  // Convert the tasks to RDF and upload them to fuseki
  function CreateTaskGraph(event: React.MouseEvent<HTMLButtonElement>) {
    //console.log(props.TaskJson);
    //setTasks(props.TaskJson);
    //ConvertTasks(props.TaskJson);
  }

  function AssigneeSelected(event: React.ChangeEvent<HTMLSelectElement>) {
    for (const [key, value] of Object.entries(UpdatedTasks)) {
      let Task: any = value;
      if (
        key.includes(event.target.id) ||
        Task.parent_intervention.includes(event.target.id)
      ) {
        Task["assigned_to"] = event.target.selectedOptions[0].id;
      }
    }
  }

  function DocumentSelected(event: React.ChangeEvent<HTMLSelectElement>) {
    for (const [key, value] of Object.entries(UpdatedTasks)) {
      let Task: any = value;
      if (
        key.includes(event.target.id) ||
        Task.parent_intervention.includes(event.target.id)
      ) {
        Task["document_uri"] = event.target.selectedOptions[0].id;
      }
    }

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

  function CreateDocumentsDropdown() {
    let DocumentOptions: any;
    if (documents) {
      DocumentOptions = documents.map((d: any) => {
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

  function CreatePeopleDropdown() {
    let People: any;
    if (users) {
      People = users.map((p: any) => {
        return (
          <option id={p["@id"]}>
            {p.name} ({p.mbox.split("mailto:")[1]})
          </option>
        );
      });
    }

    return People;
  }

  function HighlightObjects(ObjectIDs: any[], highlight: boolean) {
    let viewerScene = viewer_instance.scene.objects;
    //console.log(ObjectIDs);
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

  function SelectMainTask(
    event: AccordionState,
    ParentIntervention: any,
    Storeys: any
  ) {
    let selectedObjects: string[] = [];
    Object.entries(FilteredIfcElements).map((e: any) => {
      //Check if the Element is on the right storey
      if (e[1].parent.id === Storeys.id) {
        selectedObjects.push(e[1].id);
      }
    });
    HighlightObjects(selectedObjects, event[0]);
  }

  function CreateSubTasks(Storeys: any) {
    const TasksNew = Object.entries(props.TaskJson).map((d: any) => {
      // Check if they are interventions
      if (d[0] === "interventions") {
        // Find the Parent Interventions
        const ParentInterventions = d[1].map((p: any) => {
          // If there is no parent intervention it means it is a Parent itself!
          if (!p.parent_intervention) {
            let ParentIntervention = { ...p };
            ParentIntervention.id = Storeys.id + "_" + p.id;
            UpdatedTasks[ParentIntervention.id] = ParentIntervention;
            // Create a Card for every IFC Element
            const IfcElements = Object.entries(FilteredIfcElements).map(
              (e: any) => {
                //Check if the Element is on the right storey
                if (e[1].parent.id === Storeys.id) {
                  // Generate SubTasks for every Element
                  const SubTasks = d[1].map((s: any) => {
                    // No Parent Tasks
                    if (s.parent_intervention === p.id) {
                      // copy the current intervention
                      let tempIntervention;
                      tempIntervention = { ...s };

                      // edit the ID by combining it with the element ID and change the "requiered previous" IDs
                      tempIntervention.id = e[0] + "_" + s.id;
                      tempIntervention.parent_intervention =
                        ParentIntervention.id;

                      if (tempIntervention.required_previous) {
                        let RequieredPrev =
                          tempIntervention.required_previous.map(function (
                            x: any
                          ) {
                            return e[0] + "_" + x;
                          });
                        tempIntervention.required_previous = RequieredPrev;
                      }
                      let aabb = viewer_instance.scene.objects[e[0]]._aabb;

                      tempIntervention.location = [
                        (aabb[0] + aabb[3]) / 2,
                        (aabb[1] + aabb[4]) / 2,
                        (aabb[2] + aabb[5]) / 2,
                      ];
                      tempIntervention.up_vector = [0, 0, 1];
                      tempIntervention.forward_vector = [1, 0, 0];

                      UpdatedTasks[tempIntervention.id] = tempIntervention;
                      // Check if the parent is the correct one
                      //TODO: Add Task Data here!
                      return (
                        <Accordion
                          multiple={false}
                          style={{ paddingLeft: "1px" }}
                        >
                          <Accordion.Item
                            style={{ paddingLeft: "1px" }}
                            label={tempIntervention.name}
                            id={tempIntervention.id}
                          >
                            <Text>{tempIntervention.id}</Text>
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
                        HighlightObjects([e[1].id], event[0]);
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
              //console.log(p);
              return (
                <Accordion
                  onChange={(e: AccordionState) => {
                    SelectMainTask(e, p, Storeys);
                  }}
                  style={{ paddingLeft: "5px" }}
                >
                  <Accordion.Item
                    style={{ paddingLeft: "5px" }}
                    label={ParentIntervention.name}
                    id={ParentIntervention.id}
                  >
                    <Text>Assigned To:</Text>
                    <Form.Select
                      aria-label="Default select example"
                      id={ParentIntervention.id}
                      onChange={(event) => AssigneeSelected(event)}
                    >
                      <option>Select a person/organization</option>
                      {CreatePeopleDropdown()}
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

  viewer_instance = props.viewer;

  let metaObjects = viewer_instance.metaScene.getObjectIDsByType(
    "IfcWallStandardCase"
  );
  for (let object in metaObjects) {
    let IfcElement = viewer_instance.metaScene.metaObjects[metaObjects[object]];
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

  const AccordionList = props.IfcStoreys.map((d) => {
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
          id={d.id}
          onChange={(event) => DocumentSelected(event)}
        >
          <option>Select corresponding (2D) Document</option>
          {CreateDocumentsDropdown()}
        </Form.Select>
        <p />
        Tasks:
        {CreateSubTasks(d)}
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
        <Button
          onClick={() => {
            console.log(UpdatedTasks);
          }}
        >
          <Text>Create Tasks</Text>
        </Button>
      </div>
      <p />
    </div>
  );
}
