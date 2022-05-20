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
  const [visibleDocuments, setVisibleDocuments] = React.useState<
    VisibleDocument[]
  >([]);
  const [viewer, setViewer] = React.useState<Viewer>();

  const [viewerDocuments, setViewerDocuments] = React.useState<{
    [document_id: string]: boolean;
  }>({});

  const [file, setFile] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<string>("");

  const [projectID, setProjectID] = React.useState("");

  const [imageList, setImageList] = React.useState<any[]>([]);

  const [viewpoints, setViewpoints] = React.useState<string[]>([]);

  const [extensions, setExtensions] = React.useState(new Map());
  const [users, setUsers] = React.useState(new Map());

  const [galleryScreen, setGalleryScreen] = React.useState<number>(0);

  const [activeTab, setActiveTab] = React.useState<number>(0);

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
        users,
        setUsers,
        galleryScreen,
        setGalleryScreen,
        largeGalleryImg,
        setLargeGalleryImg,
        activeGalleryTopic,
        setActiveGalleryTopic,
        imageList,
        setImageList,
        activeTab,
        setActiveTab,
        viewpoints,
        setViewpoints,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};

export default ViewerProvider;
