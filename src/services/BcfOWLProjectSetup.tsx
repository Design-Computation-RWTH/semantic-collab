import Cookies from "js-cookie";
// @ts-ignore
import { NotificationManager } from "react-notifications";

let base_uri: any;

export const getAccessToken = () => Cookies.get("access_token");
export const getServerUrl = () => Cookies.get("url");
export const bcfOWLPrefixes =
  "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n";
class BcfOWLProjectSetup {
  private readonly myHeaders: Headers;
  private readonly project_id: any;
  private readonly follow: RequestRedirect = "follow";

  constructor() {
    base_uri = getServerUrl();
    this.myHeaders = new Headers();
    this.myHeaders.append("Authorization", "Bearer " + getAccessToken());
    this.myHeaders.append("Accept", "application/ld+json");
    this.myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    //this.project_id = ReactSession.get("projectid");
    this.project_id = Cookies.get("projectid");
  }

  async getCurrentProject() {
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      bcfOWLPrefixes +
        "DESCRIBE *\n" +
        "WHERE {\n" +
        "?s a bcfOWL:Project .\n" +
        "}"
    );

    const response = await fetch(
      base_uri + "/graph/" + this.project_id + "/query",
      {
        method: "POST",
        headers: this.myHeaders,
        body: urlencoded,
        redirect: this.follow,
      }
    );
    if (!response.ok) {
      const message = `getCurrentProject: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getCurrentProjectExtensions() {
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      `
      PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              
      construct {?s ?p ?o}
      
      where {{
        ?s a bcfOWL:Priority;
           ?p ?o.
        } UNION {
          ?s a bcfOWL:TopicStatus;
                    ?p ?o .
        } UNION {
          ?s a bcfOWL:TopicType;
                    ?p ?o .
        } UNION {
          ?s a bcfOWL:TopicStage;
                    ?p ?o .
        } UNION {
          ?s a bcfOWL:Label;
                    ?p ?o .
        }
      }
      `
    );

    const response = await fetch(
      base_uri + "/graph/" + this.project_id + "/query",
      {
        method: "POST",
        headers: this.myHeaders,
        body: urlencoded,
        redirect: this.follow,
      }
    );
    if (!response.ok) {
      const message = `getCurrentProjectExtensions: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error syncing Projects", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async setCurrentProjectName(name: string) {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + getAccessToken());
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "update",
      "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "\n" +
        "DELETE { ?project bcfOWL:hasName ?name}\n" +
        'INSERT { ?project bcfOWL:hasName "' +
        name +
        '"}\n' +
        "WHERE {\n" +
        " ?project a bcfOWL:Project;\n" +
        " bcfOWL:hasName ?name .\n" +
        "}"
    );

    fetch(base_uri + "/graph/" + this.project_id + "/update", {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: this.follow,
    })
      .then((response) => response)
      .then((result) => {
        if (result.ok) {
        } else {
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  async insertPropertyValue(
    bcfProperty: string,
    bcfSubject: string,
    value: string,
    description: string
  ) {
    if (!this.project_id) alert("Project not selected. ");
    let project_uri = "<" + base_uri + "/graph/" + this.project_id + "/>";
    let context =
      "<" + base_uri + "/graph/" + this.project_id + "/DocumentationContext>";
    let value_uri =
      "<" +
      base_uri +
      "/graph/" +
      this.project_id +
      "/" +
      bcfSubject +
      "_" +
      value +
      ">";

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + getAccessToken());
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    /*    urlencoded.append(
      "update",
      "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "\n" +
        "INSERT { ?project bcfOWL:" +
        bcfProperty +
        " " +
        value_uri +
        "}\n" +
        "WHERE {\n" +
        " ?project a bcfOWL:Project .\n" +
        "}"
    );*/

    let data = `
        PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        INSERT DATA {  
        ${project_uri} bcfOWL:${bcfProperty} ${value_uri} .
        
        ${value_uri}  a bcfOWL:${bcfSubject};
            <http://www.w3.org/2000/01/rdf-schema#comment> "${description}" ;
            <http://www.w3.org/2000/01/rdf-schema#label>   "${value}" ;
            bcfOWL:hasContext       ${context} .

        }`;
    urlencoded.append("update", data);

    fetch(base_uri + "/graph/" + this.project_id + "/update", {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: this.follow,
    })
      .then((response) => response)
      .then((result) => {
        if (result.ok) {
        } else {
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  async removePropertyValue(bcfProperty: string, value: string) {
    if (!this.project_id) alert("Project not selected. ");
    let value_uri =
      "<" + base_uri + "/graph/" + this.project_id + "/" + value + ">";

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + getAccessToken());
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "update",
      "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "\n" +
        "DELETE { ?project bcfOWL:" +
        bcfProperty +
        " " +
        value_uri +
        "}\n" +
        "WHERE {\n" +
        " ?project a bcfOWL:Project .\n" +
        "}"
    );

    fetch(base_uri + "/graph/" + this.project_id + "/update", {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: this.follow,
    })
      .then((response) => response)
      .then((result) => {
        console.log(result);
        if (result.ok) {
        } else {
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  async insertUser(value: string) {
    if (!this.project_id) alert("Project not selected. ");
    let value_uri = "<" + value + ">";

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + getAccessToken());
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "update",
      "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "\n" +
        "INSERT { ?project bcfOWL:hasUser " +
        value_uri +
        "}\n" +
        "WHERE {\n" +
        " ?project a bcfOWL:Project .\n" +
        "}"
    );

    fetch(base_uri + "/graph/" + this.project_id + "/update", {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: this.follow,
    })
      .then((response) => response)
      .then((result) => {
        if (result.ok) {
        } else {
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  async deletetUser(value: string) {
    if (!this.project_id) alert("Project not selected. ");
    let value_uri = "<" + base_uri + "/users/" + value + ">";

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + getAccessToken());
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "update",
      "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "\n" +
        "DELETE { ?project bcfOWL:hasUser " +
        value_uri +
        "}\n" +
        "WHERE {\n" +
        " ?project a bcfOWL:Project .\n" +
        "}"
    );

    fetch(base_uri + "/graph/" + this.project_id + "/update", {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: this.follow,
    })
      .then((response) => response)
      .then((result) => {
        if (result.ok) {
        } else {
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  async deletetUserOutside(value: string, projectID: string) {
    let value_uri = "<" + base_uri + "/users/" + value + ">";

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + getAccessToken());
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "update",
      "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "\n" +
        "DELETE { ?project bcfOWL:hasUser " +
        value_uri +
        "}\n" +
        "WHERE {\n" +
        " ?project a bcfOWL:Project .\n" +
        "}"
    );

    fetch(base_uri + "/graph/" + projectID + "/update", {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: this.follow,
    })
      .then((response) => response)
      .then((result) => {
        if (result.ok) {
        } else {

        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  async addProject(
    project_name: string | null,
    project_description: string | null
  ) {
    if (project_name == null) return;
    let myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + getAccessToken());
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      name: project_name,
      description: project_description,
    });

    fetch(base_uri+"/bcf/sparql/projects", {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: this.follow,
    })
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }
}
export default BcfOWLProjectSetup;
