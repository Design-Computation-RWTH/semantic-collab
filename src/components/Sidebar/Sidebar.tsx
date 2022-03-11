import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import Representations from "./Representations";
import Gallery from "./Gallery";
import Tasks from "./Tasks";

export default function Sidebar() {

    return (
        <div className="image-grid">
            <div className="sidebar">
                <Tabs defaultActiveKey="representation" id="uncontrolled-tab-example" className="sidebar-tab-nav">
                    <Tab eventKey="representation" title={<span> <i
                        className="icon bi-layers btn-caia-icon-size"/> Representation </span>}>
                        <div className="caia-fill">
                            <Representations/>
                        </div>
                    </Tab>
                    <Tab eventKey="gallery" title={<span> <i
                        className="icon bi-image btn-caia-icon-size"/> Gallery </span>}>
                        <div className="caia-fill">
                            <Gallery/>
                        </div>
                    </Tab>
                    <Tab eventKey="tasks" title={<span> <i
                        className="icon bi-calendar2-event btn-caia-icon-size"/> Tasks </span>}>
                        <div className="caia-fill">
                            <Tasks/>
                        </div>
                    </Tab>
                    {/*<Tab eventKey="treeview" title="Treeview">*/}
                    {/*    <div className="yscroll">*/}
                    {/*        <div id="treeViewContainer" className="tree-style"></div>*/}
                    {/*    </div>*/}
                    {/*</Tab>*/}
                </Tabs>
            </div>
        </div>
    )
}

Sidebar.propTypes = {
}