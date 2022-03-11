import React from "react";
import { Gantt, ViewMode } from 'gantt-task-react';
import {testtasks, handleDblClick} from "./Tasks/tasks_gantt";
// @ts-ignore
import PubSub from "pubsub-js";

type TasksProps = {
};

type TasksState = {
    tasks:any;
};

class Tasks extends React.Component<TasksProps,TasksState> {

    constructor(props: TasksProps | Readonly<TasksProps>) {
        super(props);
        this.state = {
            tasks: null,
        }
    }

    componentWillUnmount() {
    }

    render() {

       let tasksGantt;
       console.log(this.state.tasks)
       if (!this.state.tasks) {
           console.log("empty")
           tasksGantt = <div/>
       } else if (this.state.tasks) {
           console.log("ähh?")
           tasksGantt =
               <Gantt
                   tasks={this.state.tasks}
                   viewMode={ViewMode.Month}
                   onDoubleClick={handleDblClick}
                   listCellWidth="0"
                   barFill={90}
               />
       }
        return (
            <div className="caia-fill caia-background">
                <div className="yscroll">
                    {tasksGantt}
                </div>
                <div className="caia-submenu-border">
                    <button className="btn-caia-icon" title="Refresh Tasks" onClick={()=> {
                        console.log("StateTest")
                        alert("Synch JSON. ")
                        this.setState({tasks: testtasks})
                    }}>
                        <i className="icon bi-arrow-clockwise btn-caia-icon-size"/>
                    </button>
                    <button className="btn-caia-icon" title="Refresh Tasks" onClick={()=> {
                        console.log("StateTest")
                        alert("Generate Tasks. ")
                        PubSub.publish('GenerateTasks', {tasks: this.state.tasks})
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