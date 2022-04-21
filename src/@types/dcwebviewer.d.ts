import { Viewer } from "@xeokit/xeokit-sdk";

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
  //addViewer: (viewer: Viewer) => void;
};
