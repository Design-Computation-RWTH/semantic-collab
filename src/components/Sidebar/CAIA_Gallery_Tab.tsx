import React, { useEffect, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import {
  Container,
  Image,
  SimpleGrid,
  ScrollArea,
  Button,
  Modal,
} from "@mantine/core";

import ImageService from "../../services/ImageService";
import BCFAPI from "../../services/BCFAPI";

import TopicTable from "./Gallery/TopicTable";
import PubSub from "pubsub-js";
import fileDownload from "js-file-download";
import { Project } from "../../services/types/BCFXML_Types";
var xml_convert = require("xml-js");
(window as any).global = window;

// for the JSON-XML conversion:
// @ts-ignore
window.Buffer = window.Buffer || require("buffer").Buffer;

// To create BCF XML ZIP
var JSZip = require("jszip");

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

export default function CAIA_Gallery_Tab() {
  const [imageslist, setImageslist] = useState<any[]>([]);
  const [large_image_uri, setLarge_image_uri] = useState<string>("Icon_v2.svg");
  const [active_topic, setActive_topic] = useState<any>(null);
  const [screen, setScreen] = useState<number>(0);
  const [opened, setOpened] = useState(false);

  function gallery() {
    let gallery_content;
    if (screen === 0) {
      gallery_content = (
        <SimpleGrid
          style={{ padding: 10 }}
          cols={4}
          spacing="xs"
          breakpoints={[
            { maxWidth: 1600, cols: 3, spacing: "xs" },
            { maxWidth: 1200, cols: 2, spacing: "xs" },
            { maxWidth: 800, cols: 1, spacing: "xs" },
          ]}
        >
          {imageslist}
        </SimpleGrid>
      );
    }
    if (screen === 1) {
      gallery_content = (
        <div
          style={{
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Container>
            <div>
              {/*  //TODO variant="black" does not exist
                                                 // @ts-ignore */}
              <CloseButton onClick={() => setScreen(0)} />
            </div>

            <Modal
              size={"720"}
              opened={opened}
              onClose={() => setOpened(false)}
            >
              <Image
                width={700}
                height={700}
                fit="contain"
                src={large_image_uri}
                withPlaceholder
              />
            </Modal>

            <Button
              style={{
                height: 300,
                width: 300,
                justifyContent: "center",
                display: "flex",
                backgroundColor: "#00000000",
              }}
              onClick={() => {
                setOpened(true);
                console.log("Hello World");
              }}
            >
              <Image
                width={300}
                height={300}
                fit="contain"
                src={large_image_uri}
                withPlaceholder
              />
            </Button>
            <TopicTable topic_guid={active_topic} />
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
        <Image
          width={100}
          height={100}
          radius={5}
          key={s.uri}
          src={s.uri}
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

  function downloadBCF() {
    var zip = new JSZip();
    zip.file("hello.txt", "Hello[p my)6cxsw2q");
    let p: Project = {};
    p.Name = "jkajakjkas";
    let options = { compact: true, ignoreComment: true, spaces: 4 };
    let value = xml_convert.json2xml(p, options);
    console.log("val:" + value);
    zip
      .generateAsync({ type: "uint8array" })
      .then((z: string | ArrayBuffer | ArrayBufferView | Blob) => {
        fileDownload(z, "BCF.zip");
      });
  }

  return (
    <div style={{ height: "100%" }} className="caia-fill">
      <ScrollArea
        style={{
          position: "relative",
          height: "95%",
        }}
      >
        {gallery()}
      </ScrollArea>
      <Container
        style={{
          height: "5%",
          display: "flex",
          width: "100%",
          justifyContent: "center",
        }}
        sx={(theme) => ({ backgroundColor: theme.colors.dark })}
      >
        <button className="btn-caia-icon">
          <i className="icon bi-funnel btn-caia-icon-size" />
        </button>
        <button className="btn-caia-icon">
          <i className="icon bi-plus-square btn-caia-icon-size" />
        </button>
        <button
          className="btn-caia-icon"
          onClick={() => {
            downloadBCF();
          }}
        >
          <span
            onClick={() => {
              downloadBCF();
            }}
            className="bcficon"
          ></span>
        </button>
      </Container>
    </div>
  );
}
