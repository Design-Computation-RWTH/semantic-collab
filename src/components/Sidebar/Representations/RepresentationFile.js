import React from "react";
import Button from "react-bootstrap/Button";
import PubSub from "pubsub-js";

export default function RepresentationFile({data, document: {filename, id, documentURL, selected, spatialRepresentation}} ) {

    //Opens the Document Details in the Sidebar
    function showDocumentDetails() {
        selected=true;
        //Target: Representation.js, onDocumentSelected
        PubSub.publish("SetSelectedDocument", {
            id: id,
            url: documentURL,
            spatial_representation: spatialRepresentation,
            data: data,
            name: filename,
        })
    }

    // Activates / shows the document in the Xeokit environment
    function showDocument() {
        selected=true;
        //Target: Representation.js, onShowDocument
        PubSub.publish("ShowDocument", {
            id: id,
            url: documentURL,
            spatial_representation: spatialRepresentation,
            data: data,
            name: filename,});
    }

    function determineEnding() {
        if (filename.endsWith(".ifc")) {
            return "icon bi-box btn-caia-icon-size" }
        else {
            return "icon bi-file-earmark-pdf btn-caia-icon-size"
        }
    }

    return (
                <tr key={id}>
                    <td className="file-component" >
                        <i className={determineEnding()}/>
                        <Button
                            variant="outline-primary"
                            className="btn-caia-hidden"
                            onClick={showDocumentDetails}
                        >
                            {filename}
                        </Button>
                        <div className="toggle-switch">
                            <input  id={id}  defaultChecked={selected} type="checkbox" onClick={ () => {
                                    PubSub.publish("Alert", {type: "info"})
                                }
                                } onChange={e=>{
                                    if(selected)
                                    {
                                        selected=!selected;
                                    }
                                    else {
                                        selected=true;
                                    }
                                    if(selected===true) {
                                        showDocument()
                                    }
                                    else
                                        //Target: XeoKitView.js
                                        PubSub.publish('DocumentUnSelected', {id: id})
                                        console.log("DocumentUnSelected" + id)
                                }}
                                className="toggle-switch-checkbox" name="toggleSwitch" />
                            <label  className="toggle-switch-label" htmlFor={id}>
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