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

  imageList: any[];
  setImageList: Dispatch<SetStateAction<any[]>>;

  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>;

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
