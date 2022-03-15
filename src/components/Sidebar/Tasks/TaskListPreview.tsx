import React from "react";
import { Gantt, ViewMode } from 'gantt-task-react';
// @ts-ignore
import PubSub from "pubsub-js";

type TaskListProps = {
    TaskJson: object;
};

type TaskListState = {
    tasks:any;
};

export class TaskListPreview extends React.Component<TaskListProps,TaskListState> {

    constructor(props: TaskListProps | Readonly<TaskListProps>) {
        super(props);
        this.state = {
            tasks: null,
        }
    }

    componentWillUnmount() {
    }

    render() {

        return (
            <div className="caia-fill caia-background">
                hey
            </div>);
    }


    componentDidMount() {
        this.init()
    }

    init() {

    }
}
