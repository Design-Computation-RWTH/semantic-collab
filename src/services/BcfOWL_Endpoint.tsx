// @ts-ignore
import { ReactSession } from "react-client-session";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import { NotificationManager } from "react-notifications";
import * as BcfOWL_Endpoint_types from "./types/BcfOWL_Endpoint_types";

const base_uri = "https://caia.herokuapp.com";

export const getAccessToken = () => Cookies.get("access_token");
export const bcfOWLPrefixes =
  "PREFIX bcfOWL:<http://lbd.arch.rwth-aachen.de/bcfOWL#>\n\n";
export const geoPrefix =
  "PREFIX geo: <http://www.opengis.net/ont/geosparql#>\n\n";
export const xsdPrefix = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>";

class BcfOWL_Endpoint {
  private readonly myHeaders: Headers;
  private readonly project_id: any;
  private readonly follow: RequestRedirect = "follow";

  constructor() {
    this.myHeaders = new Headers();
    this.myHeaders.append("Authorization", "Bearer " + getAccessToken());
    this.myHeaders.append("Accept", "application/ld+json");
    this.myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    this.project_id = ReactSession.get("projectid");
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

  async describeUser(uri: string) {
    console.log("desc: " + uri);
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

  async getViepointCameras4Document(doc_uri: string) {
    var guid = doc_uri.substring(doc_uri.lastIndexOf("/") + 1);
    if (!this.project_id) alert("Project not selected. ");
    let urlencoded = new URLSearchParams();
    urlencoded.append(
      "query",
      bcfOWLPrefixes +
        "CONSTRUCT {?viewpoint ?p ?o}\n" +
        "WHERE {\n" +
        "  { ?viewpoint bcfOWL:hasOriginatingDocument <" +
        doc_uri +
        "> . }\n" +
        "  UNION {?viewpoint bcfOWL:hasOriginatingDocument '" +
        guid +
        "' . }\n" +
        "   ?viewpoint a bcfOWL:Viewpoint. \n" +
        "   ?viewpoint bcfOWL:hasPerspectiveCamera ?c .\n" +
        "   ?c ?p ?o .\n" +
        "  \n" +
        "}\n"
    );

    console.log(
      bcfOWLPrefixes +
        "CONSTRUCT {?viewpoint ?p ?o}\n" +
        "WHERE {\n" +
        "  { ?viewpoint bcfOWL:hasOriginatingDocument <" +
        doc_uri +
        "> . }\n" +
        "  UNION {?viewpoint bcfOWL:hasOriginatingDocument '" +
        guid +
        "' . }\n" +
        "   ?viewpoint a bcfOWL:Viewpoint. \n" +
        "   ?viewpoint bcfOWL:hasPerspectiveCamera ?c .\n" +
        "   ?c ?p ?o .\n" +
        "  \n" +
        "}\n"
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
}

export default BcfOWL_Endpoint;