import { Viewer } from "@xeokit/xeokit-sdk";
import { SetStateAction } from "react";

// @types.dcwebviewer.ts

export interface VisibleDocument {
  id: string;
  uri: string;
}

export type SelectedDocument = {
  id: string;
  url: string;
  spatial_representation: any;
  data: any;
  name: string;
};

export type DcWebViewerContextType = {
  viewer: Viewer;
  setViewer: Dispatch<SetStateAction<Viewer>>;

  file: string;
  setFile: Dispatch<SetStateAction<string>>;

  fileName: string;
  setFileName: Dispatch<SetStateAction<string>>;

  projectID: string;
  setProjectID: Dispatch<SetStateAction<string>>;

  selectedDocument: SelectedDocument;
  setSelectedDocument: Dispatch<SetStateAction<SelectedDocument>>;

  visibleDocuments: VisibleDocument[];
  addVisibleDocument: (document: VisibleDocument) => void;

  extensions: Map;
  setExtensions: Dispatch<SetStateAction<Map>>;

  users: Map;
  setUsers: Dispatch<SetStateAction<Map>>;
  //addViewer: (viewer: Viewer) => void;
};
