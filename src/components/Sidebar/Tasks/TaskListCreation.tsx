import React, { MouseEventHandler, useEffect, useState } from "react";
import { Button, Accordion, Text, Container, CloseButton } from "@mantine/core";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import PubSub from "pubsub-js";
import { ConvertTasks } from "../../../services/ConvertTasks2RDF";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import BcfOWLProjectSetup from "../../../services/BcfOWLProjectSetup";
import { TaskContext } from "../../../context/taskContext";
import { TaskTypes } from "../../../@types/taskTypes";
const wkt = require("terraformer-wkt-parser");

type TaskListProps = {
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
let ProjectURI: string = "";

export default function TaskListCreation(props: TaskListProps) {
  const [tasks, setTasks] = useState<any>(null);
  const [taskJson, setTaskJson] = useState<any>(null);
  const [documents, setDocuments] = useState<any>(null);
  const [users, setUsers] = useState<any>(null);

  const { taskFile, setTaskViewState, setTaskFile } = React.useContext(
    TaskContext
  ) as TaskTypes;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {}, [tasks]);

  function init() {
    let bcfowl = new BcfOWL_Endpoint();
    let bcfowl_setup = new BcfOWLProjectSetup();

    taskFile?.arrayBuffer().then((res) => {
      let taskString = new TextDecoder().decode(res);

      setTaskJson(JSON.parse(taskString));

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
        ProjectURI = value["@id"];
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
    });
  }

  function AssigneeSelected(event: React.ChangeEvent<HTMLSelectElement>) {
    for (const [key, value] of Object.entries(UpdatedTasks)) {
      let Task: any = value;
      if (key.includes(event.target.id)) {
        Task["assigned_to"] = event.target.selectedOptions[0].id;
      } else if (Task.parent_intervention) {
        if (Task.parent_intervention.includes(event.target.id)) {
          Task["assigned_to"] = event.target.selectedOptions[0].id;
        }
      } else {
      }
    }
  }

  function DocumentSelected(event: React.ChangeEvent<HTMLSelectElement>) {
    for (const [key, value] of Object.entries(UpdatedTasks)) {
      let Task: any = value;
      if (key.includes(event.target.id)) {
        Task["document_uri"] = event.target.selectedOptions[0].id;
      } else if (Task.parent_intervention) {
        if (Task.parent_intervention.includes(event.target.id)) {
          Task["document_uri"] = event.target.selectedOptions[0].id;
        }
      } else {
      }
    }

    for (const doc in documents) {
      if (event.target.selectedOptions[documents[doc]["@id"]]) {
        let bcfowl = new BcfOWL_Endpoint();
        bcfowl
          .describe(documents[doc].hasSpatialRepresentation)
          .then((spatial_representation) => {
            //Find the spatial Representation
            let spatialLocationConv: any = wkt.parse(
              spatial_representation.hasLocation
            );
            let spatialLocation: number[] = spatialLocationConv.coordinates;

            for (const [key, value] of Object.entries(UpdatedTasks)) {
              let Task: any = value;
              if (Task["document_uri"] === event.target.selectedOptions[0].id) {
                if (Task.location) {
                  Task.location = [
                    Task.location[0] - spatialLocation[0] / 10,

                    (Task.location[1] - spatialLocation[1] / 10) * -1,

                    Task.location[2] - spatialLocation[2] / 10,
                  ];
                }
              } else {
              }
            }

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

  function HighlightObjects(ObjectIDs: any[]) {
    let viewerScene = viewer_instance.scene.objects;
    for (const Element in viewerScene) {
      let elementID = viewerScene[Element].id;
      if (ObjectIDs.includes(elementID)) {
        viewerScene[Element].highlighted = true;
      } else {
        viewerScene[Element].highlighted = false;
      }
    }
  }

  function SelectMainTask(ParentIntervention: any, Storeys: any) {
    let selectedObjects: string[] = [];
    Object.entries(FilteredIfcElements).map((e: any) => {
      //Check if the Element is on the right storey
      if (e[1].parent.id === Storeys.id) {
        selectedObjects.push(e[1].id);
      }
    });
    HighlightObjects(selectedObjects);
  }

  function CreateSubTasks(Storeys: any) {
    let TasksNew;
    if (taskJson !== null) {
      TasksNew = Object.entries(taskJson).map((d: any) => {
        // Check if they are interventions
        if (d[0] === "interventions") {
          // Find the Parent Interventions
          const ParentInterventions = d[1].map((p: any) => {
            // If there is no parent intervention it means it is a Parent itself!
            if (!p.parent_intervention) {
              // Create a Card for every IFC Element
              const IfcElements = Object.entries(FilteredIfcElements).map(
                (e: any) => {
                  //Check if the Element is on the right storey
                  if (e[1].parent.id === Storeys.id) {
                    let ParentIntervention = { ...p };
                    ParentIntervention.id = Storeys.id + "_" + p.id + e[0];
                    ParentIntervention.name = p.name + "_" + e[1].name;
                    UpdatedTasks[ParentIntervention.id] = ParentIntervention;
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

                        // Calculate location. Keep in mind to later make this location relative to its document!
                        tempIntervention.location = [
                          (aabb[0] + aabb[3]) / 2,
                          (aabb[2] + aabb[5]) / 2,
                          (aabb[1] + aabb[4]) / 2,
                        ];

                        tempIntervention.up_vector = [0, 0, 1];
                        tempIntervention.forward_vector = [1, 0, 0];

                        tempIntervention.buildingElement = e[0];

                        UpdatedTasks[tempIntervention.id] = tempIntervention;
                        // Check if the parent is the correct one
                        //TODO: Add Task Data here!
                        return (
                          <Accordion
                            multiple={false}
                            key={tempIntervention.id}
                            style={{ paddingLeft: "1px" }}
                          >
                            <Accordion.Item
                              style={{ paddingLeft: "1px" }}
                              value={tempIntervention.name}
                              key={tempIntervention.id + "_Item"}
                              id={tempIntervention.id}
                            >
                              <Accordion.Control>
                                {tempIntervention.name}
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Text>{tempIntervention.id}</Text>
                              </Accordion.Panel>
                            </Accordion.Item>
                          </Accordion>
                        );
                      }
                    });
                    // Create main tasks with Subtasks as children
                    return (
                      // This is the building element
                      <Accordion
                        key={e[1].id}
                        onChange={() => {
                          HighlightObjects([e[1].id]);
                        }}
                        style={{ paddingLeft: "5px" }}
                      >
                        <Accordion.Item
                          style={{ paddingLeft: "5px" }}
                          value={p.name + "_" + e[1].name}
                          key={e[1].id + "_Item"}
                          id={e[1].id}
                        >
                          <Accordion.Control>
                            {p.name + "_" + e[1].name}
                          </Accordion.Control>
                          <Accordion.Panel>{SubTasks}</Accordion.Panel>
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
                return (
                  <Accordion
                    key={p.id}
                    onChange={() => {
                      SelectMainTask(p, Storeys);
                    }}
                    style={{ paddingLeft: "5px" }}
                  >
                    <Accordion.Item
                      style={{ paddingLeft: "5px" }}
                      key={p.id + "_Item"}
                      value={p.name}
                      id={p.id}
                    >
                      <Accordion.Control>{p.name}</Accordion.Control>
                      <Accordion.Panel>
                        <Text>Assigned To:</Text>
                        <Form.Select
                          aria-label="Default select example"
                          id={p.id}
                          onChange={(event) => AssigneeSelected(event)}
                        >
                          <option>Select a person/organization</option>
                          {CreatePeopleDropdown()}
                        </Form.Select>
                        <p />
                        {IfcElements}
                      </Accordion.Panel>
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
    }

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
        value={d.name}
        key={d.id + "_Item"}
        id={d.id + "_Item"}
      >
        <Accordion.Control>{d.name}</Accordion.Control>
        <Accordion.Panel>
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
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

  return (
    <div
      className={"GalleryContent"}
      style={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <Container style={{ width: "100%", maxWidth: "100%" }}>
        <div>
          <CloseButton
            onClick={() => {
              setTaskFile(null);
              setTaskViewState("Preview");
            }}
          />
          <Accordion style={{ paddingLeft: "5px" }} id={"AccordionListId"}>
            {AccordionList}
          </Accordion>
          <p />
          <div className={"caia-center"}>
            <Button
              onClick={() => {
                let tasks2Convert: any = taskJson;
                let UpdatedTasksArr: any = [];
                for (const [key, value] of Object.entries(UpdatedTasks)) {
                  UpdatedTasksArr.push(value);

                  let task: any = value;
                  if (task.id === "1ZwJH$85D3YQG5AK5ER1gZ_45623") {
                  }
                }

                tasks2Convert.interventions = UpdatedTasksArr;
                tasks2Convert.intervention_posts = taskJson.intervention_posts;
                tasks2Convert.intervention_priorities =
                  taskJson.intervention_priorities;

                let bcfowl = new BcfOWL_Endpoint();

                //let rdfTasks = ConvertTasks(tasks2Convert, ProjectURI);

                let rdfTasks;

                ConvertTasks(tasks2Convert, ProjectURI).then((e) => {
                  rdfTasks = e;

                  bcfowl
                    .postRDF(rdfTasks)
                    .then((r) => {
                      setTaskFile(null);
                      setTaskViewState("Preview");
                    })
                    .catch((e) => {});
                });
              }}
            >
              <Text>Create Tasks</Text>
            </Button>
          </div>
          <p />
        </div>
      </Container>
    </div>
  );
}
