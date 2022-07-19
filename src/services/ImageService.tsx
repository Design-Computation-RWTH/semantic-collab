// @ts-ignore
import { ReactSession } from "react-client-session";
import Cookies from "js-cookie";

//TODO: base_uri should be an env variable
let base_uri:any;
export const getAccessToken = () => Cookies.get("access_token");
export const getServerUrl = () => Cookies.get("url");

class ImageService {
  private readonly myHeaders: Headers;
  private readonly project_id: any;
  private readonly follow: RequestRedirect = "follow";
  private readonly requestOptions: {
    redirect: any;
    headers: Headers;
    method: string;
  };

  constructor() {
    base_uri = getServerUrl();
    this.myHeaders = new Headers();
    this.myHeaders.append("Authorization", "Bearer " + getAccessToken());
    this.requestOptions = {
      method: "GET",
      headers: this.myHeaders,
      redirect: this.follow,
    };
    this.project_id = ReactSession.get("projectid");
  }

  async getSnapShot(topic_id: string, viewpoint_id: string) {

    const response = await fetch(
      base_uri + "/bcf/3.0/projects/" +
        this.project_id +
        "/topics/" +
        topic_id +
        "/viewpoints/" +
        viewpoint_id +
        "/snapshot",
      this.requestOptions
    );
    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    return await response.blob();
  }

  async getThumbnailData(viewpoint_guid: string) {
    const response = await fetch(
      base_uri +
        "/files/" +
        this.project_id +
        "/" +
        viewpoint_guid +
        "_thumbnail.png",
      this.requestOptions
    );
    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    return await response.blob();
  }

  async getImageData4GUID(viewpoint_guid: string) {
    const response = await fetch(
      base_uri + "/files/" + this.project_id + "/" + viewpoint_guid + ".png",
      this.requestOptions
    );
    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    return await response.blob();
  }

  async getImageData4URL(image_url: RequestInfo) {
    const response = await fetch(image_url, this.requestOptions);
    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    return await response.blob();
  }

  async postFile(file: string, filename: string) {
    let file_url = base_uri + "/files/" + this.project_id + "/" + filename;

    let myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + getAccessToken());
    myHeaders.append("Content-Type", "application/octet-stream");
    myHeaders.append(
      "Content-Disposition",
      'attachment; filename="' + filename + '" '
    );

    let requestOptions = {
      method: "POST",
      headers: this.myHeaders,
      body: file,
      redirect: this.follow,
    };

    const response = await fetch(file_url, requestOptions);
    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    return response;
  }
}

export default ImageService;
