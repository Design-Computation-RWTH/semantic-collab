//import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useEffect, useState } from "react";
import Figure from "react-bootstrap/Figure";
import CloseButton from "react-bootstrap/CloseButton";
import { Container } from "@mantine/core";

import ImageService from "../../services/ImageService";
import BCFAPIService from "../../services/BCFApIService";

import TopicTable from "./Gallery/TopicTable";
import PubSub from "pubsub-js";

class SnapShotThumbnail {
  private uri: string;
  private guid: any;
  private topic_guid: any;

  constructor(thumbnail_uri: string, guid: any, topic_guid: any) {
    this.uri = thumbnail_uri;
    this.guid = guid;
    this.topic_guid = topic_guid;
  }
}

export default function Gallery() {
  const [viewpoints, setViewpoints] = useState<any[]>([]);
  const [large_image_uri, setLarge_image_uri] = useState<string>("Icon_v2.svg");
  const [active_topic, setActive_topic] = useState<any>(null);
  const [screen, setScreen] = useState<number>(0);
  const [Offcanvas, setOffcanvas] = useState<boolean>(true);

  function subViewpointSelected(msg: any, data: { id: string }) {
    let imageservice: ImageService = new ImageService();
    viewpoints.forEach((viewpoint) => {
      console.log(data.id.split("/")[data.id.split("/").length - 1]);
      if (
        viewpoint.guid === data.id.split("/")[data.id.split("/").length - 1]
      ) {
        // @ts-ignore  // null handled above
        imageGalleryView_instance.setState({ screen: 1 });
        // @ts-ignore
        let image = imageGalleryView_instance.imageservice.getImageData4GUID(
          viewpoint.guid
        );
        // @ts-ignore
        imageGalleryView_instance.setState({
          active_topic: viewpoint.topic_guid,
        });
        PubSub.publish("SelectedTopicID", { topic_guid: viewpoint.topic_guid });
        image.then((img: any) => {
          if (img.size > 0) {
            let url = URL.createObjectURL(img);
            // @ts-ignore
            imageGalleryView_instance.setState({ large_image_uri: url });
          }
        });
      }
    });

    setScreen(1);
  }

  function imageslist1() {
    let imageservice: ImageService = new ImageService();
    return viewpoints.map((s) => (
      <img
        className={"image"}
        key={s.uri}
        src={s.uri}
        alt={""}
        onClick={() => {
          setScreen(1);

          let image = imageservice.getImageData4GUID(s.guid);
          setActive_topic(s.topic_guid);
          PubSub.publish("SelectedTopicID", { topic_guid: s.topic_guid });
          image.then((img: any) => {
            if (img.size > 0) {
              let url = URL.createObjectURL(img);
              setLarge_image_uri(url);
            }
          });
        }}
      />
    ));
  }

  function gallery() {
    let gallery_content;
    if (screen === 0) {
      // DEFAULT VIEW
      gallery_content = (
        <Container className="caia-fill">
          <Row>
            <div>
              <Row>
                <Col xs={11} md={11}>
                  {imageslist1()}
                </Col>
              </Row>
            </div>
          </Row>
        </Container>
      );
    }
    if (screen === 1) {
      gallery_content = (
        <div>
          <Container>
            <div>
              {/*  //TODO variant="black" does not exist
                                                 // @ts-ignore */}
              <CloseButton variant="white" onClick={() => setScreen(0)} />
            </div>
            <div>
              <div className="image-div">
                <Figure className="image-div">
                  <Figure.Image
                    className="rounded mx-auto d-block"
                    width={300}
                    height={400}
                    alt="300x400"
                    src={large_image_uri}
                    onClick={() => setScreen(1)}
                  />
                  <Figure.Caption></Figure.Caption>
                </Figure>
              </div>
              <TopicTable topic_guid={active_topic} />
            </div>
          </Container>
        </div>
      );
    }
    return gallery_content;
  }

  useEffect(() => {
    console.log("Mount");
    init();
  }, []);

  function init() {
    let bcfapi = new BCFAPIService();
    let imageservice: ImageService = new ImageService();
    bcfapi
      .getAllViewPoints()
      .then((value) => {
        value.forEach((viewpoint: { guid: string; topic_guid: string }) => {
          let snapshot = imageservice.getThumbnailData(viewpoint.guid);
          snapshot.then((img: any) => {
            if (img.size > 0) {
              let url = URL.createObjectURL(img);
              let joined = viewpoints.concat(
                new SnapShotThumbnail(url, viewpoint.guid, viewpoint.topic_guid)
              );
              setViewpoints(joined);
            }
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="caia-fill caia-background">
      <div className="yscroll">{gallery()}</div>
      <Container
        style={{ display: "flex", width: "100%", justifyContent: "center" }}
        sx={(theme) => ({ backgroundColor: theme.colors.dark })}
      >
        <button className="btn-caia-icon">
          <i className="icon bi-funnel btn-caia-icon-size" />
        </button>
        <button className="btn-caia-icon">
          <i className="icon bi-plus-square btn-caia-icon-size" />
        </button>
      </Container>
    </div>
  );
}
