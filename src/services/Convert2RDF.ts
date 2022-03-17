// @ts-ignore
import * as data from "./assets/Gantt.json"

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal} = DataFactory;
const store = new N3.Store();

type Intervention = {
    id: number;
    name:string;
    description:string;
    intervention_category_id?:number;
    estimated_cost:number;
    start_date:string;
    end_date:string;
    intervention_priority_id:number;
    renovation_id:number;
    intervention_post_id:number;
    intervention_post_name:string;
    parent_intervention?:number;
    required_previous?:number[];
    checks?:string[];
}

type InterventionPost = {
    id:number;
    name:string;
    description:string;
    energy_related:boolean;
    multi_layer:boolean;
}


function convert()
{
    let inst_uri="http://example.org/inst/";
    let bcdOWL_uri="http://lbd.arch.rwth-aachen.de/bcfOWL#";
    let interventions_map = new Map<number, string>(); // number -> uri
    let interventions_posts_map = new Map<number, string>(); // number -> uri
    let interventions_taskmethods_map = new Map<string, string>(); // number -> uri
    let taskmethods:number=1;
    data.interventions.forEach((i: Intervention)=> {
        let intervention_uri = inst_uri+"Intervention_"+i.name.replace(/ /g, "_").replace(/ç/g, "c") +"_"+ i.id;
        interventions_map.set(i.id,intervention_uri);


        if(i.checks)
        {
            i.checks.forEach((check:string)=>{
                if(!interventions_taskmethods_map.has(check)) {
                    let task_method_uri = inst_uri + "TaskMethod_" + taskmethods;
                    interventions_taskmethods_map.set(check,task_method_uri);
                    taskmethods = taskmethods + 1;
                    store.addQuad(
                        namedNode(intervention_uri),
                        namedNode("https://w3id.org/cto#hasTaskMethod"),
                        namedNode(task_method_uri)
                    );
                    store.addQuad(
                        namedNode(task_method_uri),
                        namedNode("https://w3id.org/cto#hasSimpleTaskMethodDescription"),
                        literal("Check: "+check)
                    );
                    store.addQuad(
                        namedNode(task_method_uri),
                        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
                        namedNode('https://w3id.org/cto#TaskMethod')
                    );
                }
            });
        }
    });

    data.intervention_posts.forEach((i: InterventionPost)=> {
        let interventionpost_uri=inst_uri+"InterventionPost_"+i.name.replace(/ /g,"_").replace(/ç/g,"c")+"_"+i.id;
        interventions_posts_map.set(i.id,interventionpost_uri);
        store.addQuad(
            namedNode(interventionpost_uri),
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            namedNode(bcdOWL_uri+'TopicType')
        );
        store.addQuad(
            namedNode(interventionpost_uri),
            namedNode("http://purl.org/dc/terms/identifier"),
            literal(i.id)
        );
        store.addQuad(
            namedNode(interventionpost_uri),
            namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
            literal(i.name)
        );
        store.addQuad(
            namedNode(interventionpost_uri),
            namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
            literal(i.description)
        );
    });

    data.interventions.forEach((i: Intervention)=>{
        let intervention_uri=interventions_map.get(i.id);  // just not to recreate it
        store.addQuad(
            namedNode(intervention_uri),
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            namedNode(bcdOWL_uri+'Topic')
        );
        store.addQuad(
            namedNode(intervention_uri),
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            namedNode("https://w3id.org/cto#Task")
        );
        store.addQuad(
            namedNode(intervention_uri),
            namedNode(bcdOWL_uri+'hasTitle'),
            literal(i.name)
        );
        store.addQuad(
            namedNode(intervention_uri),
            namedNode(bcdOWL_uri+'hasDescription'),
            literal(i.description)
        );
        let lit_CreationDate=literal(
            new Date(i.start_date).toISOString(), // Not a good fit
            namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
        )
        store.addQuad(
            namedNode(intervention_uri),
            namedNode(bcdOWL_uri+'hasCreationDate'),
            lit_CreationDate
        );
        let lit_DueDate=literal(
            new Date(i.end_date).toISOString(),
            namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
        )
        store.addQuad(
            namedNode(intervention_uri),
            namedNode(bcdOWL_uri+'hasDueDate'),
            lit_DueDate
        );

        store.addQuad(
            namedNode(intervention_uri),
            namedNode(bcdOWL_uri+'hasPriority'),
            namedNode(inst_uri+'priority_'+i.intervention_priority_id),
        );

        let intervention_TopicType=i.intervention_post_name.replace(/ /g,"_").replace(/ç/g,"c")+i.intervention_post_id;
        store.addQuad(
            namedNode(intervention_uri),
            namedNode(bcdOWL_uri+'hasTopicType'),
            namedNode(inst_uri+intervention_TopicType),
        );

        store.addQuad(
            namedNode(intervention_uri),
            namedNode(bcdOWL_uri+'hasTopicStatus'),
            namedNode(inst_uri+'Active'),
        );

        if(i.required_previous)
        {
            i.required_previous.forEach((referred_id:number)=>{
                let referred_intervention_uri=interventions_map.get(referred_id);
                store.addQuad(
                    namedNode(intervention_uri),
                    namedNode("https://w3id.org/cto#afterFinishedTask"),
                    namedNode(referred_intervention_uri),
                );
            });
        }

        if(i.parent_intervention)
        {
            let referred_intervention_uri=interventions_map.get(i.parent_intervention);
            store.addQuad(
                namedNode(intervention_uri),
                namedNode("https://w3id.org/cto#hasTaskContext"),
                namedNode(referred_intervention_uri)
            );
        }
    })

    const quadStream = store.match(null, null, null);
    quadStream.pipe(new N3.StreamWriter())
        .pipe(process.stdout);
}

convert();