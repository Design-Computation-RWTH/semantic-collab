export interface MarkupFile {
  Markup: Markup;
}

export interface Markup {
  Header: Header;
  Topic: Topic;
  Comment: Comment[];
  Viewpoints: ViewPoint[];
}

export interface Project {
  Name?: string;
  ProjectId?: string;
}

export interface Version {
  DetailedVersion: string;
  VersionId: string;
}

export interface ViewPointFile {
  VisualizationInfo?: VisualizationInfo;
}

export interface VisualizationInfo {
  Components: Components;
  OrthogonalCamera?: OrthogonalCamera;
  PerspectiveCamera?: PerspectiveCamera;
  Lines?: Lines;
  ClippingPlanes?: ClippingPlanes;
  Bitmap?: Bitmap[];
  Guid?: string;
}

export interface Header {
  File: File[];
}

export interface Topic {
  ReferenceLink?: string[];
  Title: string;
  Priority?: string;
  Index?: number;
  Labels?: string[];
  CreationDate: string;
  CreationAuthor: string;
  ModifiedDate?: string;
  ModifiedAuthor?: string;
  DueDate?: string;
  AssignedTo?: string;
  Stage?: string;
  Description?: string;
  BimSnippet?: BimSnippet;
  documentReference: DocumentReference[];
  relatedTopic: RelatedTopic[];
  Guid: string;
  TopicType?: string;
  TopicStatus?: string;
}

export interface Comment {
  Date: string;
  Author: string;
  Comment: string;
  Viewpoint: Viewpoint;
  ModifiedDate?: string;
  ModifiedAuthor?: string;
  Guid?: string;
}

export interface ViewPoint {
  Viewpoint?: string;
  Snapshot?: string;
  Index?: number;
  Guid?: string;
}

export interface Components {
  Selection: ComponentSelection[];
  Visibility: ComponentVisibility;
  Coloring: ComponentColoring[];
}

export interface OrthogonalCamera {
  CameraViewPoint: Point;
  CameraDirection: Direction;
  CameraUpVector: Direction;
  ViewToWorldScale: number;
}

export interface PerspectiveCamera {
  CameraViewPoint: Point;
  CameraDirection: Direction;
  CameraUpVector: Direction;
  FieldOfView: number;
}

export interface Lines {
  Line: Line[];
}

export interface ClippingPlanes {
  clippingPlane: ClippingPlane[];
}

export interface Bitmap {
  Bitmap: BitmapFormat;
  Reference: string;
  Location: Point;
  Normal: Direction;
  up: Direction;
  Up: number;
}

export interface File {
  Filename?: string;
  Date?: XMLGregorianCalendar;
  Reference?: string;
  IfcProject?: string;
  IfcSpatialStructureElement?: string;
  isExternal?: boolean;
}

export interface XMLGregorianCalendar extends Cloneable {}

export interface BimSnippet {
  Reference: string;
  ReferenceSchema?: string;
  SnippetType: string;
  IsExternal?: boolean;
}

export interface DocumentReference {
  ReferencedDocument?: string;
  Description?: string;
  Guid?: string;
  IsExternal?: boolean;
}

export interface RelatedTopic {
  "RelatedTopic/GUID"?: string;
}

export interface Viewpoint {
  Guid: string;
}

export interface ViewSetupHints {
  SpacesVisible: boolean;
  SpaceBoundariesVisible: boolean;
  OpeningsVisible: boolean;
}

export interface ComponentSelection {
  Component: Component[];
}

export interface ComponentVisibility {
  Exceptions?: Exceptions;
  DefaultVisibility?: boolean;
  ViewSetupHints?: ViewSetupHints;
}

export interface ComponentColoring {
  Color: Color[];
}

export interface Point {
  X: number;
  Y: number;
  Z: number;
}

export interface Direction {
  X: number;
  Y: number;
  Z: number;
}

export interface Line {
  StartPoint: Point;
  EndPoint: Point;
}

export interface ClippingPlane {
  Location: Point;
  Direction: Direction;
}

export interface Cloneable {}

export interface Component {
  OriginatingSystem?: string;
  AuthoringToolId?: string;
  IfcGuid: string;
}

export interface Exceptions {
  Component: Component[];
}

export interface Color {
  Component: Component[];
  Color: string;
}

export type BitmapFormat = "PNG" | "JPG";
