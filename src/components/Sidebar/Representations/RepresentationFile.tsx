import React from "react";
import Button from "react-bootstrap/Button";
// @ts-ignore
import PubSub from "pubsub-js";

type DocumentType = {
        filename:string,
        id:string;
        documentURL:string;
        selected:boolean;
        spatialRepresentation:any;
};

type RepresentationFilePropsType = {
    data:any;
    document: DocumentType;
};

export default function RepresentationFile(props: RepresentationFilePropsType) {

    //Opens the Document Details in the Sidebar
    function showDocumentDetails() {
        props.document.selected=true;
        //Target: Representation.js, onDocumentSelected
        PubSub.publish("SetSelectedDocument", {
            id: props.document.id,
            url: props.document.documentURL,
            spatial_representation: props.document.spatialRepresentation,
            data: props.data,
            name: props.document.filename,
        })
    }

    // Activates / shows the document in the Xeokit environment
    function showDocument() {
        props.document.selected=true;
        //Target: Representation.js, onShowDocument
        PubSub.publish("ShowDocument", {
            id: props.document.id,
            url: props.document.documentURL,
            spatial_representation: props.document.spatialRepresentation,
            data: props.data,
            name: props.document.filename,});
    }

    function determineEnding() {
        if (props.document.filename.endsWith(".ifc")) {
            return "icon bi-box btn-caia-icon-size" }
        else {
            return "icon bi-file-earmark-pdf btn-caia-icon-size"
        }
    }

    return (
                <tr key={props.document.id}>
                    <td className="file-component" >
                        <i className={determineEnding()}/>
                        <Button
                            variant="outline-primary"
                            className="btn-caia-hidden"
                            onClick={showDocumentDetails}
                        >
                            {props.document.filename}
                        </Button>
                        <div className="toggle-switch">
                            <input  id={props.document.id}  defaultChecked={props.document.selected} type="checkbox" onClick={ () => {
                                    PubSub.publish("Alert", {type: "info"})
                                }
                                } onChange={e=>{
                                    if(props.document.selected)
                                    {
                                        props.document.selected=!props.document.selected;
                                    }
                                    else {
                                        props.document.selected=true;
                                    }
                                    if(props.document.selected===true) {
                                        showDocument()
                                    }
                                    else
                                        //Target: XeoKitView.js
                                        PubSub.publish('DocumentUnSelected', {id: props.document.id})
                                        console.log("DocumentUnSelected" + props.document.id)
                                }}
                                className="toggle-switch-checkbox" name="toggleSwitch" />
                            <label  className="toggle-switch-label" htmlFor={props.document.id}>
                                <span className="toggle-switch-inner"/>
                                <span className="toggle-switch-switch"/>
                            </label>
                        </div>

                    </td>
                </tr>
    )
}

RepresentationFile.propTypes = {
}