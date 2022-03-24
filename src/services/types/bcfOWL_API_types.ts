export type ViewPointType = {
  perspective_camera: any;
  originating_document?: any;
  components: any;
  guid: string;
  topic_guid: string;
  [key: string]: string;
};

export type ProjectType = {
  project_id: string;
  name: string;
  [key: string]: string;
};
