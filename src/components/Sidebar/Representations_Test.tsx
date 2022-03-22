import React, {useEffect, useState} from "react";
import BcfOWLService from "../../services/BcfOWLService";
import {Table} from "react-bootstrap";
import {ReactSession} from "react-client-session";
import CloseButton from "react-bootstrap/CloseButton";
import RepresentationDetails from "./Representations/RepresentationDetails";
import PubSub from "pubsub-js";
import fileToArrayBuffer from "file-to-array-buffer";
import RepresentationFile from "./Representations/RepresentationFile";
import ImageService from "../../services/ImageService";
import {Container} from "@mantine/core";

// const base_uri = "https://caia.herokuapp.com";

export default function Representations(props:any) {

    const [checked, setChecked] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [screen, setScreen] = useState(0);
    const [newFileName, setNewFileName] = useState(null);
    const [file, setFile] = useState(null);

    let project_id = ReactSession.get("projectid");
    let un_SidebarName=PubSub.publish('SidebarName', {name: "Representations"})
    let un_DocumentsViewStateChange = PubSub.subscribe("DocumentsViewStateChange", onDocumentsViewStateChange)
    let un_SetSelectedDocument = PubSub.subscribe("SetSelectedDocument", onDocumentSelected);
    let un_ShowDocument = PubSub.subscribe("ShowDocument", onShowDocument);
    let un_UnSelectDocument = PubSub.subscribe("DocumentUnSelected", onDocumentUnSelected);
    let UploadFileFieldRef = React.createRef();

    useEffect(() => {
        init();

    }, [screen])

    useEffect(() => {
        return () => {
            PubSub.unsubscribe(un_SidebarName);
            PubSub.unsubscribe(un_DocumentsViewStateChange);
            PubSub.unsubscribe(un_SetSelectedDocument);
            PubSub.unsubscribe(un_ShowDocument);
            PubSub.unsubscribe(un_UnSelectDocument);
        }
    }, [])


    function onDocumentSelected(msg:any, data:any) {
        setSelectedDocument(data.id);
        setScreen(1);

        PubSub.publish("ShowDocument", {
            id: data.id,
            url: data.url,
            spatial_representation: data.spatial_representation,
            data: data.data,
            name: data.name,});
    }

    function onShowDocument(msg: any, data: any) {
        let ids:any = selectedIds
        if (!ids.includes(data.id)) {
            ids.push(data.id)
            setSelectedIds(ids);
        }
        let bcfowl=new BcfOWLService();
        bcfowl.describe(data.spatial_representation)
            .then(spatial_representation => {
                PubSub.publish('DocumentSelected', {
                    id: data.id,
                    url: data.url,
                    spatial_representation: spatial_representation,
                    data: data.data,
                    name: data.name,
                });
            })
            .catch(err => {
                console.log(err)
            });

    }

    function onDocumentUnSelected(msg: any, data: any) {

        let ids:any = selectedIds;
        if (ids.includes(data.id)) {
            ids = ids.filter((item: any) => item !== data.id)
            setSelectedIds(ids)
        }
    }

    function onDocumentsViewStateChange(msg: any, data: any) {
        setScreen(0);
        //init();
    }

    function onFileSelectionChangeHandler=(event:any)=>{
        let file = event.target.files[0];
        fileToArrayBuffer(file).then((data) => {
            let file_extension=file.name.split('.').pop().toLowerCase();
            switch(file_extension){
                case "ifc":
                    console.log(data.byteLength)
                    if (data.byteLength < 50000000) {
                        setNewFileName(file.name);
                        setFile(file);
                        setSelectedDocument(file.name);
                        let spatial_json = {
                            alignment: "center",
                            location: {
                                x: 0,
                                y: 0,
                                z: 0,
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0,
                            },
                            scale: {
                                x: 1,
                                y: 1,
                                z: 1,
                            },
                        };

                        let imageService = new ImageService();
                        let bcfowl = new BcfOWLService();


                        imageService.postFile(file, file.name)
                            .then((message) => {
                                console.log(message)
                                // let file_url = base_uri + "/files/" + this.project_id + "/" + file.name
                                bcfowl.createDocumentWithSpatialRepresentation(file.name, spatial_json)
                                    .then((message) => {
                                        console.log(message);
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    });
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }
                    else {
                        PubSub.publish("Alert", {type: "warning", message: "Currently just files under 50mb are supported", title: "File size exceeded"})
                    }
                    // console.log('picked ifc');
                    // // We send the raw data to the XeoKitView:
                    // PubSub.publish('NewUploadedIFC', {name: file.name, rawvalue: data, file: file});

                    break;
                case "png":
                    // We send the raw data to the XeoKitView:
                    PubSub.publish('NewUploadedPlan', {name: file.name, rawvalue: file});
                    let dummyName:any = "new_temp_plan"
                    setNewFileName(file.name)
                    setFile(file)
                    setSelectedDocument(dummyName);
                    setScreen(1);
                    break;
                case "pdf":
                    console.log('picked pdf');
                    break;
                default:
                    console.log('picked default');
                    break;
            }
        })

    }

        const document_list = documents.map(d => {
            if (d["@id"]) {
                let selectedId = selectedIds.includes(d["@id"])
                return <RepresentationFile
                    data={d}
                    key={d["@id"]}
                    document={
                        {
                            filename: d["hasFilename"],
                            id: d["@id"],
                            documentURL: d["hasDocumentURL"],
                            selected: selectedId,
                            spatialRepresentation: d["hasSpatialRepresentation"]
                        }
                    }
                />
            } else {
                return <div/>
            }
        }   );


        let leftPanel;
        if(screen===0) // DEFAULT VIEW
        {
            leftPanel =
                <div>
                        <Table striped bordered hover size="sm">
                            <tbody>
                            {document_list}
                            </tbody>
                        </Table>
                </div>
        }
        else
        {
            leftPanel =
                    <div>
                        <CloseButton onClick={() => {
                            PubSub.publish("CancelNewDocument", {})
                            setScreen(0)
                        }}/>
                        <RepresentationDetails selected_document={selectedDocument} newfilename={newFileName} file={file} viewer={this.props.viewer}/>
                    </div>

        }

        return (
            <div className="caia-fill caia-background">
                <div className="yscroll">
                    {leftPanel}
                </div>
                <Container style={{display: "flex", width:"100%", justifyContent:"center"}} sx={(theme) => ({
                        backgroundColor: theme.colors.dark
                    })}>
                    <button className="btn-caia-icon" title="Refresh List" onClick={(e)=> {
                        this.init()
                        console.log("StateTest")
                        alert("Test alert. ")
                    }}>
                        <i className="icon bi-arrow-clockwise btn-caia-icon-size"/>
                    </button>
                    <button className="btn-caia-icon" disabled title="Add spatial node"><i className="icon bi-folder-plus btn-caia-icon-size"/></button>
                    <button className="btn-caia-icon"  title="Upload Spatial Representation"  onClick={()=>{this.UploadFileFieldRef.current.click()}}><i className="icon bi-box-arrow-up btn-caia-icon-size"/></button>
                    <input id="file-input" type="file" ref={this.UploadFileFieldRef} className="invisible" onChange={this.onFileSelectionChangeHandler}/>
                </Container>
            </div>);
    }


    componentDidMount() {
        this.init()
    }

    function init() {

        //TODO: Last Update is preventing force refreshing
        let lastUpdate =ReactSession.get("project_documents_lastime_pid"+this.project_id);
        let thisMoment=new Date().getTime() / 10;
        if((thisMoment-lastUpdate)<10) {
            let value=ReactSession.get("project_documents_pid"+this.project_id);
            this.setState({ documents:  value});
            return;
        }
        let bcfowl=new BcfOWLService();
        bcfowl.getDocuments()
                .then(value => {
                if(value["@graph"])
                    value=value["@graph"];
                if(!Array.isArray(value))
                    value=[value];
                this.setState({ documents: value });

                ReactSession.set("project_documents_pid"+this.project_id, value);
                ReactSession.set("project_documents_lastime_pid"+this.project_id, thisMoment);

            })
            .catch(err => {
                console.log(err)
            });
    }
}

/*function handleChecked(viewer, id) {
    let checked = false;
    if(viewer.viewer.scene.models[id]){
        checked = viewer.viewer.scene.models[id].visible
    }

    return checked;
}*/
