// @ts-ignore
import * as gantt_data from "./assets/Gantt.json";

const N3 = require("n3");
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

type Intervention = {
  id: number;
  name: string;
  description: string;
  intervention_category_id?: number;
  estimated_cost: number;
  start_date: string;
  end_date: string;
  intervention_priority_id: number;
  renovation_id: number;
  intervention_post_id: number;
  intervention_post_name: string;
  parent_intervention?: number;
  required_previous?: number[];
  checks?: string[];
};

type InterventionPost = {
  id: number;
  name: string;
  description: string;
  energy_related: boolean;
  multi_layer: boolean;
};

// @ts-ignore
function streamToString(stream) {
  // @ts-ignore
  const chunks = [];
  return new Promise((resolve, reject) => {
    // @ts-ignore
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    // @ts-ignore
    stream.on("error", (err) => reject(err));
    // @ts-ignore
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

function convert(data: any) {
  let inst_uri = "http://example.org/inst/";
  let bcdOWL_uri = "http://lbd.arch.rwth-aachen.de/bcfOWL#";

  const writer = new N3.Writer({
    prefixes: {
      cto: "https://w3id.org/cto#",
      bcfowl: bcdOWL_uri,
      inst: inst_uri,
    },
  });
  let interventions_map = new Map<number, string>(); // number -> uri
  let interventions_posts_map = new Map<number, string>(); // number -> uri
  let interventions_taskmethods_map = new Map<string, string>(); // number -> uri
  let taskmethods: number = 1;
  data.interventions.forEach((i: Intervention) => {
    let intervention_uri =
      inst_uri +
      "Intervention_" +
      i.name.replace(/ /g, "_").replace(/ç/g, "c") +
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
            namedNode("https://w3id.org/cto#" + "hasTaskMethod"),
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

  data.intervention_posts.forEach((i: InterventionPost) => {
    let interventionpost_uri =
      inst_uri +
      "InterventionPost_" +
      i.name.replace(/ /g, "_").replace(/ç/g, "c") +
      "_" +
      i.id;
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
  });

  data.interventions.forEach((i: Intervention) => {
    let intervention_uri = interventions_map.get(i.id); // just not to recreate it
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      namedNode(bcdOWL_uri + "Topic")
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      namedNode("https://w3id.org/cto#" + "Task")
    );
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasTitle"),
      literal(i.name)
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
      namedNode(inst_uri + "priority_" + i.intervention_priority_id)
    );

    let intervention_TopicType =
      i.intervention_post_name.replace(/ /g, "_").replace(/ç/g, "c") +
      i.intervention_post_id;
    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasTopicType"),
      namedNode(inst_uri + intervention_TopicType)
    );

    writer.addQuad(
      namedNode(intervention_uri),
      namedNode(bcdOWL_uri + "hasTopicStatus"),
      namedNode(inst_uri + "Active")
    );

    if (i.required_previous) {
      i.required_previous.forEach((referred_id: number) => {
        let referred_intervention_uri = interventions_map.get(referred_id);
        writer.addQuad(
          namedNode(intervention_uri),
          namedNode("https://w3id.org/cto#" + "afterFinishedTask"),
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
        namedNode("https://w3id.org/cto#" + "hasTaskContext"),
        namedNode(referred_intervention_uri)
      );
    }
  });

  //const quadStream = store.match(null, null, null);
  //quadStream.pipe(new N3.StreamWriter())
  //    .pipe(process.stdout);
  let result_string: string;
  writer.end((error: any, rdf_result: any) => {
    console.log(rdf_result);
  });
}

convert(gantt_data);
