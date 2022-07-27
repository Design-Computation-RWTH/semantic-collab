import * as React from "react";
import {
  DcWebViewerContextType,
  VisibleDocument,
  SelectedDocument,
} from "../@types/dcwebviewer";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import { useState } from "react";

export const ViewerContext = React.createContext<DcWebViewerContextType | null>(
  null
);

const ViewerProvider: React.FC<React.ReactNode> = ({ children }) => {

  const [serverUrl, setServerUrl] = React.useState<string>("");

  const [visibleDocuments, setVisibleDocuments] = React.useState<
    VisibleDocument[]
  >([]);
  const [viewer, setViewer] = React.useState<Viewer>();

  const [viewerDocuments, setViewerDocuments] = React.useState<{
    [document_id: string]: boolean;
  }>({});

  const [lastSelection, setLastSelection] = React.useState<any>();

  const [file, setFile] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<string>("");

  const [representationScreen, setRepresentationScreen] = React.useState<number>(0)

  const [projectID, setProjectID] = React.useState("");

  const [imageList, setImageList] = React.useState<any[]>([]);

  const [viewpoints, setViewpoints] = React.useState<string[]>([]);

  const [currentViewpoint, setCurrentViewpoint] = React.useState<string>("");

  const [extensions, setExtensions] = React.useState(new Map());
  const [taskExtensions, setTaskExtensions] = React.useState(new Map());
  const [users, setUsers] = React.useState(new Map());

  const [galleryScreen, setGalleryScreen] = React.useState<number>(0);

  const [activeTab, setActiveTab] = React.useState<any>(0);

  const [largeGalleryImg, setLargeGalleryImg] =
    React.useState<string>("/Icon_v2.svg");

  let InitialDocument: SelectedDocument = {
    id: "",
    url: "",
    spatial_representation: null,
    data: null,
    name: "",
  };
  const [selectedDocument, setSelectedDocument] =
    React.useState<SelectedDocument>(InitialDocument);

  const addVisibleDocument = (visibleDocument: VisibleDocument) => {
    const newVisibleDocument: VisibleDocument = {
      id: visibleDocument.id,
      uri: visibleDocument.uri,
    };
    setVisibleDocuments([...visibleDocuments, newVisibleDocument]);
  };

  const [activeGalleryTopic, setActiveGalleryTopic] = useState<any>(null);

  return (
    <ViewerContext.Provider
      value={{
        serverUrl,
        setServerUrl,
        viewer,
        setViewer,
        file,
        setFile,
        fileName,
        setFileName,
        projectID,
        setProjectID,
        selectedDocument,
        setSelectedDocument,
        visibleDocuments,
        addVisibleDocument,
        viewerDocuments,
        setViewerDocuments,
        extensions,
        setExtensions,
        taskExtensions,
        setTaskExtensions,
        users,
        setUsers,
        galleryScreen,
        setGalleryScreen,
        largeGalleryImg,
        setLargeGalleryImg,
        activeGalleryTopic,
        setActiveGalleryTopic,
        lastSelection,
        setLastSelection,
        imageList,
        setImageList,
        activeTab,
        setActiveTab,
        viewpoints,
        setViewpoints,
        currentViewpoint,
        setCurrentViewpoint,
        representationScreen,
        setRepresentationScreen
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};

export default ViewerProvider;
