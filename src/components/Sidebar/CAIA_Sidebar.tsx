import React, { useEffect, useState } from "react";
import { BsCalendarCheck, BsCardImage, BsLayers } from "react-icons/bs";
import { Tabs } from "@mantine/core";
import CAIA_Representations_Tab from "./CAIA_Representations_Tab";
import CAIA_Gallery_Tab from "./CAIA_Gallery_Tab";
import CAIA_Tasks_Tab from "./CAIA_Tasks_Tab";

// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
import BcfOWL_Endpoint from "../../services/BcfOWL_Endpoint";

type SidebarProps = {
  viewer: Viewer;
};

export default function CAIA_Sidebar(props: SidebarProps) {
  const {
    setExtensions,
    setUsers,
    activeTab,
    setActiveTab,
    setTaskExtensions,
  } = React.useContext(ViewerContext) as DcWebViewerContextType;

  useEffect(() => {
    init();
  }, []);

  function init() {
    //TODO: Clear Project when init. a new one
    // Get Projects Extensions as soon as the Sidebar is initialized

    let bcfowl_project = new BcfOWLProjectSetup();
    let bcfowl = new BcfOWL_Endpoint();

    bcfowl_project.getCurrentProject().then((value) => {
      try {
        if (!Array.isArray(value.hasUser)) value.hasUser = [value.hasUser];
        let list: string[] = [];
        value.hasUser.forEach((user: string) => {
          bcfowl.describeUser(user).then((u) => {
            list = list.concat(u);
            setUsers(list);
          });
        });
      } catch (e) {}
    });

    bcfowl_project.getCurrentProjectExtensions().then((r) => {
      let tempExtensionsMap: Map<any, any> = new Map();
      let tempTaskExtensionsMap: Map<any, any> = new Map();

      for (let v in r["@graph"]) {
        let valueMap = r["@graph"][v];
        console.log(valueMap);
        if (valueMap["hasContext"].includes("TaskRMContext")) {
          if (tempTaskExtensionsMap.has(valueMap["@type"])) {
            let tempExt = tempTaskExtensionsMap.get(valueMap["@type"]);
            let tempExtMap: any = {};
            tempExtMap[valueMap["@id"]] = valueMap["label"];
            tempExt.push(tempExtMap);

            tempTaskExtensionsMap.set(valueMap["@type"], tempExt);
          } else {
            let tempExtMap: any = {};
            tempExtMap[valueMap["@id"]] = valueMap["label"];
            tempTaskExtensionsMap.set(valueMap["@type"], [tempExtMap]);
          }
        } else {
          if (tempExtensionsMap.has(valueMap["@type"])) {
            let tempExt = tempExtensionsMap.get(valueMap["@type"]);
            let tempExtMap: any = {};
            tempExtMap[valueMap["@id"]] = valueMap["label"];
            tempExt.push(tempExtMap);

            tempExtensionsMap.set(valueMap["@type"], tempExt);
          } else {
            let tempExtMap: any = {};
            tempExtMap[valueMap["@id"]] = valueMap["label"];
            tempExtensionsMap.set(valueMap["@type"], [tempExtMap]);
          }
        }
      }
      setExtensions(tempExtensionsMap);
      setTaskExtensions(tempTaskExtensionsMap);
      console.log(tempTaskExtensionsMap);
    });
  }
  const [activeTab1, setActiveTab1] = useState(1);

  return (
    <Tabs
      active={activeTab}
      onTabChange={setActiveTab}
      style={{
        display: "flex",
        width: "30%",
        minWidth: "400px",
        maxWidth: "30%",
        height: "100%",
        maxHeight: "100%",
        justifyContent: "flex-start",
        alignContent: "stretch",
        alignItems: "stretch",
        flexDirection: "column",
      }}
      styles={{
        body: { height: "95%", width: "100%", maxWidth: "100%" },
        root: { height: "100%", width: "100%" },
        tabsListWrapper: { height: "5%" },
      }}
      color="red"
      grow
      tabPadding={0}
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
