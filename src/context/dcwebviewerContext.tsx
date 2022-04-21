import * as React from "react";
import {
  DcWebViewerContextType,
  VisibleDocument,
  SelectedDocument,
} from "../@types/dcwebviewer";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";

export const ViewerContext = React.createContext<DcWebViewerContextType | null>(
  null
);

const ViewerProvider: React.FC<React.ReactNode> = ({ children }) => {
  const [visibleDocuments, setVisibleDocuments] = React.useState<
    VisibleDocument[]
  >([]);
  const [viewer, setViewer] = React.useState<Viewer>();

  const [file, setFile] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<string>("");

  const [projectID, setProjectID] = React.useState("");

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
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};

export default ViewerProvider;
