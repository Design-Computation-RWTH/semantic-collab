import React from "react";
import { Gantt, ViewMode } from 'gantt-task-react';
import {handleDblClick} from "./Tasks/tasks_gantt";
import {TaskListPreview} from "./Tasks/TaskListPreview";
import {TaskListCreation} from "./Tasks/TaskListCreation";
import XeoKitView from "../Viewport/XeoKitView";
// @ts-ignore
import PubSub from "pubsub-js";

const testJSON = require("./Tasks/TasksExample.json")
let Viewer_instance = null;

type TaskView = "Preview" | "Creation" ;

type TasksProps = {
    viewer: XeoKitView
};

type TasksState = {
    tasks:any;
    viewState:TaskView;
    storeys: object;
};

class Tasks extends React.Component<TasksProps,TasksState> {

    constructor(props: TasksProps | Readonly<TasksProps>) {
        super(props);
        this.state = {
            tasks: null,
            viewState: "Preview",
            storeys: {},
        }
    }

    componentWillUnmount() {
    }

    render() {

        Viewer_instance = this.props.viewer.viewer;
        let storeyTemp:any = []

        if (Viewer_instance) {
            let storeys = Viewer_instance.metaScene.getObjectIDsByType("IfcBuildingStorey")


            for (let storey in storeys) {

                let ifc_storey = Viewer_instance.metaScene.metaObjects[storeys[storey]]

                storeyTemp.push(ifc_storey)
            }
        }

        let ViewState = null

        if (this.state.viewState == "Preview") {
            ViewState = <TaskListPreview TaskJson={testJSON}/>
        } else if (this.state.viewState == "Creation") {
            ViewState = <TaskListCreation TaskJson={testJSON} IfcStoreys={storeyTemp} viewer={this.props.viewer}/>
        }

        return (
            <div className="caia-fill caia-background">
                <div className="yscroll">
                    {ViewState}
                </div>
                <div className="caia-submenu-border">
                    <button className="btn-caia-icon" title="Refresh Tasks" onClick={()=> {
                        if (this.props.viewer) {
                            this.setState({viewState: "Creation"})
                        } else {
                            alert("Please load an IFC Building Representation First")
                        }
                    }}>
                        <i className="icon bi-plus-square btn-caia-icon-size"/>
                    </button>
                </div>
            </div>);
    }


    componentDidMount() {
        this.init()
    }

    init() {

    }
}

/*function handleChecked(viewer, id) {
    let checked = false;
    if(viewer.viewer.scene.models[id]){
        checked = viewer.viewer.scene.models[id].visible
    }

    return checked;
}*/

export default Tasks;