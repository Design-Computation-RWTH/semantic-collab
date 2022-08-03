// @ts-ignore
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import { NotificationManager } from "react-notifications";
import * as BcfOWL_Endpoint_types from "./types/BcfOWL_Endpoint_types";

export const getAccessToken = () => Cookies.get("access_token");
export const getServerUrl = () => Cookies.get("url");

let base_uri:any;

export const bcfOWLPrefixes =
  "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n\n";
export const geoPrefix =
  "PREFIX geo: <http://www.opengis.net/ont/geosparql#>\n\n";
export const xsdPrefix = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>";
export const ctoPrefix = "PREFIX cto: <https://w3id.org/cto#>";

class BcfOWL_Endpoint {
  private readonly myHeaders: Headers;
  private readonly project_id: any;
  private readonly follow: RequestRedirect = "follow";

  

  constructor() {
    base_uri = getServerUrl();
    this.myHeaders = new Headers();
    this.myHeaders.append("Authorization", "Bearer " + getAccessToken());
    //this.myHeaders.append("accept", "text/plain");
    this.myHeaders.append("Accept", "application/ld+json");
    this.myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    //this.project_id = ReactSession.get("projectid");
    this.project_id = Cookies.get("projectid");
  }

  parseJWT(token: string | undefined) {
    // @ts-ignore
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  async getViepointOriginatigDocument(viewpointGUID: string) {
    let viewpoint_uri =
      "<" + base_uri + "/graph/" + this.project_id + "/" + viewpointGUID + "/>";
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      bcfOWLPrefixes +
        "select ?fn ?durl ?location ?rotation ?scale\n" +
        "WHERE {\n" +
        "  " +
        viewpoint_uri +
        "  bcfOWL:hasOriginatingDocument ?og.\n" +
        "  ?d1  bcfOWL:hasGuid ?og.\n" +
        "  ?d1  bcfOWL:hasFilename ?fn. \n" +
        "  ?d1  bcfOWL:hasDocumentURL ?durl. \n" +
        "  ?d1  bcfOWL:hasSpatialRepresentation ?sp.\n" +
        "  ?sp  bcfOWL:hasLocation ?location. \n" +
        "  ?sp  bcfOWL:hasRotation ?rotation.\n" +
        "  ?sp  bcfOWL:hasScale ?scale. \n" +
        "}\n"
    );

    const response = await fetch(
      base_uri + "/sparql/" + this.project_id + "/query",
      {
        method: "POST",
        headers: this.myHeaders,
        body: urlencoded,
        redirect: this.follow,
      }
    );
    if (!response.ok) {
      const message = `getViepointOriginatigDocument: An error has occurred: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async describe(uri: string) {
    let urlencoded = new URLSearchParams();
    urlencoded.append("query", bcfOWLPrefixes + "DESCRIBE <" + uri + ">\n");

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
      const message = `describe: An error has occurred: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async describeNoProject(uri: string, projectID: string) {
    let urlencoded = new URLSearchParams();
    urlencoded.append("query", bcfOWLPrefixes + "DESCRIBE <" + uri + ">\n");

    const response = await fetch(base_uri + "/graph/" + projectID + "/query", {
      method: "POST",
      headers: this.myHeaders,
      body: urlencoded,
      redirect: this.follow,
    });
    if (!response.ok) {
      const message = `describe: An error has occurred: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async describeUser(uri: string) {
    let urlencoded = new URLSearchParams();
    urlencoded.append("query", bcfOWLPrefixes + "DESCRIBE <" + uri + ">\n");

    const response = await fetch(base_uri + "/graph/users/query", {
      method: "POST",
      headers: this.myHeaders,
      body: urlencoded,
      redirect: this.follow,
    });
    if (!response.ok) {
      const message = `describeUser: An error has occurred: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getUserByEmail(email: string) {
    var urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      "CONSTRUCT {?subject ?predicate ?object }\n" +
        "WHERE {\n" +
        "  ?subject <http://xmlns.com/foaf/0.1/mbox> <mailto:" +
        email +
        "> .\n" +
        "  ?subject ?predicate ?object .\n" +
        "}\n"
    );

    const response = await fetch(base_uri + "/graph/users/query", {
      method: "POST",
      headers: this.myHeaders,
      body: urlencoded,
      redirect: this.follow,
    });
    if (!response.ok) {
      const message = `getUserByEmail: An error has occurred: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getAll() {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      "CONSTRUCT {?s ?p ?o}\n" +
        "WHERE \n" +
        "{  ?s ?p ?o .\n" +
        "  FILTER(!IsLiteral(?o)) .\n" +
        "} \n"
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getMINTopicDate() {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      "PREFIX value:    <http://www.value.de>\n" +
        "PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>\n" +
        "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "CONSTRUCT {\n" +
        "  _:value value:year ?year.\n" +
        "  _:value value:month ?month.\n" +
        "  _:value value:day ?day.\n" +
        "  \n" +
        "}\n" +
        "WHERE\n" +
        "{\n" +
        "SELECT  (YEAR(?mindate) as ?year) (MONTH(?mindate) as ?month)(DAY(?mindate) as ?day) \n" +
        "{\n" +
        "SELECT (MIN(?creationDate) as ?mindate)\n" +
        "WHERE {\n" +
        "  ?topic a bcfOWL:Topic.\n" +
        "  ?topic bcfOWL:hasCreationDate ?creationDate . \n" +
        "  BIND (YEAR(?creationDate) AS ?year)\n" +
        "  FILTER (?year > 2000)\n" +
        "}\n" +
        "}\n" +
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getMAXTopicDate() {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      "PREFIX value:    <http://www.value.de>\n" +
        "PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>\n" +
        "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n" +
        "CONSTRUCT {\n" +
        "  _:value value:year ?year.\n" +
        "  _:value value:month ?month.\n" +
        "  _:value value:day ?day.\n" +
        "  \n" +
        "}\n" +
        "WHERE\n" +
        "{\n" +
        "SELECT  (YEAR(?mindate) as ?year) (MONTH(?mindate) as ?month)(DAY(?mindate) as ?day) \n" +
        "{\n" +
        "SELECT (MAX(?creationDate) as ?mindate)\n" +
        "WHERE {\n" +
        "  ?topic a bcfOWL:Topic.\n" +
        "  ?topic bcfOWL:hasCreationDate ?creationDate . \n" +
        "  BIND (YEAR(?creationDate) AS ?year)\n" +
        "  FILTER (?year > 2000)\n" +
        "}\n" +
        "}\n" +
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getTopicByGUID(guid: string) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      "CONSTRUCT {?subject ?predicate ?object}\n" +
        "WHERE {\n" +
        '  ?subject <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid> "' +
        guid +
        '" .\n' +
        "  ?subject ?predicate ?object .\n" +
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getDocuments() {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      "CONSTRUCT {?s ?p ?o}\n" +
        "WHERE {\n" +
        "  ?s a <http://lbd.arch.rwth-aachen.de/bcfOWL#Document> .\n" +
        "  ?s ?p ?o .\n" +
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getTasks() {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      `
      CONSTRUCT {
        ?ts ?tp ?to.
        ?vs ?vp ?vo.
        ?ps ?pp ?po
      }
      WHERE {
        {?ts a <https://w3id.org/cto#Task> ;
            ?tp ?to .
      
        ?vs a <http://lbd.arch.rwth-aachen.de/bcfOWL#Viewpoint>;
           <http://lbd.arch.rwth-aachen.de/bcfOWL#hasTopic> ?ts;
           <http://lbd.arch.rwth-aachen.de/bcfOWL#hasPerspectiveCamera> ?ps;
           ?vp ?vo .
        
        ?ps a <http://lbd.arch.rwth-aachen.de/bcfOWL#PerspectiveCamera>;
            ?pp ?po .
      } UNION { ?ts a <https://w3id.org/cto#Task> ;
            ?tp ?to . }}
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async updateTopic(topicUri: string, predicate: string, object: string) {
    if (!this.project_id) alert("Project not selected. ");

    let timestamp = new Date(Date.now()).toISOString();
    let author = this.parseJWT(getAccessToken()).URI;
    let urlencoded = new URLSearchParams();

    let query = `
      PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
      DELETE {
          <${topicUri}> bcfOWL:hasModifiedAuthor ?o .
          <${topicUri}>  bcfOWL:hasModifiedDate ?o .
          <${topicUri}>  ${predicate} ?o
      }
      INSERT {
          <${topicUri}>  bcfOWL:hasModifiedAuthor <${author}>;
              bcfOWL:hasModifiedDate "${timestamp}"^^xsd:datetime;
              ${predicate} ${object}
      }
      WHERE {
          <${topicUri}> ?p ?o.
      }
    
    `;
    urlencoded.append("update", query);

    const response = await fetch(
      base_uri + "/graph/" + this.project_id + "/update",
      {
        method: "POST",
        headers: this.myHeaders,
        body: urlencoded,
        redirect: this.follow,
      }
    );

    if (!response.ok) {
      const message = `Get Filtered Viewpoints: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async deleteDocument(documentURI: string) {

    let urlencoded = new URLSearchParams();

    let query = `
      PREFIX bcfOWL: <http://lbd.arch.rwth-aachen.de/bcfOWL#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
      DELETE 
      WHERE {
          <${documentURI}> ?p ?o.
      }
    
    `;
    urlencoded.append("update", query);

    const response = await fetch(
      base_uri + "/graph/" + this.project_id + "/update",
      {
        method: "POST",
        headers: this.myHeaders,
        body: urlencoded,
        redirect: this.follow,
      }
    );

    if (!response.ok) {
      const message = `Get Filtered Viewpoints: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getViepointCameras4Document(doc_uri: string) {
    var guid = doc_uri.substring(doc_uri.lastIndexOf("/") + 1);
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();

    let query = bcfOWLPrefixes + ctoPrefix + `
      CONSTRUCT {?viewpoint ?p ?o}
      WHERE {
        { ?viewpoint bcfOWL:hasOriginatingDocument <${doc_uri}> . }
        UNION {?viewpoint bcfOWL:hasOriginatingDocument '${guid}' . }
        {
        ?viewpoint a bcfOWL:Viewpoint.
          ?viewpoint bcfOWL:hasPerspectiveCamera ?c.
          ?viewpoint bcfOWL:hasTopic ?topic.
          ?c ?p ?o.
        
        FILTER NOT EXISTS { ?topic a cto:Task .}
      
      }}
    `

    urlencoded.append(
      "query",
      query
    )

    console.log(query)

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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getViewpoint4TaskMainTopic(topicID: string) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();

    let query = bcfOWLPrefixes + ctoPrefix + `
      CONSTRUCT {?viewpoint ?p ?o}
      WHERE {

        ?subtopic a bcfOWL:Topic;
        cto:hasTaskContext <${topicID}>.

        ?viewpoint a bcfOWL:Viewpoint.
        ?viewpoint ?p ?o.
        ?viewpoint bcfOWL:hasTopic ?subtopic.
      }
    `

    urlencoded.append(
      "query",
      query
    )

    console.log(query)

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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getTaskViepointCameras4Document(doc_uri: string) {
    var guid = doc_uri.substring(doc_uri.lastIndexOf("/") + 1);
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();

    let query = bcfOWLPrefixes + ctoPrefix + `
      CONSTRUCT {?viewpoint ?p ?o}
      WHERE {
        { ?viewpoint bcfOWL:hasOriginatingDocument <${doc_uri}> . }
        UNION {?viewpoint bcfOWL:hasOriginatingDocument '${guid}' . }
        {
        ?viewpoint a bcfOWL:Viewpoint.
          ?viewpoint bcfOWL:hasPerspectiveCamera ?c.
          ?viewpoint bcfOWL:hasTopic ?topic.
          ?c ?p ?o.
        
        ?topic a cto:Task .
      
      }}
    `

    urlencoded.append(
      "query",
      query
    )

    console.log(query)

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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getFilteredViewpointsGraph(viewpoints: string[]) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();

    let filter1: string = "filter(";
    let filter2: string = "filter(";

    viewpoints.forEach((viewpoint) => {
      filter1 = filter1 + " ?s = <" + viewpoint + "> ||";
      filter2 = filter2 + " ?vs = <" + viewpoint + "> ||";
    });

    filter1 = filter1.slice(0, -2) + ")";
    filter2 = filter2.slice(0, -2) + ")";

    let query = `
        PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        CONSTRUCT {?s ?p ?o}
        
        WHERE {
          {
            ?s a bcfOWL:Project;
               ?p ?o.
          } UNION
          
            {
            ?s a bcfOWL:TopicType;
               ?p ?o.
          } UNION
          
              {
            ?s a bcfOWL:TopicStatus;
               ?p ?o.
          } UNION
          
                {
            ?s a bcfOWL:Priority;
               ?p ?o.
          } UNION
                {
            ?s a bcfOWL:Stage;
               ?p ?o.
          } UNION
                {
            ?s a bcfOWL:DueDate;
               ?p ?o.
          } UNION
        
                {
            ?s a bcfOWL:AssignedTo;
               ?p ?o.
          } UNION
                {
            ?s a bcfOWL:User;
               ?p ?o.
          } UNION
              {
            ?s a bcfOWL:Labels;
               ?p ?o.
          } UNION
        
          {
          ?s a bcfOWL:Viewpoint;
             ?p ?o .
            
            ${filter1}
         } UNION {
          ?vs a bcfOWL:Viewpoint;
              bcfOWL:hasTopic ?s .
            
            ?s a bcfOWL:Topic ;
               ?p ?o .
            ${filter2}
          } UNION {
            ?vs a bcfOWL:Viewpoint;
              bcfOWL:hasPerspectiveCamera ?s .
            
            ?s a bcfOWL:PerspectiveCamera ;
               ?p ?o .
            ${filter2}
          }
        }
        `;

    urlencoded.append("query", query);

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
      const message = `Get Filtered Viewpoints: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getFilteredViewpoints(filter: string[]) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();

    let query =
      bcfOWLPrefixes +
      `
        CONSTRUCT {?s ?p ?o}
        
        WHERE {
          ?ts a bcfOWL:Topic ;
            bcfOWL:hasCreationDate ?date ;
            ${filter.join(" ")}
            .
          ?s a bcfOWL:Viewpoint ;
            bcfOWL:hasTopic ?ts ;
            bcfOWL:hasSnapshot ?snap ;
            ?p ?o .
        }
        ORDER BY ?s DESC(?date)
        `;

    urlencoded.append("query", query);

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
      const message = `Get Filtered Viewpoints: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async postComment(comment: string, viewpoint: string, topic: string) {
    let projectUri = base_uri + "/graph/" + this.project_id;
    let guid = uuidv4();
    let author = base_uri + "/users/" + this.parseJWT(getAccessToken()).URI;
    let uri = projectUri + "/" + guid;
    let creationDate = new Date().toISOString();

    let query =
      bcfOWLPrefixes +
      geoPrefix +
      xsdPrefix +
      ctoPrefix +
      `\nPREFIX project: <${projectUri}/>` +
      `
        INSERT DATA {
        <${uri}>    a                           bcfOWL:Comment ;
                      bcfOWL:hasAuthor          <${author}> ;
                      bcfOWL:hasComment         "${comment}"^^xsd:string ;
                      bcfOWL:hasCommentDate     "${creationDate}"^^xsd:dateTime ;
                      bcfOWL:hasGuid            "${guid}"^^xsd:string ;
                      bcfOWL:hasProject         project: ;
                      bcfOWL:hasTopic           <${topic}> ;
                      bcfOWL:hasViewpoint       <${viewpoint}> ;
                      bcfOWL:hasContext         project:DocumentationContext .
        }
        `;

    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append("update", query);

    const response = await fetch(projectUri + "/update", {
      method: "POST",
      headers: this.myHeaders,
      body: urlencoded,
      redirect: this.follow,
    });
    if (!response.ok) {
      const message = `SPARQL Update failed: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    } else {
      console.log(response);
    }
    return await response.json();
  }

  async getCommentsByViewpoint(vp_uri: string) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      bcfOWLPrefixes +
        `
        CONSTRUCT { ?s ?p ?o }
        WHERE {
            ?s  a                       bcfOWL:Comment ;
                bcfOWL:hasViewpoint     <${vp_uri}> ;
                ?p                      ?o .
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getCommentsByTopic(topic_uri: string) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      bcfOWLPrefixes +
        `
        CONSTRUCT { ?s ?p ?o }
        WHERE {
            ?s  a                       bcfOWL:Comment ;
                bcfOWL:hasTopic     <${topic_uri}> ;
                ?p                      ?o .
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async getTopicGuids4Document(doc_uri: string) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      bcfOWLPrefixes +
        "CONSTRUCT {?topic <http://lbd.arch.rwth-aachen.de/bcfOWL#hasGuid>  ?topic_guid }\n" +
        "WHERE {\n" +
        "  ?viewpoint ?p <" +
        doc_uri +
        "> .\n" +
        "  ?viewpoint bcfOWL:hasTopic ?topic .\n" +
        "  ?topic bcfOWL:hasGuid ?topic_guid .\n" +
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
      const message = `getAll: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async updateSpatialRepresentation(
    doc_uri: string,
    spatrep_uri: string,
    spatial_representation: BcfOWL_Endpoint_types.SpatialRepresentation
  ) {
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "update",
      bcfOWLPrefixes +
        geoPrefix +
        xsdPrefix +
        `
            DELETE {
              <${spatrep_uri}> ?p ?o
            }
            INSERT {
              <${doc_uri}> a bcfOWL:Document ;
                bcfOWL:hasSpatialRepresentation <${spatrep_uri}> .
        
              <${spatrep_uri}> a bcfOWL:SpatialRepresentation ;
                bcfOWL:hasLocation  "POINT Z(${spatial_representation.location.x} ${spatial_representation.location.y} ${spatial_representation.location.z})"^^geo:wktLiteral ;
                bcfOWL:hasRotation  "POINT Z(${spatial_representation.rotation.x} ${spatial_representation.rotation.y} ${spatial_representation.rotation.z})"^^geo:wktLiteral ;
                bcfOWL:hasScale     "POINT Z(${spatial_representation.scale.x} ${spatial_representation.scale.y} ${spatial_representation.scale.z})"^^geo:wktLiteral ;
                bcfOWL:hasAlignment "center"^^xsd:string ;
                bcfOWL:hasDocument  <${doc_uri}>;
        
            } WHERE {
              ?s ?p ?o
            }
          `
    );

    const response = await fetch(
      base_uri + "/graph/" + this.project_id + "/update",
      {
        method: "POST",
        headers: this.myHeaders,
        body: urlencoded,
        redirect: this.follow,
      }
    );
    if (!response.ok) {
      const message = `Update Spatial: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async createDocumentWithSpatialRepresentation(
    file_name: string,
    spatial_representation: BcfOWL_Endpoint_types.SpatialRepresentation
  ) {
    let project_uri = base_uri + "/graph/" + this.project_id;
    let doc_guid = uuidv4();
    let doc_uri = project_uri + "/" + doc_guid;
    let spatrep_uri = project_uri + "/" + uuidv4();

    let file_url = base_uri + "/files/" + this.project_id + "/" + file_name;

    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "update",
      bcfOWLPrefixes +
        geoPrefix +
        xsdPrefix +
        `
            INSERT {
              <${doc_uri}> a bcfOWL:Document ;
                bcfOWL:hasDocumentURL "${file_url}"^^xsd:anyURI;
                bcfOWL:hasFilename "${file_name}"^^xsd:string;
                bcfOWL:hasGuid "${doc_guid}"^^xsd:string;
                bcfOWL:hasProject <${project_uri}>;
                bcfOWL:hasSpatialRepresentation <${spatrep_uri}> .
        
              <${spatrep_uri}> a bcfOWL:SpatialRepresentation ;
                bcfOWL:hasLocation  "POINT Z(${spatial_representation.location.x} ${spatial_representation.location.y} ${spatial_representation.location.z})"^^geo:wktLiteral ;
                bcfOWL:hasRotation  "POINT Z(${spatial_representation.rotation.x} ${spatial_representation.rotation.y} ${spatial_representation.rotation.z})"^^geo:wktLiteral ;
                bcfOWL:hasScale     "POINT Z(${spatial_representation.scale.x} ${spatial_representation.scale.y} ${spatial_representation.scale.z})"^^geo:wktLiteral ;
                bcfOWL:hasAlignment "center"^^xsd:string ;
                bcfOWL:hasDocument  <${doc_uri}>;
        
            } WHERE {
              ?s ?p ?o
            }
          `
    );

    const response = await fetch(
      base_uri + "/graph/" + this.project_id + "/update",
      {
        method: "POST",
        headers: this.myHeaders,
        body: urlencoded,
        redirect: this.follow,
      }
    );
    if (!response.ok) {
      const message = `Create Document with Spatial Representation: An error has occured: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    }
    return await response.json();
  }

  async postRDF(data: any) {
    let project_uri = base_uri + "/graph/" + this.project_id;
    let query =
      bcfOWLPrefixes +
      geoPrefix +
      xsdPrefix +
      ctoPrefix +
      `\nPREFIX project: <${project_uri}>` +
      `
            INSERT DATA {${data}}
            `;

    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append("update", query);

    const response = await fetch(project_uri + "/update", {
      method: "POST",
      headers: this.myHeaders,
      body: urlencoded,
      redirect: this.follow,
    });
    if (!response.ok) {
      const message = `SPARQL Update failed: ${response.status}`;
      NotificationManager.warning(message, "Error", 3000);
      throw new Error(message);
    } else {
      console.log(response);
    }
    return await response.json();
  }
}

export default BcfOWL_Endpoint;
