//import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useEffect, useState } from "react";
import Figure from "react-bootstrap/Figure";
import CloseButton from "react-bootstrap/CloseButton";
import { Container } from "@mantine/core";

import ImageService from "../../services/ImageService";
import BCFAPI from "../../services/BCFAPI";

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
  const [imageslist, setImageslist] = useState<any[]>([]);
  const [large_image_uri, setLarge_image_uri] = useState<string>("Icon_v2.svg");
  const [active_topic, setActive_topic] = useState<any>(null);
  const [screen, setScreen] = useState<number>(0);

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
                  {imageslist}
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
              <CloseButton onClick={() => setScreen(0)} />
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
                  <Figure.Caption />
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
    console.log("Test");
    init();
    return () => {
      setImageslist([]);
      setLarge_image_uri("Icon_v2.svg");
      setActive_topic(null);
      setScreen(0);
    };
  }, []);

  let viewpoints: any[] = [];
  function init() {
    let bcfapi = new BCFAPI();
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
              viewpoints = joined;
              fetchImagesList(joined);
            }
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Async operation is much quicker that sync even though it updates the screen many times

  function fetchImagesList(viewpoints_list: any[]) {
    let imageservice: ImageService = new ImageService();
    setImageslist(
      viewpoints_list.map((s) => (
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
      ))
    );
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
