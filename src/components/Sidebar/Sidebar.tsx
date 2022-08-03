import React, { useEffect } from "react";
import { BsCalendarCheck, BsCardImage, BsLayers } from "react-icons/bs";
import { Tabs } from "@mantine/core";
import RepresentationsTab from "./RepresentationsTab";
import GalleryTab from "./GalleryTab";
import TasksTab from "./TasksTab";
import { ViewerContext } from "../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../@types/dcwebviewer";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
import BcfOWL_Endpoint from "../../services/BcfOWL_Endpoint";


export default function CAIA_Sidebar() {
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

    setActiveTab("Representations");
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
    });
  }

  return (
    <Tabs
      value={activeTab}
      variant="pills"
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
        // body: { height: "95%", width: "100%", maxWidth: "100%", backgroundColor: "#00000", },
        root: { height: "100%", width: "100%" },
        panel: { height: "100%"}
        // tabsListWrapper: { height: "5%" },
      }}
      //tabPadding={0}
    >
      <Tabs.List>
        <Tabs.Tab value="Representations" title="Representations" icon={<BsLayers />}/>
        <Tabs.Tab value="Gallery" title="Gallery" icon={<BsCardImage />}/>
        <Tabs.Tab onClick={()=>{}} value="Tasks" title="Tasks" icon={<BsCalendarCheck />}/>
      </Tabs.List>
      <Tabs.Panel style={{height:"100%", paddingBottom: "25px"}} value="Representations" pt="xs">
          <RepresentationsTab />
      </Tabs.Panel>
      <Tabs.Panel style={{height:"100%", paddingBottom: "25px"}} value="Gallery" pt="xs">
        <GalleryTab />
      </Tabs.Panel>
      <Tabs.Panel  style={{height:"100%", paddingBottom: "25px"}} value="Tasks" pt="xs">
        <TasksTab />
      </Tabs.Panel>
    </Tabs>
  );
}
