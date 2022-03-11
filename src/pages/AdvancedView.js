import React from "react";
// import { Graph } from "react-d3-graph";



import BcfOWLService from "../services/BcfOWLService";
import PubSub from "pubsub-js";



// graph payload (with minimalist structure)
let data = {
    nodes: [],
    links: [],
};


// the graph configuration, just override the ones you need
const myConfig = {
    "automaticRearrangeAfterDropNode": false,
    "collapsible": false,
    "directed": true,
    "focusAnimationDuration": 0.75,
    "focusZoom": 2,
    "freezeAllDragEvents": false,
    //"height": 800,
    "highlightDegree": 2,
    "highlightOpacity": 1,
    "linkHighlightBehavior": true,
    "maxZoom": 20,
    "minZoom": 1,
    "nodeHighlightBehavior": true,
    "panAndZoom": true,
    "staticGraph": false,
    "staticGraphWithDragAndDrop": false,
    //"width": 1920,
    "d3": {
        "alphaTarget": 0.05,
        "gravity": -250,
        "linkLength": 10,
        "linkStrength": 100,
        "disableLinkForce": false
    },
    "node": {
        "color": "black",
        "fontColor": "black",
        "fontSize": 12,
        "fontWeight": "normal",
        "highlightColor": "green",
        "highlightFontSize": 12,
        "highlightFontWeight": "normal",
        "highlightStrokeColor": "blue",
        "highlightStrokeWidth": "SAME",
        "labelProperty": "label",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
        "size": 20,
        "strokeColor": "none",
        "strokeWidth": 1.5,
        "svg": "",
        "symbolType": "circle"
    },
    "link": {
        "color": "lightblue",
        "fontColor": "blue",
        "fontSize": 10,
        "fontWeight": "normal",
        "highlightColor": "blue",
        "highlightFontSize": 12,
        "highlightFontWeight": "normal",
        "labelProperty": "label",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
        "semanticStrokeWidth": false,
        "strokeWidth": 1,
        "markerHeight": 6,
        "markerWidth": 6,
        "strokeDasharray": 0,
        "strokeDashoffset": 0,
        "strokeLinecap": "butt"
    }
};



const onClickLink = function(source, target) {
    window.alert(`Clicked link between ${source} and ${target}`);
};

let advancedview_instance;

class AdvancedView extends React.Component {

    constructor() {
        super();
        console.log("Acvanced constructor!")

        this.state = {
            graph: data,
        };
        advancedview_instance=this;
        PubSub.publish("onDestroyViewer");
    }

    onClickNode(nodeId) {
        //window.alert(`Clicked node ${nodeId}`);
        data.focusedNodeId = nodeId;
        advancedview_instance.setState({graph: data});
    };

    render() {
        return <p/>/*<Graph
            className="graph"
            id="graph-id" // id is mandatory
            data={this.state.graph}
            config={myConfig}
            onClickNode={this.onClickNode}
            onClickLink={onClickLink}
        />*/

    }

    componentWillUnmount() {
        data = {
            nodes: [],
            links: [],
        };
    }

    componentDidMount() {
           this.initialize();
    }


    initialize() {
        let bcfowl=new BcfOWLService();
        bcfowl.getCurrentProject1()
            .then(value =>
            {
                const nodes = new Set();
                if(value['@graph']) {
                    value['@graph'].forEach(b => {
                        let subject = b['@id'];
                        let subject_short = subject.substring(subject.lastIndexOf('/')+1);
                        if(subject_short.length===0)
                            subject_short = subject.replaceAll("https://caia.herokuapp.com/graph/","caia:")
                        if(Object.entries(b).length>0)
                            nodes.add({id: subject, label:  subject_short})

                            for (const [key, o] of Object.entries(b)) {
                                if (!key.startsWith('@')) {
                                    if (Array.isArray(o)) {
                                        // do foreach
                                        o.forEach(o1 => {
                                                if (typeof o1 === 'string' || o1 instanceof String)
                                                    if (o1.startsWith('http')) {
                                                        let object = o1;
                                                        let object_short = object.substring(object.lastIndexOf('/')+1);
                                                        if(object_short.length===0)
                                                            object_short = object.replaceAll("https://caia.herokuapp.com/graph/","caia:")
                                                        nodes.add({id: object, label:  object_short})
                                                        data.links.push({source: subject, target: object, label: key})
                                                    }
                                            }
                                        );

                                    } else {
                                        if (typeof o === 'string' || o instanceof String)
                                            if (o.startsWith('http')) {
                                                let object = o;
                                                let object_short = object.substring(object.lastIndexOf('/')+1);
                                                if(object_short.length===0)
                                                    object_short = object.replaceAll("https://caia.herokuapp.com/graph/","caia:")
                                                nodes.add({id: object, label:  object_short})
                                                data.links.push({source: subject, target: object, label: key})
                                            }
                                    }
                                }
                            }

                        }
                    );
                }
                else
                {
                    let subject = value['@id'];
                    let subject_short = subject.substring(subject.lastIndexOf('/')+1);
                    if(subject_short.length===0)
                        subject_short = subject.replaceAll("https://caia.herokuapp.com/graph/","caia:")
                    if(Object.entries(value).length>0)
                      nodes.add({id: subject, label:  subject_short})

                    for (const [kx, ox] of Object.entries(value)) {
                        if (!kx.startsWith('@')) {
                            if (Array.isArray(ox)) {
                                // do foreach
                                ox.forEach(ox1 => {
                                        if (typeof ox1 === 'string' || ox1 instanceof String)
                                            if (ox1.startsWith('http')) {
                                                let object = ox1;
                                                let object_short = object.substring(object.lastIndexOf('/')+1);
                                                nodes.add({id: object, label:  object_short})

                                                data.links.push({source: subject, target: object, label: kx})
                                            }
                                    }
                                );

                            } else {
                                if (typeof ox === 'string' || ox instanceof String)
                                    if (ox.startsWith('http')) {
                                        let object = ox;
                                        let object_short = object.substring(object.lastIndexOf('/')+1);
                                        nodes.add({id: object, label:  object_short})
                                        data.links.push({source: subject, target: object, label: kx})
                                    }
                            }
                        }
                    }


                }
                nodes.forEach(n => data.nodes.push(n));

                this.setState({graph: data});
            })
            .catch(err => {
                console.log(err)
            });;
    }
}

export default AdvancedView;