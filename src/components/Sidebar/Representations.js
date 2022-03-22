import React from "react";
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

class Representations extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            documents: [],
            selected_ids: [],
            screen: 0,
            selected_document: null,
            new_file_name: null,
            file: null,
        };
        this.project_id = ReactSession.get("projectid");
        this.un_SidebarName=PubSub.publish('SidebarName', {name: "Representations"})
        this.un_DocumentsViewStateChange = PubSub.subscribe("DocumentsViewStateChange", this.onDocumentsViewStateChange.bind(this))
        this.un_SetSelectedDocument = PubSub.subscribe("SetSelectedDocument", this.onDocumentSelected.bind(this));
        this.un_ShowDocument = PubSub.subscribe("ShowDocument", this.onShowDocument.bind(this));
        this.un_UnSelectDocument = PubSub.subscribe("DocumentUnSelected", this.onDocumentUnSelected.bind(this));
        this.UploadFileFieldRef = React.createRef();
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.un_SidebarName);
        PubSub.unsubscribe(this.un_DocumentsViewStateChange);
        PubSub.unsubscribe(this.un_SetSelectedDocument);
        PubSub.unsubscribe(this.un_ShowDocument);
        PubSub.unsubscribe(this.un_UnSelectDocument);
    }


    onDocumentSelected(msg, data) {
        this.setState({ selected_document: data.id });
        this.setState({ screen: 1 });
        PubSub.publish("ShowDocument", {
            id: data.id,
            url: data.url,
            spatial_representation: data.spatial_representation,
            data: data.data,
            name: data.name,});
    }

    onShowDocument(msg, data) {
        let ids = this.state.selected_ids
        if (!ids.includes(data.id)) {
            ids.push(data.id)
            this.setState({selected_ids: ids})
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

    onDocumentUnSelected(msg, data) {

        let ids = this.state.selected_ids
        if (ids.includes(data.id)) {
            ids = ids.filter(item => item !== data.id)
            this.setState({selected_ids: ids})
        }
    }

    onDocumentsViewStateChange(msg, data) {
        this.setState({ screen: 0})
        this.init();
    }

    onFileSelectionChangeHandler=event=>{
        let file = event.target.files[0];
        fileToArrayBuffer(file).then((data) => {
            let file_extension=file.name.split('.').pop().toLowerCase();
            switch(file_extension){
                case "ifc":
                    console.log(data.byteLength)
                    if (data.byteLength < 50000000) {
                        this.setState({ new_file_name: file.name});
                        this.setState({file: file})
                        this.setState({ selected_document: file.name });
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
                    this.setState({ new_file_name: file.name});
                    this.setState({file: file})
                    this.setState({ selected_document: "new_temp_plan" });
                    this.setState({ screen: 1 });
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

    render() {
        const document_list = this.state.documents.map(d => {
            if (d["@id"]) {
                let selectedId = this.state.selected_ids.includes(d["@id"])
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
        }   );


        let leftPanel;
        if(this.state.screen===0) // DEFAULT VIEW
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
                            this.setState({ screen: 0 })
                        }}/>
                        <RepresentationDetails selected_document={this.state.selected_document} newfilename={this.state.new_file_name} file={this.state.file} viewer={this.props.viewer}/>
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

    init() {

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

export default Representations;