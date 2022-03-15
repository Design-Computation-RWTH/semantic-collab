import React from "react";

import {Accordion, Form} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BcfOWLService from "../../../services/BcfOWLService";
// @ts-ignore
import PubSub from "pubsub-js";
import XeoKitView from "../../Viewport/XeoKitView";

type TaskListProps = {
    TaskJson: object;
    IfcStoreys: any [];
    viewer: XeoKitView;
};

type TaskListState = {
    tasks:any;
    documents: any;
};

let viewer_instance;

export class TaskListCreation extends React.Component<TaskListProps,TaskListState> {

    constructor(props: TaskListProps | Readonly<TaskListProps>) {
        super(props);
        this.state = {
            tasks: null,
            documents: null,
        }
    }

    componentWillUnmount() {
    }

    render() {

        viewer_instance = this.props.viewer.viewer;

        let metaObjects = viewer_instance.metaScene.getObjectIDsByType("IfcWallStandardCase")
        let IfcExteriorWalls: any = {};
        for (let object in metaObjects) {

            let IfcElement = viewer_instance.metaScene.metaObjects[metaObjects[object]]
            for ( let pSet in IfcElement.propertySets) {
                if (IfcElement.propertySets[pSet].name === "Pset_WallCommon") {
                    let propSet = IfcElement.propertySets[pSet].properties;
                    for (let propSetProp in propSet) {
                        if (propSet[propSetProp].name === "IsExternal" && propSet[propSetProp].value === "T") {
                            IfcExteriorWalls[metaObjects[object]] = IfcElement;
                        }
                    }

                }
            }
        }
        console.log(IfcExteriorWalls)

        let ActiveKeys = [""] ;
        let DocumentOptions: any
        if (this.state.documents) {
            DocumentOptions = this.state.documents.map((d: any) => {
                if (d.hasFilename.endsWith(".png")){
                    return <option value={d.hasFilename}>{d.hasFilename}</option>
                }
            })
        }


        const AccordionList = this.props.IfcStoreys.map(d => {
            ActiveKeys.push(d.id)
            return (
                <Accordion.Item eventKey={d.id}>
                    <Accordion.Header>
                        {d.name}

                    </Accordion.Header>
                    <Accordion.Body>
                        Assign to Document:
                        <Form.Select aria-label="Default select example" id={d.id + "_Document"}>
                            <option>Select corresponding (2D) Document</option>
                            {DocumentOptions}
                        </Form.Select>
                    </Accordion.Body>
                </Accordion.Item>
            )

        }   );

        return (
            <div className={"accordion"} id={"accordionExample"}>
                <Accordion defaultActiveKey={ActiveKeys} alwaysOpen>
                    {AccordionList}
                </Accordion>
            </div>);
    }


    componentDidMount() {
        this.init()
    }

    init() {
        let bcfowl=new BcfOWLService();

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

    }
}
