//import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";
import Figure from "react-bootstrap/Figure";
import CloseButton from "react-bootstrap/CloseButton";
import {Container} from "@mantine/core";

import ImageService from "../../services/ImageService"
import BCFAPIService from "../../services/BCFApIService"

import TopicTable from "./Gallery/TopicTable";
// @ts-ignore
import PubSub from "pubsub-js";

class SnapShotThumbnail {
    private uri: string;
    private guid: any;
    private topic_guid: any;

    constructor(thumbnail_uri: string, guid: any, topic_guid: any) {
        this.uri = thumbnail_uri;
        this.guid=guid;
        this.topic_guid = topic_guid;
    }
}

let imageGalleryView_instance:Gallery|null=null;
type GalleryProps = {

};

type GalleryState = {
    viewpoints:any[];
    active_topic:any;
    large_image_uri: string,
    screen: number,
    Offcanvas: boolean,
};

class Gallery extends React.Component<GalleryProps,GalleryState> {
    private imageservice: ImageService;
    private readonly un_ViewpointSelected: any;

    constructor(props: GalleryProps | Readonly<GalleryProps>) {
        super(props);
        this.imageservice=new ImageService();
        imageGalleryView_instance = this;
        this.un_ViewpointSelected=PubSub.subscribe("ViewpointSelected", this.subViewpointSelected);

        this.state = {
            viewpoints: [],
            large_image_uri: "Icon_v2.svg",
            active_topic: null,
            screen: 0,
            Offcanvas:true,
        };
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.un_ViewpointSelected);
    }


    subViewpointSelected(msg: any, data: { id: string; }) {
            if(imageGalleryView_instance!=null) {
                imageGalleryView_instance.state.viewpoints.forEach(viewpoint => {
                    console.log(data.id.split("/")[data.id.split("/").length - 1])
                    if (viewpoint.guid === data.id.split("/")[data.id.split("/").length - 1]) {

                        // @ts-ignore  // null handled above
                        imageGalleryView_instance.setState({screen: 1});
                        // @ts-ignore
                        let image = imageGalleryView_instance.imageservice.getImageData4GUID(viewpoint.guid);
                        // @ts-ignore
                        imageGalleryView_instance.setState({active_topic: viewpoint.topic_guid});
                        PubSub.publish('SelectedTopicID', {topic_guid: viewpoint.topic_guid});
                        image.then(img => {
                                if (img.size > 0) {
                                    let url = URL.createObjectURL(img);
                                    // @ts-ignore
                                    imageGalleryView_instance.setState({large_image_uri: url});
                                }
                            }
                        )

                    }
                })


                imageGalleryView_instance.setState({screen: 1});
            }
    }

    render() {
            const imageslist1 = this.state.viewpoints.map((s) =>

                        <img   className={'image'} key={s.uri}
                                src={s.uri}
                                 alt={""}
                                onClick={() => {
                                    this.setState({ screen: 1 });

                                    let image=this.imageservice.getImageData4GUID(s.guid);
                                    this.setState({active_topic:s.topic_guid});
                                    PubSub.publish('SelectedTopicID', {topic_guid: s.topic_guid});
                                    image.then(img=> {
                                            if(img.size >0) {
                                                let url = URL.createObjectURL(img);
                                                this.setState({large_image_uri:url});
                                            }
                                        }
                                    )
                                }}
                               />
            );
            let gallery;
            if(this.state.screen===0) // DEFAULT VIEW
            {
                gallery = <Container className="caia-fill">
                    <Row>
                        <div>
                            <Row>
                                <Col xs={11} md={11}>
                                    {imageslist1}
                                </Col>
                            </Row>
                        </div>
                    </Row>
                </Container>
            }
            if(this.state.screen===1)
            {

                gallery = <div>
                            <Container>
                                        <div>
                                            {/*  //TODO variant="black" does not exist
                                                 // @ts-ignore */}
                                            <CloseButton variant="black" onClick={() => this.setState({ screen: 0 })}/>
                                        </div>
                                        <div>
                                            <div className="image-div">
                                                <Figure className="image-div">
                                                    <Figure.Image
                                                        className="rounded mx-auto d-block"
                                                        width={300}
                                                        height={400}
                                                        alt="300x400"
                                                        src={this.state.large_image_uri}
                                                        onClick={() => this.setState({ screen: 1 })}/>
                                                    <Figure.Caption>
                                                    </Figure.Caption>
                                                </Figure>
                                            </div>
                                            <TopicTable topic_guid={this.state.active_topic}/>
                                        </div>
                            </Container>
                        </div>
            }

            return (
                <div className="caia-fill caia-background">
                    <div className="yscroll">
                        {gallery}
                    </div>
                    <Container style={{display: "flex", width:"100%", justifyContent:"center"}} sx={(theme) => ({
                        backgroundColor: theme.colors.dark
                    })}>
                        <button className="btn-caia-icon"><i className="icon bi-funnel btn-caia-icon-size"/></button>
                        <button className="btn-caia-icon"><i className="icon bi-plus-square btn-caia-icon-size"/></button>
                    </Container>
                </div>


                );
    }



    componentDidMount() {
        let bcfapi=new BCFAPIService();
        bcfapi.getAllViewPoints()
            .then(value => {
                value.forEach((viewpoint: { guid: string; topic_guid: any; }) =>
                    {
                        let snapshot=this.imageservice.getThumbnailData(viewpoint.guid);
                        snapshot.then(img=> {
                                if(img.size >0)
                                {
                                    let url = URL.createObjectURL(img);
                                    let joined = this.state.viewpoints.concat(new SnapShotThumbnail(url,viewpoint.guid,viewpoint.topic_guid));
                                    this.setState({viewpoints: joined});
                                }
                            }
                        )
                    }
                );
            })
            .catch(err => {
                console.log(err)
            })
    }
}

export default Gallery;