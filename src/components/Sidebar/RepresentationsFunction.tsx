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
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import {ViewerContext} from "../../context/dcwebviewerContext";
import {DcWebViewerContextType} from "../../@types/dcwebviewer";

type RepresentationsProps = {
};

type SelectedDocument = {
    id: string;
    url: string;
    spatial_representation: any;
    data: any;
    name: string;
}

export default function Representations(props: RepresentationsProps) {
    //const [checked, setChecked] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [selected_ids, setSelected_ids] = useState<string[]>([]);
    const [screen, setScreen] = useState(0);
    const [selected_document, setSelected_document] = useState<string>("");
    const [new_file_name, setNew_file_name] = useState(null);
    const [file, setFile] = useState(null);

    const {viewer} = React.useContext(ViewerContext) as DcWebViewerContextType;

    //
    let project_id:any = ReactSession.get("projectid");
    let UploadFileFieldRef:any = React.createRef();

    let un_DocumentsViewStateChange:any;
    let un_SetSelectedDocument:any;
    let un_ShowDocument:any;
    let un_UnSelectDocument:any;

    useEffect(() => {
        console.log("Mount")
        init();

    }, [])

    useEffect(() => {
        return () => {
            console.log("Unmount")
            PubSub.unsubscribe(un_DocumentsViewStateChange);
            PubSub.unsubscribe(un_SetSelectedDocument);
            PubSub.unsubscribe(un_ShowDocument);
            PubSub.unsubscribe(un_UnSelectDocument);
        }
    }, [])

   // console.log("init")

    function init() {

        un_DocumentsViewStateChange = PubSub.subscribe("DocumentsViewStateChange", onDocumentsViewStateChange)
        un_SetSelectedDocument = PubSub.subscribe("SetSelectedDocument", onDocumentSelected);
        un_ShowDocument = PubSub.subscribe("ShowDocument", onShowDocument);
        un_UnSelectDocument = PubSub.subscribe("DocumentUnSelected", onDocumentUnSelected);

        console.log("init")
        //TODO: Last Update is preventing force refreshing
        let lastUpdate =ReactSession.get("project_documents_lastime_pid"+project_id);
        let thisMoment=new Date().getTime() / 10;
        if((thisMoment-lastUpdate)<10) {
            let value=ReactSession.get("project_documents_pid"+project_id);
            setDocuments(value);
            return;
        }
        let bcfowl=new BcfOWLService();
        bcfowl.getDocuments()
            .then(value => {
                if(value["@graph"])
                    value=value["@graph"];
                if(!Array.isArray(value))
                    value=[value];
                setDocuments(value);
                console.log("SetDocuments")
                ReactSession.set("project_documents_pid"+project_id, value);
                ReactSession.set("project_documents_lastime_pid"+project_id, thisMoment);

            })
            .catch(err => {
                console.log(err)
            });
    }

    // init();

    function onDocumentSelected(msg: any, data: SelectedDocument) {
        setSelected_document(data.id);
        setScreen(1);
        PubSub.publish("ShowDocument", {
            id: data.id,
            url: data.url,
            spatial_representation: data.spatial_representation,
            data: data.data,
            name: data.name,});
    }

    function onShowDocument(msg: any, data: { id: any; spatial_representation: string; url: any; data: any; name: any; }) {
        let ids = selected_ids
        if (!ids.includes(data.id)) {
            ids.push(data.id);
            setSelected_ids(ids);
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

    function onDocumentUnSelected(msg: any, data: { id: any; }) {

        let ids = selected_ids
        if (ids.includes(data.id)) {
            ids = ids.filter(item => item !== data.id);
            setSelected_ids(ids);
        }
    }

    function onDocumentsViewStateChange() {
        setScreen(0);
        init();
    }

    const onFileSelectionChangeHandler=(event: any)=>{
        let file = event.target.files[0];
        fileToArrayBuffer(file).then((data) => {
            let file_extension=file.name.split('.').pop().toLowerCase();
            switch(file_extension){
                case "ifc":
                    console.log(data.byteLength)
                    if (data.byteLength < 50000000) {
                        setNew_file_name(file.name);
                        setFile(file)
                        setSelected_document(file.name );
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

                    break;
                case "png":
                    // We send the raw data to the XeoKitView:
                    PubSub.publish('NewUploadedPlan', {name: file.name, rawvalue: file});
                    setNew_file_name(file.name);
                    setFile(file)
                    setSelected_document("new_temp_plan" );
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

    function document_list() {
        return  documents.map((d:any) => {
            if (d["@id"]) {
                let selectedId = selected_ids.includes(d["@id"])
                return <RepresentationFile
                    data={d}
                    key={d["@id"]}
                    document={
                        {
                            filename: d.hasFilename,
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
        });
    }

    function leftPanel() {
        let leftPanel;
        if (screen === 0) // DEFAULT VIEW
        {
            console.log("Screen 0")
            leftPanel =
                <div>
                    <Table striped bordered hover size="sm">
                        <tbody>
                        {document_list()}
                        </tbody>
                    </Table>
                </div>
        } else {
            console.log("Screen 1")
            leftPanel =
                <div>
                    <CloseButton onClick={() => {
                        PubSub.publish("CancelNewDocument", {});
                        setScreen(0);
                    }}/>
                    <RepresentationDetails selected_document={selected_document} newfilename={new_file_name}
                                           file={file} viewer={viewer}/>
                </div>

        }
        return leftPanel;
    }


    return  <div className="caia-fill caia-background">
                <div className="yscroll">
                    {leftPanel()}
                </div>
                <Container style={{display: "flex", width:"100%", justifyContent:"center"}} sx={(theme) => ({
                        backgroundColor: theme.colors.dark
                    })}>
                    <button className="btn-caia-icon" title="Refresh List" onClick={()=> {
                        init()
                        console.log("StateTest")
                        alert("Test alert. ")
                    }}>
                        <i className="icon bi-arrow-clockwise btn-caia-icon-size"/>
                    </button>
                    <button className="btn-caia-icon" disabled title="Add spatial node"><i className="icon bi-folder-plus btn-caia-icon-size"/></button>
                    <button className="btn-caia-icon"  title="Upload Spatial Representation"  onClick={()=>{UploadFileFieldRef.current.click()}}><i className="icon bi-box-arrow-up btn-caia-icon-size"/></button>
                    <input id="file-input" type="file" ref={UploadFileFieldRef} className="invisible" onChange={onFileSelectionChangeHandler}/>
                </Container>
            </div>

}