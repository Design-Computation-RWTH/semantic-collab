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
  serverUrl: string;
  setServerUrl: Dispatch<SetStateAction<string>>;

  lastSelection: any;
  setLastSelection: Dispatch<SetStateAction<string>>;

  viewer: Viewer;
  setViewer: Dispatch<SetStateAction<Viewer>>;

  representationScreen: number;
  setRepresentationScreen: Dispact<SetStateAction<number>>;

  file: string;
  setFile: Dispatch<SetStateAction<string>>;

  fileName: string;
  setFileName: Dispatch<SetStateAction<string>>;

  projectID: string;
  setProjectID: Dispatch<SetStateAction<string>>;

  currentViewpoint: string;
  setCurrentViewpoint: Dispatch<SetStateAction<string>>;

  selectedDocument: SelectedDocument;
  setSelectedDocument: Dispatch<SetStateAction<SelectedDocument>>;

  visibleDocuments: VisibleDocument[];
  addVisibleDocument: (document: VisibleDocument) => void;

  extensions: Map;
  setExtensions: Dispatch<SetStateAction<Map>>;

  taskExtensions: Map;
  setTaskExtensions: Dispatch<SetStateAction<Map>>;

  users: Map;
  setUsers: Dispatch<SetStateAction<Map>>;

  imageList: any[];
  setImageList: Dispatch<SetStateAction<any[]>>;

  activeTab: any;
  setActiveTab: Dispatch<SetStateAction<number>>;

  viewpoints: string[];
  setViewpoints: Dispatch<SetStateAction<string[]>>;

  galleryScreen: number;
  setGalleryScreen: Dispatch<SetStateAction<number>>;

  activeGalleryTopic: any;
  setActiveGalleryTopic: Dispatch<SetStateAction<any>>;

  largeGalleryImg: string;
  setLargeGalleryImg: Dispatch<SetStateAction<string>>;

  viewerDocuments: { [document_id: string]: boolean };
  setViewerDocuments: Dispatch<
    SetStateAction<{ [document_id: string]: boolean }>
  >;
  //addViewer: (viewer: Viewer) => void;
};
