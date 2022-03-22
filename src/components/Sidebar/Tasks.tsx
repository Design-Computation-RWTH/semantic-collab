import React, {useState} from "react";
import {Container, ScrollArea} from "@mantine/core";
import {TaskListPreview} from "./Tasks/TaskListPreview";
import {TaskListCreation} from "./Tasks/TaskListCreation";
import PubSub from "pubsub-js";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import {ViewerContext} from "../../context/dcwebviewerContext";
import {DcWebViewerContextType} from "../../@types/dcwebviewer";

const testJSON = require("./Tasks/TasksExample.json")
let Viewer_instance = null;

type TaskView = "Preview" | "Creation" ;

type TasksProps = {
};

type TasksState = {
    tasks:any;
    viewState:TaskView;
    storeys: object;
};

export default function Tasks(props: TasksProps) {

    const [tasks, setTasks] = useState( null);
    const [viewState, setViewState] = useState<TaskView> ("Preview");
    const [storeys, setStoreys] = useState ({});

    const {viewer} = React.useContext(ViewerContext) as DcWebViewerContextType;

    let storeyTemp:any = []

    if (viewer) {
        let storeys = viewer.metaScene.getObjectIDsByType("IfcBuildingStorey")


        for (let storey in storeys) {

            let ifc_storey = viewer.metaScene.metaObjects[storeys[storey]]

            storeyTemp.push(ifc_storey)
        }
    }

    let ViewState = null

    if (viewState == "Preview") {
        ViewState = <TaskListPreview TaskJson={testJSON}/>
    } else if (viewState == "Creation") {
        ViewState = <TaskListCreation TaskJson={testJSON} IfcStoreys={storeyTemp} viewer={viewer}/>
    }

    return (
        <div className=" caia-fill">
            <ScrollArea style={{height:"100%"}}>
                {ViewState}
            </ScrollArea>
            <Container style={{display: "flex", width:"100%", justifyContent:"center"}} sx={(theme) => ({
                backgroundColor: theme.colors.dark
            })}>
                <button className="btn-caia-icon" title="Refresh Tasks" onClick={()=> {
                    if (viewer) {
                        setViewState("Creation");
                    } else {
                        alert("Please load an IFC Building Representation First")
                    }
                }}>
                    <i className="icon bi-plus-square btn-caia-icon-size"/>
                </button>
            </Container>
        </div>);

}
