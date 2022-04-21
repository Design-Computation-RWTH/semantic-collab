import React from "react";
import { BsCalendarCheck, BsCardImage, BsLayers } from "react-icons/bs";
import { Tabs } from "@mantine/core";
import Representations from "./Representations";
import Gallery from "./Gallery";
import Tasks from "./Tasks";

// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";

type SidebarProps = {
  viewer: Viewer;
};

export default function Sidebar(props: SidebarProps) {
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
        <Representations />
      </Tabs.Tab>
      <Tabs.Tab title="Gallery" icon={<BsCardImage />}>
        <Gallery />
      </Tabs.Tab>
      <Tabs.Tab title="Tasks" icon={<BsCalendarCheck />}>
        <Tasks />
      </Tabs.Tab>
    </Tabs>
  );
}
