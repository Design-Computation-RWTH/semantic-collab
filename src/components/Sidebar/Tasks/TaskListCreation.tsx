import React, {MouseEventHandler} from "react";

import {Accordion, Form} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BcfOWLService from "../../../services/BcfOWLService";
import PubSub from "pubsub-js";
import XeoKitView from "../../Viewport/XeoKitView";
import BcfOWLProjectSetup from "../../../services/BcfOWLProjectSetup";

type TaskListProps = {
    TaskJson: object;
    IfcStoreys: any [];
    viewer: XeoKitView;
};

type TaskListState = {
    tasks:any;
    documents: any;
    users: any;
};

let viewer_instance: XeoKitView["viewer"];

let FilteredIfcElements: any = {};

export class TaskListCreation extends React.Component<TaskListProps,TaskListState> {

    constructor(props: TaskListProps | Readonly<TaskListProps>) {
        super(props);
        this.state = {
            tasks: null,
            documents: null,
            users: null,
        }
    }

    componentWillUnmount() {

    }

    CreateTaskGraph(event: React.MouseEvent<HTMLButtonElement>) {
        console.log("Create Tasks Graph")
    }

    DocumentSelected(event: React.ChangeEvent<HTMLSelectElement>){

        let documents = this.state.documents;
        for (const doc in documents) {
            if(event.target.selectedOptions[documents[doc]["@id"]]) {
                let bcfowl=new BcfOWLService();
                bcfowl.describe(documents[doc].hasSpatialRepresentation)
                    .then(spatial_representation => {
                        PubSub.publish('DocumentSelected', {
                            id: documents[doc]["@id"],
                            url: documents[doc].hasDocumentURL,
                            spatial_representation: spatial_representation,
                            //data: data.data,
                            name: documents[doc].hasFilename,
                        });
                    })
                    .catch(err => {
                        console.log(err)
                    });
            }
        }
    }

    CreateDocumentsDropdown() {
        let DocumentOptions: any
        if (this.state.documents) {
            DocumentOptions = this.state.documents.map((d: any) => {
                if (d.hasFilename.endsWith(".png")){
                    return <option value={d.hasFilename} id={d["@id"]}>{d.hasFilename}</option>
                }
            })
        }
        return DocumentOptions

    }

    CreatePeopleDropdown() {
        let People: any;
        if (this.state.users) {
        People = this.state.users.map((p: any) => {
            return <option id={p["@id"]}>{p.name} ({p.mbox.split("mailto:")[1]})</option>
        })

        }

        return People
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
                        const Elements = Object.entries(FilteredIfcElements).map((e: any) => {
                            //Check if the Element is on the right storey
                            if (e[1].parent.id === Storeys.id) {
                                // Generate SubTasks for every Element
                                const SubTasks = d[1].map((s: any) => {
                                    // No Parent Tasks
                                    if (s.parent_intervention === p.id) {
                                        // Check if the parent is the correct one
                                        return (
                                            <Accordion.Item eventKey={s.id}>
                                                <Accordion.Header>
                                                    {s.name}
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    Hello World
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        )
                                    }
                                })
                                return  (
                                    <Accordion.Item eventKey={e[1].id}>
                                        <Accordion.Header>
                                            { e[1].name }
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Accordion>
                                                {SubTasks}
                                            </Accordion>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                )
                            }
                            // Return empty if it does not belong to the right storey
                            else {
                                return null}

                            })
                        // Check if the first Element is valid. Strange work around, but currently the script puts empty values in the Array if the Storey is wrong
                        if (Elements[0]) {
                            return  (
                                <Accordion.Item eventKey={p.id}>
                                    <Accordion.Header>
                                        { p.name }
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Accordion>
                                            Assigned To:
                                            <Form.Select aria-label="Default select example" id={d.id + "_Document"}>
                                                <option>Select a person/organization</option>
                                                {this.CreatePeopleDropdown()}
                                            </Form.Select>
                                            <p/>
                                            {Elements}
                                        </Accordion>
                                    </Accordion.Body>
                                </Accordion.Item> )
                        } else {
                            return <div></div>
                        }


                    }
                })
                return ParentInterventions

            }
        })


        return TasksNew
    }

    render() {

        viewer_instance = this.props.viewer.viewer;

        let metaObjects = viewer_instance.metaScene.getObjectIDsByType("IfcWallStandardCase")
        for (let object in metaObjects) {

            let IfcElement = viewer_instance.metaScene.metaObjects[metaObjects[object]]
            for ( let pSet in IfcElement.propertySets) {
                if (IfcElement.propertySets[pSet].name === "Pset_WallCommon") {
                    let propSet = IfcElement.propertySets[pSet].properties;
                    for (let propSetProp in propSet) {
                        if (propSet[propSetProp].name === "IsExternal" && propSet[propSetProp].value === "T") {

                            FilteredIfcElements[IfcElement.id] = IfcElement;
                        }
                    }

                }
            }
        }

        let ActiveKeys = [""] ;


        const AccordionList = this.props.IfcStoreys.map(d => {
            ActiveKeys.push(d.id)
            return (
                <Accordion.Item eventKey={d.id}>
                    <Accordion.Header>
                        {d.name}

                    </Accordion.Header>
                    <Accordion.Body>
                        Assign to Document:
                        <Form.Select aria-label="Default select example" id={d.id + "_Document"} onChange={(event) => this.DocumentSelected(event)} >
                            <option>Select corresponding (2D) Document</option>
                            {this.CreateDocumentsDropdown()}
                        </Form.Select>
                        <p/>
                        Tasks:
                        {this.CreateSubTasks(d)}

                    </Accordion.Body>
                </Accordion.Item>
            )

        }   );

        return (
            <div className={"accordion"} id={"accordionExample"}>
                <Accordion defaultActiveKey={ActiveKeys} alwaysOpen>
                    {AccordionList}
                </Accordion>
                <p/>
                <div className={"caia-center"}>
                    <button className="btn-caia" onClick={this.CreateTaskGraph}>Create Tasks</button>
                </div>
                <p/>
            </div>);
    }


    componentDidMount() {
        this.init()
    }

    init() {
        let bcfowl=new BcfOWLService();
        let bcfowl_setup=new BcfOWLProjectSetup();

        if (viewer_instance) {

            viewer_instance.cameraControl.on("picked", (e: any) => {
                console.log("Task Pick")
                console.log(e)
            })
        }
        bcfowl.getDocuments()
            .then((value: any) => {
                if(value["@graph"])
                    value=value["@graph"];
                if(!Array.isArray(value))
                    value=[value];
                this.setState({ documents: value });
                console.log(value)

            })
            .catch((err: any) => {
                console.log(err)
            });

        bcfowl_setup.getCurrentProject().then(value => {

            try {
                if(!Array.isArray(value.hasUser))
                    value.hasUser=[value.hasUser];
                let list: string[]=[];
                value.hasUser.forEach((user: string) => {
                    console.log("userid: " + user);
                    bcfowl.describeUser(user).then(u => {
                            list = list.concat(u);
                            console.log(list);
                            this.setState({users: list})
                        }
                    )

                });
            }
            catch (e) {
                console.log("No users");
            }
        });

    }
}
