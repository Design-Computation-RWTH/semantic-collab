import React from "react";
import {BsCalendarCheck, BsCardImage,BsLayers} from "react-icons/bs"
// import {Tab, Tabs} from "react-bootstrap";
import { Tabs } from '@mantine/core';
import Representations from "./Representations";
import Gallery from "./Gallery";
import Tasks from "./Tasks";
import XeoKitView from "../Viewport/XeoKitView";

type SidebarProps = {
    XeokitInst: XeoKitView
};

type SidebarState = {

};

export default class Sidebar extends React.Component<SidebarProps,SidebarState> {

    constructor(props: SidebarProps | Readonly<SidebarProps>) {
        super(props);
        this.state = {

        }
    }

    componentWillUnmount() {
    }

    render() {

        return (
                    <Tabs style={{
                        display: "flex",
                        width:"40vw",
                        height:"100%",
                        justifyContent: "flex-start",
                        alignContent:"stretch",
                        alignItems:"stretch",
                        flexDirection:"column",

                    }}
                          styles={{
                              body: {height: "100%"}
                          }}
                      color="dark" grow>
                        <Tabs.Tab
                            label="Representations"
                            icon={<BsLayers/>}
                        >
                            <div className="caia-fill">
                                <Representations viewer={this.props.XeokitInst}/>
                            </div>
                        </Tabs.Tab>
                        <Tabs.Tab
                            label="Gallery"
                            icon={<BsCardImage/>}
                        >
                            <div  className="caia-fill">
                                <Gallery/>
                            </div>
                        </Tabs.Tab>
                        <Tabs.Tab
                            label="Tasks"
                            icon={<BsCalendarCheck/>}
                        >
                            <div  className="caia-fill">
                                <Tasks viewer={this.props.XeokitInst}/>
                            </div>
                        </Tabs.Tab>
                    </Tabs>
        )

    }

    componentDidMount() {
        this.init()
    }

    init() {

    }


}
