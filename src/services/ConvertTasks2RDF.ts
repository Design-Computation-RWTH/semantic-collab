// @ts-ignore
import * as ConvertTasks2RDF_types from "./types/ConvertTasks2RDF_types";
import { getAccessToken } from "./BcfOWL_Endpoint";
import Cookies from "js-cookie";

const N3 = require("n3");
const { DataFactory } = N3;
const { namedNode, literal } = DataFactory;
const getServerUrl = () => Cookies.get("url");

export async function ConvertTasks(data: any, projectURI: string) {
  let inst_uri = projectURI;
  let bcdOWL_uri = "http://lbd.arch.rwth-aachen.de/bcfOWL#";

  const writer = new N3.Writer({
    /*    prefixes: {
      cto: "https://w3id.org/cto#",
      bcfowl: bcdOWL_uri,
      project: inst_uri,
    },*/
  });
  let interventions_map = new Map<number, string>(); // number -> uri
  let interventions_posts_map = new Map<number, string>(); // number -> uri
  let interventions_taskmethods_map = new Map<string, string>(); // number -> uri
  let taskmethods: number = 1;

  let priorities = new Map<number, string>(); // id -> priority_uri
  let types = new Map<number, string>(); // id -> type_uri

  function parseJWT(token: string | undefined) {
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

  let author_uri = getServerUrl() + "/users/" + parseJWT(getAccessToken()).URI;
  console.log(author_uri);

  writer.addQuad(
    namedNode(inst_uri + "TaskRMContext"),
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode(bcdOWL_uri + "Context")
  );
  writer.addQuad(
    namedNode(inst_uri + "TaskRMContext"),
    namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
    literal("Renovation Manager Tasks")
  );
  writer.addQuad(
    namedNode(inst_uri + "TaskRMContext"),
    namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
    literal("Tasks created by the Renovation Manager workflow")
  );

  writer.addQuad(
    namedNode(inst_uri),
    namedNode(bcdOWL_uri + "hasContext"),
    namedNode(inst_uri + "TaskRMContext")
  );

  data.interventions.forEach((i: ConvertTasks2RDF_types.Intervention) => {
    let intervention_uri =
      inst_uri +
      "Intervention_" +
      i.name.replace(/ /g, "_").replace(/c/g, "c") +
      "_" +
      i.id;
    interventions_map.set(i.id, intervention_uri);

    if (i.checks) {
      i.checks.forEach((check: string) => {
        if (!interventions_taskmethods_map.has(check)) {
          let task_method_uri = inst_uri + "TaskMethod_" + taskmethods;
          interventions_taskmethods_map.set(check, task_method_uri);
          taskmethods = taskmethods + 1;
          writer.addQuad(
            namedNode(intervention_uri),
            namedNode("https://w3id.org/cto#hasTaskMethod"),
            namedNode(task_method_uri)
          );
          writer.addQuad(
            namedNode(task_method_uri),
            namedNode("https://w3id.org/cto#hasSimpleTaskMethodDescription"),
            literal("Check: " + check)
          );
          writer.addQuad(
            namedNode(task_method_uri),
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            namedNode("https://w3id.org/cto#TaskMethod")
          );
        }
      });
    }
  });

  data.intervention_posts.forEach(
    (i: ConvertTasks2RDF_types.InterventionPost) => {
      let interventionpost_uri =
        inst_uri +
        "InterventionPost_" +
        i.name.replace(/ /g, "_").replace(/c/g, "c") +
        "_" +
        i.id;
      types.set(i.id, interventionpost_uri);
      interventions_posts_map.set(i.id, interventionpost_uri);
      writer.addQuad(
        namedNode(interventionpost_uri),
        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        namedNode(bcdOWL_uri + "TopicType")
      );
      writer.addQuad(
        namedNode(interventionpost_uri),
        namedNode("http://purl.org/dc/terms/identifier"),
        literal(i.id)
      );
      writer.addQuad(
        namedNode(interventionpost_uri),
        namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
        literal(i.name)
      );
      writer.addQuad(
        namedNode(interventionpost_uri),
        namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
        literal(i.description)
      );
      writer.addQuad(
        namedNode(interventionpost_uri),
        namedNode(bcdOWL_uri + "hasContext"),
        namedNode(inst_uri + "TaskRMContext")
      );

      writer.addQuad(
        namedNode(inst_uri),
        namedNode(bcdOWL_uri + "hasTopicType"),
        namedNode(interventionpost_uri)
      );
      // writer.addQuad(
      //   namedNode(interventionpost_uri),
      //   namedNode(bcdOWL_uri + "hasGuid"),
      //   namedNode(interventionpost_uri)
      // );
    }
  );

  data.intervention_priorities.forEach(
    (i: ConvertTasks2RDF_types.InterventionPost) => {
      let interventionpriority_uri =
        inst_uri +
        "InterventionPriority_" +
        i.name.replace(/ /g, "_").replace(/c/g, "c") +
        "_" +
        i.id;
      priorities.set(i.id, interventionpriority_uri);
      interventions_posts_map.set(i.id, interventionpriority_uri);
      writer.addQuad(
        namedNode(interventionpriority_uri),
        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        namedNode(bcdOWL_uri + "Priority")
      );
      writer.addQuad(
        namedNode(interventionpriority_uri),
        namedNode(bcdOWL_uri + "hasContext"),
        namedNode(inst_uri + "TaskRMContext")
      );
      writer.addQuad(
        namedNode(interventionpriority_uri),
        namedNode("http://purl.org/dc/terms/identifier"),
        literal(i.id)
      );
      writer.addQuad(
        namedNode(interventionpriority_uri),
        namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
        literal(i.name)
      );
      writer.addQuad(
        namedNode(interventionpriority_uri),
        namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
        literal(i.description)
      );

      writer.addQuad(
        namedNode(inst_uri),
        namedNode(bcdOWL_uri + "hasPriority"),
        namedNode(interventionpriority_uri)
      );
    }
  );
  data.interventions.forEach((i: ConvertTasks2RDF_types.Intervention) => {
    let intervention_uri = interventions_map.get(i.id); // just not to recreate it
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      namedNode(bcdOWL_uri + "Topic")
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      namedNode("https://w3id.org/cto#Task")
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasContext"),
      namedNode(inst_uri + "TaskRMContext")
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasTitle"),
      literal(i.name)
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasCreationAuthor"),
      namedNode(author_uri)
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasModifiedAuthor"),
      namedNode(author_uri)
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasDescription"),
      literal(i.description)
    );
    let lit_CreationDate = literal(
      new Date(i.start_date).toISOString(), // Not a good fit
      namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasCreationDate"),
      lit_CreationDate
    );
    let lit_DueDate = literal(
      new Date(i.end_date).toISOString(),
      namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasDueDate"),
      lit_DueDate
    );

    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasPriority"),
      namedNode(priorities.get(i.intervention_priority_id))
    );

    // let intervention_TopicType =
    //   i.intervention_post_name.replace(/ /g, "_").replace(/c/g, "c") +
    //   i.intervention_post_id;
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasTopicType"),
      namedNode(types.get(i.intervention_post_id))
    );

    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasTopicStatus"),
      namedNode(inst_uri + "TopicStatus_Open")
    );

    if (i.required_previous) {
      i.required_previous.forEach((referred_id: number) => {
        let referred_intervention_uri = interventions_map.get(referred_id);
        writer.addQuad(
          namedNode(intervention_uri),
          namedNode("https://w3id.org/cto#afterFinishedTask"),
          namedNode(referred_intervention_uri)
        );
      });
    }

    if (i.parent_intervention) {
      let referred_intervention_uri = interventions_map.get(
        i.parent_intervention
      );
      writer.addQuad(
        namedNode(intervention_uri),
        namedNode("https://w3id.org/cto#hasTaskContext"),
        namedNode(referred_intervention_uri)
      );
    }

    if (i.assigned_to) {
      writer.addQuad(
        namedNode(intervention_uri),
        namedNode(bcdOWL_uri + "hasAssignedTo"),
        namedNode(i.assigned_to)
      );
    }

    //TODO: Check if Viewpoint needs to be created at all. e.g. no need for parent task!
    if (i.location && i.up_vector && i.forward_vector && i.document_uri) {
      // Generate ID for the viewpoint. Take the element ID of the Task, so that Tasks that reside at the same location
      // share the same Viewpoint and Perspective Camera.
      let elementId: any = i.id.toString();
      //elementId = elementId.split("_")[-1];
      let viewpoint_guid = elementId.split("_")[0]; // uuid.v4();
      // Create viewpoint and perspective camera URI from the GUID
      let viewpoint_uri = inst_uri + "viewpoint_" + viewpoint_guid;
      let pc_uri = inst_uri + "perspective_camera_" + viewpoint_guid;

      // Create a Perspective Camera for the Viewpoint

      writer.addQuad(
        namedNode(pc_uri),
        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        namedNode(bcdOWL_uri + "PerspectiveCamera")
      );

      writer.addQuad(
        namedNode(pc_uri),
        namedNode(bcdOWL_uri + "hasContext"),
        namedNode(inst_uri + "TaskRMContext")
      );

      writer.addQuad(
        namedNode(pc_uri),
        namedNode(bcdOWL_uri + "hasAspectRatio"),
        literal("1.33", namedNode("http://www.w3.org/2001/XMLSchema#float"))
      );

      writer.addQuad(
        namedNode(pc_uri),
        namedNode(bcdOWL_uri + "hasFieldOfView"),
        literal("60", namedNode("http://www.w3.org/2001/XMLSchema#float"))
      );

      writer.addQuad(
        namedNode(pc_uri),
        namedNode(bcdOWL_uri + "hasCameraDirection"),
        literal(
          "POINT Z(" +
            i.forward_vector[0] +
            " " +
            i.forward_vector[1] +
            " " +
            i.forward_vector[2] +
            ")",
          namedNode("http://www.opengis.net/ont/geosparql#wktLiteral")
        )
      );

      writer.addQuad(
        namedNode(pc_uri),
        namedNode(bcdOWL_uri + "hasCameraUpVector"),
        literal(
          "POINT Z(" +
            i.up_vector[0] +
            " " +
            i.up_vector[1] +
            " " +
            i.up_vector[2] +
            ")",
          namedNode("http://www.opengis.net/ont/geosparql#wktLiteral")
        )
      );

      if (i.location) {
        let wkt_location = literal(
          "POINT Z(" +
            i.location[0] +
            " " +
            i.location[1] +
            " " +
            i.location[2] +
            ")",
          namedNode("http://www.opengis.net/ont/geosparql#wktLiteral")
        );

        writer.addQuad(
          namedNode(pc_uri),
          namedNode(bcdOWL_uri + "hasCameraViewPoint"),
          wkt_location
        );
      }

      //TODO: Add GUID of Building Element

      // Viewpoint
      writer.addQuad(
        namedNode(viewpoint_uri),
        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        namedNode(bcdOWL_uri + "Viewpoint")
      );

      writer.addQuad(
        namedNode(viewpoint_uri),
        namedNode(bcdOWL_uri + "hasContext"),
        namedNode(inst_uri + "TaskRMContext")
      );

      writer.addQuad(
        namedNode(viewpoint_uri),
        namedNode(bcdOWL_uri + "hasGuid"),
        literal(viewpoint_guid)
      );

      writer.addQuad(
        namedNode(viewpoint_uri),
        namedNode(bcdOWL_uri + "hasSelection"),
        literal(i.buildingElement)
      );

      writer.addQuad(
        namedNode(viewpoint_uri),
        namedNode(bcdOWL_uri + "hasTopic"),
        namedNode(intervention_uri)
      );

      writer.addQuad(
        namedNode(viewpoint_uri),
        namedNode(bcdOWL_uri + "hasPerspectiveCamera"),
        namedNode(pc_uri)
      );

      if (i.document_uri) {
        writer.addQuad(
          namedNode(viewpoint_uri),
          namedNode(bcdOWL_uri + "hasOriginatingDocument"),
          namedNode(i.document_uri)
        );
      }
    }
  });

  //const quadStream = store.match(null, null, null);
  //quadStream.pipe(new N3.StreamWriter())
  //    .pipe(process.stdout);
  let result_string: any;
  writer.end((error: any, rdf_result: any) => {
    result_string = rdf_result;
  });

  return await result_string;
}

// convert(gantt_data);
