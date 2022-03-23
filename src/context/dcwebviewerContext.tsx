import * as React from "react";
import { DcWebViewerContextType, VisibleDocument } from "../@types/dcwebviewer";
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

  const addVisibleDocument = (visibleDocument: VisibleDocument) => {
    const newVisibleDocument: VisibleDocument = {
      id: visibleDocument.id,
      uri: visibleDocument.uri,
    };
    setVisibleDocuments([...visibleDocuments, newVisibleDocument]);
  };

  /*    const addViewer = (viewer: Viewer) => {
        const newViewer: Viewer = viewer;
        setViewer([...viewer, newViewer]);
    }*/

  return (
    <ViewerContext.Provider
      value={{ viewer, setViewer, visibleDocuments, addVisibleDocument }}
    >
      {children}
    </ViewerContext.Provider>
  );
};

export default ViewerProvider;
