// @ts-ignore
import { ReactSession } from "react-client-session";
import Cookies from "js-cookie";
// @ts-ignore
import { NotificationManager } from "react-notifications";

const base_uri = "https://caia.herokuapp.com";
export const getAccessToken = () => Cookies.get("access_token");

type ViewPointType = {
  perspective_camera: any;
  originating_document?: any;
  components: any;
  guid: string;
  topic_guid: string;
  [key: string]: string;
};

class BCFAPIService {
  private readonly project_id: any;

  private readonly follow: RequestRedirect = "follow";
  private readonly headers: Headers;
  private readonly requestGetOptions: {
    redirect: "error" | "follow" | "manual";
    headers: Headers;
    method: string;
  };

  private readonly PUTHeaders: Headers;
  private readonly requestPutOptions: {
    redirect: RequestRedirect;
    headers: Headers;
    method: string;
    body?: BodyInit;
  };

  constructor() {
    this.headers = new Headers();
    this.headers.append("Authorization", "Bearer " + getAccessToken());
    this.requestGetOptions = {
      method: "GET",
      headers: this.headers,
      redirect: this.follow,
    };
    this.PUTHeaders = this.headers;
    this.PUTHeaders.append("Content-Type", "application/json");
    this.requestPutOptions = {
      method: "Put",
      headers: this.PUTHeaders,
      redirect: this.follow,
    };
    this.project_id = ReactSession.get("projectid");
  }

  async getAllViewPoints(): Promise<ViewPointType[]> {
    const response = await fetch(
      base_uri + "/bcf/3.0/projects/" + this.project_id + "/viewpoints",
      this.requestGetOptions
    );
    if (!response.ok) {
      const message = `getAllViewPoints: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getProjects() {
    const response = await fetch(
      base_uri + "/bcf/3.0/projects",
      this.requestGetOptions
    );
    if (!response.ok) {
      const message = `Get Projects: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getTopics() {
    const response = await fetch(
      base_uri + "/bcf/3.0/projects/" + this.project_id + "/topics",
      this.requestGetOptions
    );
    if (!response.ok) {
      const message = `getViewPoints: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getTopicViewPoints(topic_id: string) {
    const response = await fetch(
      base_uri +
        "/bcf/3.0/projects/" +
        this.project_id +
        "/topics/" +
        topic_id +
        "/viewpoints",
      this.requestGetOptions
    );
    if (!response.ok) {
      const message = `getViewPoints: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getTopicComments(topic_id: string) {
    const response = await fetch(
      base_uri +
        "/bcf/3.0/projects/" +
        this.project_id +
        "/topics/" +
        topic_id +
        "/comments/",
      this.requestGetOptions
    );
    if (!response.ok) {
      const message = `getProjects: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async putSpatialRepresentation(
    document_id: string,
    spatial_representation: any
  ) {
    let requestOptions = Object.assign({}, this.requestPutOptions);
    requestOptions.body = JSON.stringify(spatial_representation);
    const response = await fetch(
      base_uri +
        "/bcf/3.0/projects/" +
        this.project_id +
        "/documents/" +
        document_id +
        "/spatial_representation",
      requestOptions
    );
    if (!response.ok) {
      const message = `getProjects: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }
}

export default BCFAPIService;
