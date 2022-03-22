import { Viewer } from "@xeokit/xeokit-sdk";

// @types.dcwebviewer.ts

export interface VisibleDocument {
    id: string;
    uri: string;
}

export type DcWebViewerContextType = {
    viewer: Viewer;
    setViewer: Viewer;
    visibleDocuments: VisibleDocument[];
    addVisibleDocument: (document: VisibleDocument) => void;
    //addViewer: (viewer: Viewer) => void;

}