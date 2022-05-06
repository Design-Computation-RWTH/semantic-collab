import React from "react";
import { BsCalendarCheck, BsCardImage, BsLayers } from "react-icons/bs";
import { Tabs } from "@mantine/core";
import CAIA_Representations_Tab from "./CAIA_Representations_Tab";
import CAIA_Gallery_Tab from "./CAIA_Gallery_Tab";
import CAIA_Tasks_Tab from "./CAIA_Tasks_Tab";

// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";

type SidebarProps = {
  viewer: Viewer;
};

export default function CAIA_Sidebar(props: SidebarProps) {
  return (
    <Tabs
      style={{
        display: "flex",
        width: "30%",
        maxWidth: "30%",
        height: "100%",
        maxHeight: "100%",
        justifyContent: "flex-start",
        alignContent: "stretch",
        alignItems: "stretch",
        flexDirection: "column",
      }}
      styles={{
        body: { height: "100%" },
      }}
      color="dark"
      grow
    >
      <Tabs.Tab title="Representations" icon={<BsLayers />}>
        <CAIA_Representations_Tab />
      </Tabs.Tab>
      <Tabs.Tab title="Gallery" icon={<BsCardImage />}>
        <CAIA_Gallery_Tab />
      </Tabs.Tab>
      <Tabs.Tab title="Tasks" icon={<BsCalendarCheck />}>
        <CAIA_Tasks_Tab />
      </Tabs.Tab>
    </Tabs>
  );
}
